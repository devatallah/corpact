<?php

namespace App\Services\Payments;

use App\Enums\EventStatus;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\GatewayTransaction;
use App\Models\Partner;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Messaging\Channels\MessageChannel;
use App\Services\Payments\Gateway\PaymentGatewayManager;
use App\Services\Wallet\LedgerService;
use App\Support\Money;
use App\Support\Notify;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * دورة التحصيل (H §12.3) — بديل EventCollectionStub:
 *
 * 1) أثناء التسجيل لا تحصيل — payment_status = not_due (يحرسه A7).
 * 2) عند الإغلاق: تثبيت العدد، الدعم الفعلي = min(المحدد، الرصيد، الإجمالي)
 *    ويُحجز wallet_hold، والحصة النهائية = المتبقي ÷ العدد (floor) وتُقفل.
 *    **السقف المعلن ملزم**: حصة تتجاوزه ⇒ إلغاء بلا أي استقطاع.
 * 3) مطالبة لكل مشارك (payment_intent + payment_status = due) برابط دفع
 *    موقّع عبر MessageChannel؛ النافذة 120 دقيقة أو حتى 6 ساعات قبل البدء
 *    أيهما أقرب.
 * 4) المقعد محجوز طوال النافذة؛ إغلاق الصفحة لا يلغي شيئاً — يُستأنف من
 *    الرابط نفسه.
 * 5) من لم يدفع عند الانقضاء: مقعده يُخلى ويُعرض على بدلاء قائمة الانتظار
 *    (الأسبق يفوز بمهلة قصيرة) ومطالبته تُلغى.
 * 6) اكتمال الدعم وكل الحصص ⇒ استقطاع الحجز ثم confirmed مع ملء الحقول
 *    المالية في event_snapshot.
 *
 * لا تحصيل عند الانضمام أبداً، لا تحصيل مرتين (مفتاح تفرّد لكل مطالبة +
 * فريدة event+employee)، لا زيادة مبلغ بعد الدفع (المبلغ مقفل على المطالبة).
 */
class CollectionService
{
    public function __construct(
        private LedgerService $ledger,
        private FundingService $funding,
        private EventStateMachine $machine,
        private ParticipationService $participation,
        private PaymentGatewayManager $gateways,
        private MessageChannel $messages,
        private EventRefundService $refunds,
    ) {}

    /**
     * بدء التحصيل عند إغلاق التسجيل — الفعالية awaiting_payment والعدد مثبت.
     */
    public function beginCollection(Event $event): void
    {
        DB::transaction(function () use ($event) {
            /** @var Event $locked */
            $locked = Event::withoutGlobalScopes()->whereKey($event->id)->lockForUpdate()->firstOrFail();

            if ((string) $locked->status !== EventStatus::AwaitingPayment->value || $locked->final_share_halalas !== null) {
                return; // بدأ من قبل أو خرجت من مسار التحصيل
            }

            $community = $locked->community;
            if ($community === null) {
                throw new RuntimeException('فعالية بلا مجتمع لا تدخل التحصيل.');
            }

            $total = (int) $locked->total_amount_halalas;
            $count = max(1, (int) $locked->participants_count);

            // الدعم الفعلي: min(المخطط، الرصيد المتاح، الإجمالي) — بقفل صف المحفظة.
            $wallet = Wallet::subFor($community);
            $available = (int) Wallet::query()->withoutGlobalScopes()
                ->whereKey($wallet->id)->lockForUpdate()->value('balance_halalas');

            $subsidy = $this->funding->subsidyAtClose($locked, $available);
            $split = Money::splitShare($total - $subsidy, $count);

            // «وعد ملزم» (H §12.2/§12.3): الحصة المحسوبة تتجاوز السقف المعلن
            // (رصيد أقل من الدعم الموعود) ⇒ إلغاء بلا أي استقطاع من أحد.
            if ($split['share'] > (int) $locked->max_share_halalas) {
                $this->machine->collectionFailed(
                    $locked,
                    sprintf(
                        'رصيد المحفظة لا يكفي الدعم والحصة المعادة (%s) تتجاوز السقف المعلن (%s) — أُلغيت بلا أي استقطاع (H §12.3)',
                        Money::format($split['share']),
                        Money::format((int) $locked->max_share_halalas),
                    ),
                );
                $locked->forceFill(['funding_status' => 'cancelled_ceiling_exceeded'])->save();
                $this->notifyCeilingCancellation($locked);

                return;
            }

            // حجز الدعم wallet_hold (H §12.3 بند 2).
            if ($subsidy > 0) {
                $this->ledger->hold(
                    $wallet,
                    $subsidy,
                    "event:{$locked->id}:subsidy-hold",
                    $locked,
                    null,
                    'حجز دعم المجتمع عند إغلاق التسجيل (H §12.3)',
                );
            }

            $locked->forceFill([
                'subsidy_halalas' => $subsidy,
                'final_share_halalas' => $split['share'],
                'rounding_remainder_halalas' => $split['remainder'],
                'collection_deadline_at' => $this->paymentWindowDeadline($locked),
                'funding_status' => 'collecting',
                'budget_deducted_at' => null,
            ])->save();

            if ($split['share'] === 0) {
                // المسار أ: الدعم يغطي كل شيء — لا مطالبات، استقطاع فوري وتأكيد.
                $this->finalize($locked);

                return;
            }

            foreach ($locked->reservedParticipants()->get() as $employee) {
                $this->createIntentAndDemand($locked, $employee->id);
            }
        });
    }

    /**
     * إنشاء مطالبة مشارك + payment_status = due + مطالبة برابط موقّع.
     * idempotent: مطالبة قائمة لنفس (الفعالية، الموظف) تُعاد كما هي.
     */
    public function createIntentAndDemand(Event $locked, int $employeeId, ?Carbon $deadline = null): PaymentIntent
    {
        $existing = PaymentIntent::query()
            ->where('event_id', $locked->id)
            ->where('employee_id', $employeeId)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $share = (int) $locked->final_share_halalas;
        $vat = Money::decomposeVat($share);

        $intent = PaymentIntent::create([
            'event_id' => $locked->id,
            'employee_id' => $employeeId,
            'company_id' => $locked->company_id,
            'amount_halalas' => $share,
            'base_amount_halalas' => $vat['base'],
            'vat_amount_halalas' => $vat['vat'],
            'currency' => Money::CURRENCY,
            'status' => PaymentIntent::STATUS_PENDING,
            'gateway' => $this->gateways->defaultGatewayName(),
            // القاعدة 5: مفتاح تفرّد لكل عملية دفع — لا تحصيل مرتين.
            'idempotency_key' => "event:{$locked->id}:participant:{$employeeId}:share",
            'expires_at' => $deadline ?? $locked->collection_deadline_at ?? $this->paymentWindowDeadline($locked),
        ]);

        $this->setParticipantPaymentStatus($locked, $employeeId, 'due', 'أُغلق التسجيل وثُبّتت الحصة — مطالبة دفع خلال النافذة');

        $this->sendPaymentDemand($intent);

        return $intent;
    }

    /**
     * مطالبة الدفع (H §12.3 بند 3): رسالة برابط دفع موقّع + إشعار داخل
     * المنصة. قناة واتساب الفعلية درايفر A14 خلف MessageChannel نفسه.
     */
    private function sendPaymentDemand(PaymentIntent $intent): void
    {
        $employee = Employee::withoutGlobalScopes()->find($intent->employee_id);
        $event = $intent->event ?? Event::withoutGlobalScopes()->find($intent->event_id);
        $url = $intent->signedPaymentUrl();
        $amount = Money::format((int) $intent->amount_halalas);
        $deadline = $intent->expires_at->timezone('Asia/Riyadh')->format('H:i');

        // A14: نداء واحد يغطي الإشعار داخل المنصة **و** الرسالة الخارجية عبر
        // سلسلة القنوات (واتساب ← SMS)؛ النص كله في قالب `payment.demand`.
        Notify::sendToId(
            'payment.demand',
            Employee::class,
            (int) $intent->employee_id,
            [
                'community' => $event?->community?->name,
                'amount' => $amount,
                'deadline' => $deadline,
                'url' => $url,
            ],
            [
                'purpose' => 'payment_demand',
                'phone' => $employee?->phone,
                'data' => ['event_id' => $intent->event_id, 'payment_intent_id' => $intent->id, 'payment_url' => $url],
            ],
        );
    }

    /**
     * نافذة الدفع: 120 دقيقة أو حتى 6 ساعات قبل البدء أيهما أقرب (H §12.3).
     * موعد أقرب من 6 ساعات: حتى وقت البدء (قرار تفسيري موثق في divergences).
     */
    public function paymentWindowDeadline(Event $event): Carbon
    {
        $config = config('payments.collection');
        $window = now()->addMinutes((int) $config['window_minutes']);
        $cutoff = $event->startsAt()->subHours((int) $config['window_min_hours_before_start']);

        $deadline = $window->min($cutoff);

        if ($deadline->lte(now())) {
            $deadline = $window->min($event->startsAt());
        }

        return $deadline;
    }

    /**
     * تعليم مطالبة مدفوعة (من الويبهوك أو العودة المتزامنة) — idempotent:
     * نفس الدفعة لا تُعلَّم مرتين ولا تنشئ أثراً مزدوجاً.
     */
    public function markIntentPaid(PaymentIntent $intent, ?string $gatewayReference = null): void
    {
        DB::transaction(function () use ($intent, $gatewayReference) {
            /** @var PaymentIntent $locked */
            $locked = PaymentIntent::query()->lockForUpdate()->findOrFail($intent->id);

            if ($locked->status === PaymentIntent::STATUS_PAID) {
                return; // مدفوعة من قبل — لا أثر ثانٍ
            }

            if (! in_array($locked->status, [PaymentIntent::STATUS_PENDING], true)) {
                throw new RuntimeException('المطالبة ليست قيد الدفع — الوصول المتأخر مساره handleLatePayment.');
            }

            $locked->forceFill([
                'status' => PaymentIntent::STATUS_PAID,
                'paid_at' => now(),
                'gateway_reference' => $gatewayReference ?? $locked->gateway_reference,
            ])->save();

            $this->recordGatewaySuccess($locked);

            /** @var Event $event */
            $event = Event::withoutGlobalScopes()->whereKey($locked->event_id)->lockForUpdate()->firstOrFail();

            $this->setParticipantPaymentStatus($event, (int) $locked->employee_id, 'paid', 'دُفعت الحصة عبر البوابة');

            $this->evaluate($event);
        });

        $intent->refresh();
    }

    /**
     * تقييم اكتمال التحصيل — يُستدعى بعد كل دفعة وبعد كل انقضاء، داخل معاملة
     * تحمل قفل صف الفعالية:
     *
     * - مطالبات قائمة أو عروض بدلاء فعالة ⇒ ننتظر.
     * - الجميع دفع والعدد كما ثُبِّت ⇒ استقطاع الحجز + confirmed.
     * - الجميع دفع والعدد نقص لكنه ≥ الحد ⇒ الحصص المقفلة لا تتغير: يُغطى
     *   العجز من محفظة المجتمع إن وُجد رصيد وإلا إلغاء + رد كل ما حُصِّل.
     * - العدد (المدفوع + الممكن) دون الحد ⇒ cancelled_payment_failed + رد كل
     *   ما حُصِّل + فك الحجز + إبلاغ المزوّد.
     */
    public function evaluate(Event $lockedEvent): void
    {
        if ((string) $lockedEvent->status !== EventStatus::AwaitingPayment->value) {
            return;
        }

        $reservedIds = EventParticipant::query()
            ->where('event_id', $lockedEvent->id)
            ->where('seat_status', 'reserved')
            ->pluck('employee_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $intents = PaymentIntent::query()
            ->where('event_id', $lockedEvent->id)
            ->whereIn('employee_id', $reservedIds)
            ->get();

        $paid = $intents->where('status', PaymentIntent::STATUS_PAID)->count();
        $pending = $intents
            ->where('status', PaymentIntent::STATUS_PENDING)
            ->filter(fn (PaymentIntent $intent) => $intent->expires_at->isFuture())
            ->count();

        $activeOffers = EventParticipant::query()
            ->where('event_id', $lockedEvent->id)
            ->where('seat_status', 'waitlisted')
            ->whereNotNull('offer_expires_at')
            ->where('offer_expires_at', '>=', now())
            ->count();

        $unoffered = EventParticipant::query()
            ->where('event_id', $lockedEvent->id)
            ->where('seat_status', 'waitlisted')
            ->whereNull('offered_at')
            ->count();

        $fixedCount = max(1, (int) $lockedEvent->participants_count);
        $min = max(1, (int) $lockedEvent->min_participants);

        // مقاعد شاغرة وبدلاء لم يُعرض عليهم بعد ⇒ اعرض قبل أي حسم.
        $freeSeats = $fixedCount - count($reservedIds) - $activeOffers;
        if ($freeSeats > 0 && $unoffered > 0) {
            $this->offerSeatsToSubstitutes($lockedEvent, $freeSeats);
            $activeOffers = min($fixedCount - count($reservedIds), $activeOffers + min($freeSeats, $unoffered));
        }

        if ($pending > 0 || $activeOffers > 0) {
            return; // النافذة ما زالت مفتوحة لأحد
        }

        // لا مطالبات معلقة ولا عروض: هل دفع كل المحجوزين الباقين؟
        if ($paid < count($reservedIds)) {
            return; // مطالبات منقضية لم يعالجها expireOverdue بعد — هي من يخلي المقاعد
        }

        if ($paid >= $min && $paid === $fixedCount) {
            $this->finalize($lockedEvent);

            return;
        }

        if ($paid >= $min) {
            // عجز تحصيل والعدد فوق الحد: الحصص المقفلة لا تتغير (H §12.3) —
            // يُغطى العجز من محفظة المجتمع إن وُجد رصيد وإلا الإلغاء والرد.
            $shortfall = (int) $lockedEvent->final_share_halalas * ($fixedCount - $paid);

            if ($this->coverShortfallFromWallet($lockedEvent, $shortfall)) {
                $this->finalize($lockedEvent);
            } else {
                $this->failCollection(
                    $lockedEvent,
                    'عجز تحصيل بعد فشل دفع بعض الحصص ولا رصيد في محفظة المجتمع لتغطيته — أُلغيت الفعالية ورُدّ كل ما حُصِّل',
                );
            }

            return;
        }

        $this->failCollection(
            $lockedEvent,
            "نزل العدد الدافع ({$paid}) تحت الحد الأدنى ({$min}) بعد فشل الدفع — cancelled_payment_failed مع رد كل ما حُصِّل وفك حجز الدعم",
        );
    }

    /**
     * انقضاء مهل الدفع — تشغّلها app:expire-payment-deadlines كل دقيقة:
     * غير الدافع يُخلى مقعده ويُعرض على البديل بمهلة قصيرة وتُلغى مطالبته،
     * وعروض البدلاء المنقضية تنتقل للتالي، ثم يُقيَّم الاكتمال.
     *
     * @return int عدد المطالبات المنقضاة
     */
    public function expireOverdue(): int
    {
        $expired = 0;

        $eventIds = PaymentIntent::query()
            ->where('status', PaymentIntent::STATUS_PENDING)
            ->where('expires_at', '<', now())
            ->distinct()
            ->pluck('event_id')
            // عروض بدلاء منقضية بعد الإغلاق تحتاج نفس المعالجة
            ->merge(
                EventParticipant::query()
                    ->where('seat_status', 'waitlisted')
                    ->whereNotNull('offer_expires_at')
                    ->where('offer_expires_at', '<', now())
                    ->whereHas('event', fn ($q) => $q->where('status', EventStatus::AwaitingPayment->value))
                    ->distinct()
                    ->pluck('event_id'),
            )
            ->unique();

        foreach ($eventIds as $eventId) {
            $expired += DB::transaction(function () use ($eventId) {
                /** @var Event|null $locked */
                $locked = Event::withoutGlobalScopes()->whereKey($eventId)->lockForUpdate()->first();

                if ($locked === null || (string) $locked->status !== EventStatus::AwaitingPayment->value) {
                    return 0;
                }

                $count = 0;

                $overdue = PaymentIntent::query()
                    ->where('event_id', $locked->id)
                    ->where('status', PaymentIntent::STATUS_PENDING)
                    ->where('expires_at', '<', now())
                    ->lockForUpdate()
                    ->get();

                foreach ($overdue as $intent) {
                    $this->expireIntent($locked, $intent);
                    $count++;
                }

                // عروض بدلاء منقضية ← released وينتقل العرض للتالي.
                $lapsedOffers = EventParticipant::query()
                    ->where('event_id', $locked->id)
                    ->where('seat_status', 'waitlisted')
                    ->whereNotNull('offer_expires_at')
                    ->where('offer_expires_at', '<', now())
                    ->get();

                foreach ($lapsedOffers as $row) {
                    $this->participation->logChange($locked, (int) $row->employee_id, 'seat_status', 'waitlisted', 'released', null, 'انقضت مهلة عرض البديل دون قبول');
                    $row->forceFill(['seat_status' => 'released', 'position' => null, 'offered_at' => null, 'offer_expires_at' => null])->save();
                }

                $this->evaluate($locked);

                return $count;
            });
        }

        return $expired;
    }

    /**
     * ترقية بديل قبل عرض المقعد بعد الإغلاق (يستدعيها ParticipationService
     * بعد promote داخل معاملة القفل): مطالبة دفع فورية بمهلة البديل القصيرة.
     */
    public function enrollSubstitute(Event $lockedEvent, int $employeeId): void
    {
        if ((string) $lockedEvent->status !== EventStatus::AwaitingPayment->value
            || $lockedEvent->final_share_halalas === null
            || (int) $lockedEvent->final_share_halalas === 0) {
            return;
        }

        $deadline = now()
            ->addMinutes((int) config('payments.collection.substitute_offer_minutes', 30))
            ->min($lockedEvent->startsAt());

        $this->createIntentAndDemand($lockedEvent, $employeeId, $deadline);
    }

    // ------------------------------------------------------------------

    /**
     * إخلاء مقعد غير الدافع عند انقضاء مهلته (H §12.3 بند 5) داخل معاملة
     * قفل الفعالية: مطالبته expired + payment_status = failed + المقعد
     * released ويُعرض على أول بديل بمهلة قصيرة.
     */
    private function expireIntent(Event $locked, PaymentIntent $intent): void
    {
        $intent->forceFill([
            'status' => PaymentIntent::STATUS_EXPIRED,
            'cancelled_at' => now(),
        ])->save();

        $employeeId = (int) $intent->employee_id;

        $this->setParticipantPaymentStatus($locked, $employeeId, 'failed', 'انقضت مهلة الدفع دون سداد');

        $row = EventParticipant::query()
            ->where('event_id', $locked->id)
            ->where('employee_id', $employeeId)
            ->first();

        if ($row !== null && $row->seat_status === 'reserved') {
            $this->participation->logChange($locked, $employeeId, 'seat_status', 'reserved', 'released', null, 'أُخلي المقعد لعدم الدفع خلال النافذة');
            $row->forceFill(['seat_status' => 'released'])->save();
        }

        Notify::sendToId(
            'payment.deadline_expired',
            Employee::class,
            (int) $employeeId,
            [],
            ['data' => ['event_id' => $locked->id]],
        );

        $this->offerSeatsToSubstitutes($locked, 1);
    }

    /**
     * عرض المقاعد الشاغرة على بدلاء قائمة الانتظار بعد الإغلاق — FIFO بمهلة
     * قصيرة (الأسبق يفوز). الصفوف بقيت waitlisted عمداً عند إغلاق القائمة.
     */
    private function offerSeatsToSubstitutes(Event $locked, int $seats): void
    {
        $minutes = (int) config('payments.collection.substitute_offer_minutes', 30);
        $expiresAt = now()->addMinutes($minutes)->min($locked->startsAt());

        if ($expiresAt->lte(now())) {
            return; // لا وقت لعرض بديل
        }

        $candidates = EventParticipant::query()
            ->where('event_id', $locked->id)
            ->where('seat_status', 'waitlisted')
            ->whereNull('offered_at')
            ->orderBy('position')
            ->limit($seats)
            ->get();

        foreach ($candidates as $candidate) {
            $candidate->forceFill(['offered_at' => now(), 'offer_expires_at' => $expiresAt])->save();

            Notify::sendToId(
                'waitlist.offer',
                Employee::class,
                (int) $candidate->employee_id,
                ['minutes' => $minutes],
                ['data' => ['event_id' => $locked->id]],
            );

            $this->participation->logChange($locked, (int) $candidate->employee_id, 'seat_status', 'waitlisted', 'waitlisted', null, "عُرض مقعد بديل بعد الإغلاق بمهلة {$minutes} دقيقة");
        }
    }

    /**
     * تغطية عجز التحصيل من محفظة المجتمع (H §12.3): حجز + استقطاع بمفتاح
     * تفرّد، بلا أي مساس بالحصص المقفلة. false إذا لم يكف الرصيد.
     */
    private function coverShortfallFromWallet(Event $locked, int $shortfallHalalas): bool
    {
        if ($shortfallHalalas <= 0) {
            return true;
        }

        $community = $locked->community;
        if ($community === null) {
            return false;
        }

        $wallet = Wallet::subFor($community);
        $available = (int) Wallet::query()->withoutGlobalScopes()
            ->whereKey($wallet->id)->lockForUpdate()->value('balance_halalas');

        if ($available < $shortfallHalalas) {
            return false;
        }

        $hold = $this->ledger->hold(
            $wallet,
            $shortfallHalalas,
            "event:{$locked->id}:shortfall-cover",
            $locked,
            null,
            'تغطية عجز تحصيل من محفظة المجتمع — الحصص المقفلة لا تتغير (H §12.3)',
        );
        $this->ledger->captureHold($hold, null, null, 'استقطاع تغطية عجز التحصيل');

        $locked->forceFill(['shortfall_covered_halalas' => $shortfallHalalas])->save();

        return true;
    }

    /**
     * اكتمال التحصيل: استقطاع حجز الدعم ثم confirmed — الآلة تكتب
     * event_snapshot بالحقول المالية النهائية (تُقرأ من أعمدة الهللات).
     */
    private function finalize(Event $locked): void
    {
        $hold = WalletHold::query()
            ->where('idempotency_key', "event:{$locked->id}:subsidy-hold")
            ->first();

        if ($hold !== null && $hold->status === WalletHold::STATUS_ACTIVE) {
            $this->ledger->captureHold($hold, null, null, 'استقطاع دعم المجتمع عند اكتمال التحصيل (H §12.3)');
        }

        $locked->forceFill([
            'funding_status' => 'collected',
            'budget_deducted_at' => now(),
        ])->save();

        $this->machine->collectionComplete($locked);
    }

    /**
     * فشل التحصيل ⇒ cancelled_payment_failed + رد كل ما حُصِّل لوسيلة الدفع
     * الأصلية + فك حجز الدعم + إبلاغ المزوّد (H §12.3).
     */
    private function failCollection(Event $locked, string $reason): void
    {
        $this->machine->collectionFailed($locked, $reason);
        $locked->forceFill(['funding_status' => 'collection_failed'])->save();

        $this->refunds->refundEventCollections($locked, 'فشل تحصيل جماعي — استرداد كامل (H §12.4)');

        if ($locked->partner_id !== null) {
            Notify::sendToId(
                'event.collection_failed.partner',
                Partner::class,
                (int) $locked->partner_id,
                ['event_id' => $locked->id],
                ['data' => ['event_id' => $locked->id]],
            );
        }

        foreach ($locked->participants()->get() as $participant) {
            Notify::send(
                'event.collection_failed.participant',
                $participant,
                [],
                ['data' => ['event_id' => $locked->id]],
            );
        }
    }

    private function notifyCeilingCancellation(Event $locked): void
    {
        foreach ($locked->reservedParticipants()->pluck('employees.id') as $employeeId) {
            Notify::sendToId(
                'event.cancelled.no_charge',
                Employee::class,
                (int) $employeeId,
                [],
                ['data' => ['event_id' => $locked->id]],
            );
        }
    }

    /**
     * كتابة payment_status على صف المشارك + سطر participant_events (H §10).
     */
    private function setParticipantPaymentStatus(Event $event, int $employeeId, string $status, string $reason): void
    {
        $row = EventParticipant::query()
            ->where('event_id', $event->id)
            ->where('employee_id', $employeeId)
            ->first();

        if ($row === null || $row->payment_status === $status) {
            return;
        }

        $from = $row->payment_status;
        $row->forceFill(['payment_status' => $status])->save();
        $this->participation->logChange($event, $employeeId, 'payment_status', $from, $status, null, $reason);
    }

    /**
     * صف نجاح دفعة في gateway_transactions — idempotent بمفتاح التفرّد.
     */
    private function recordGatewaySuccess(PaymentIntent $intent): void
    {
        $key = "{$intent->idempotency_key}:payment";

        if (GatewayTransaction::query()->where('idempotency_key', $key)->exists()) {
            return;
        }

        try {
            GatewayTransaction::create([
                'payment_intent_id' => $intent->id,
                'type' => GatewayTransaction::TYPE_PAYMENT,
                'gateway' => $intent->gateway ?? $this->gateways->defaultGatewayName(),
                'gateway_reference' => $intent->gateway_reference,
                'amount_halalas' => (int) $intent->amount_halalas,
                'status' => GatewayTransaction::STATUS_SUCCEEDED,
                'idempotency_key' => $key,
            ]);
        } catch (UniqueConstraintViolationException) {
            Log::info("سباق على تسجيل دفعة المطالبة #{$intent->id} — القيد موجود.");
        }
    }
}

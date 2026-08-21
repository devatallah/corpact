<?php

namespace App\Services\Payments;

use App\Enums\WalletTransactionType;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\GatewayTransaction;
use App\Models\ParticipantEvent;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Audit\AuditLogService;
use App\Services\Notifications\CriticalAlertService;
use App\Services\Payments\Gateway\PaymentGatewayManager;
use App\Services\Wallet\LedgerService;
use App\Support\Audit\AuditAction;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * مصفوفة الاسترداد (H §12.4) — بديل نسب 100/50/0 القديمة المحذوفة:
 *
 * - استرداد **كامل** في: إلغاء المزوّد · إلغاء الشركة · عدم بلوغ الحد
 *   الأدنى · فشل تحصيل جماعي · إلغاء إداري من تيمات.
 * - **لا استرداد** في: انسحاب بعد إغلاق التسجيل (ممنوع أصلاً في A7)،
 *   وعدم الحضور (أثره A12) — لا مسار جزئياً بينهما.
 * - كل استرداد لوسيلة الدفع الأصلية عبر البوابة — لا محفظة نقدية للموظف
 *   أبداً (قرار تنظيمي H §12.4).
 * - الاسترداد ذري: قيد عكسي (صف gateway_transactions refund مرتبط بصف
 *   الدفعة / قيد refund في دفتر المحفظة مرتبط بالاستقطاع) + طلب البوابة +
 *   مفتاح تفرّد يمنع التكرار.
 * - فشل الاسترداد لا يُترك صامتاً: refund_status = failed يظهر في قائمة
 *   الأدمن المالي مع إعادة محاولة آلية.
 */
class EventRefundService
{
    public function __construct(
        private LedgerService $ledger,
        private PaymentGatewayManager $gateways,
    ) {}

    /**
     * استرداد كامل لكل ما حُصِّل على فعالية (مدفوعات الموظفين + استقطاعات
     * محفظة المجتمع) وفك أي حجوزات قائمة. يُستدعى من كل حالات الاسترداد
     * الكامل الخمس. idempotent بمفاتيح تفرّد لكل ساق.
     */
    public function refundEventCollections(Event $event, string $reason, ?int $actorUserId = null): void
    {
        // 1) فك الحجوزات النشطة (دعم لم يُستقطع بعد).
        foreach (["event:{$event->id}:subsidy-hold", "event:{$event->id}:shortfall-cover"] as $key) {
            $hold = WalletHold::query()->where('idempotency_key', $key)->first();
            if ($hold !== null && $hold->status === WalletHold::STATUS_ACTIVE) {
                $this->ledger->releaseHold($hold, $actorUserId, $reason);
            }
        }

        // 2) عكس الاستقطاعات المستقطعة فعلاً — قيد refund مرتبط بالأصل،
        //    مسقوف بمبلغه (يشمل مفتاح budget-capture القديم للفعاليات المرحّلة).
        $captureKeys = [
            "capture:event:{$event->id}:subsidy-hold" => "event:{$event->id}:subsidy-refund",
            "capture:event:{$event->id}:shortfall-cover" => "event:{$event->id}:shortfall-refund",
            "event:{$event->id}:budget-capture" => "event:{$event->id}:cancellation-refund",
        ];

        foreach ($captureKeys as $captureKey => $refundKey) {
            $capture = WalletTransaction::query()->where('idempotency_key', $captureKey)->first();

            if ($capture === null || $event->community === null) {
                continue;
            }

            $this->ledger->credit(
                Wallet::subFor($event->community),
                WalletTransactionType::Refund,
                $capture->amount_halalas,
                $refundKey,
                [
                    'reference' => $event,
                    'actorUserId' => $actorUserId,
                    'relatedTransactionId' => $capture->id,
                    'note' => "استرداد كامل — {$reason}",
                ],
            );
        }

        // 3) رد كل مطالبة مدفوعة إلى وسيلة الدفع الأصلية عبر البوابة.
        $paidIntents = PaymentIntent::query()
            ->where('event_id', $event->id)
            ->where('status', PaymentIntent::STATUS_PAID)
            ->get();

        foreach ($paidIntents as $intent) {
            $this->refundIntent($intent, $reason);
        }

        // توثيق نسبة الاسترداد على الفعالية (كامل دائماً في المصفوفة الجديدة).
        $refundedTotal = (int) PaymentIntent::query()
            ->where('event_id', $event->id)
            ->whereIn('refund_status', [PaymentIntent::REFUND_REFUNDED, PaymentIntent::REFUND_FAILED, PaymentIntent::REFUND_PENDING])
            ->sum('amount_halalas');

        $event->forceFill([
            'refund_percentage' => 100,
            'refund_amount_halalas' => $refundedTotal,
        ])->save();

        // A15 — H §19: «كل حركة مالية واعتماد تحويل واسترداد» في سجل التدقيق.
        AuditLogService::record(
            action: AuditAction::REFUND_ISSUED,
            entity: $event,
            after: [
                'refund_percentage' => 100,
                'refund_amount_halalas' => $refundedTotal,
                'intents_refunded' => $paidIntents->count(),
            ],
            reason: $reason,
            companyId: $event->company_id,
            actorUserId: $actorUserId,
        );
    }

    /**
     * استرداد مطالبة واحدة كاملة إلى وسيلة الدفع الأصلية — عملية ذرية:
     * صف عكسي مرتبط + نداء البوابة + مفتاح تفرّد. الفشل يوسم المطالبة
     * failed فتظهر في قائمة الأدمن المالي ويعاد المحاولة آلياً.
     */
    public function refundIntent(PaymentIntent $intent, string $reason): bool
    {
        return DB::transaction(function () use ($intent, $reason) {
            /** @var PaymentIntent $locked */
            $locked = PaymentIntent::query()->lockForUpdate()->findOrFail($intent->id);

            if ($locked->status === PaymentIntent::STATUS_REFUNDED
                || $locked->refund_status === PaymentIntent::REFUND_REFUNDED) {
                return true; // مُرد من قبل — لا تكرار
            }

            if ($locked->status !== PaymentIntent::STATUS_PAID) {
                return true; // لم يُدفع شيء فلا شيء يُرد
            }

            $refundKey = $locked->refund_idempotency_key ?? "{$locked->idempotency_key}:refund";

            $locked->forceFill([
                'refund_status' => PaymentIntent::REFUND_PENDING,
                'refund_reason' => $reason,
                'refund_idempotency_key' => $refundKey,
            ])->save();

            $paymentTransaction = GatewayTransaction::query()
                ->where('payment_intent_id', $locked->id)
                ->where('type', GatewayTransaction::TYPE_PAYMENT)
                ->where('status', GatewayTransaction::STATUS_SUCCEEDED)
                ->first();

            try {
                $result = $this->gateways->gateway($locked->gateway)->refund(
                    (string) $locked->gateway_reference,
                    (int) $locked->amount_halalas,
                    $refundKey,
                );
            } catch (Throwable $e) {
                $result = null;
                Log::error("فشل نداء استرداد المطالبة #{$locked->id}: {$e->getMessage()}");
            }

            if ($result !== null && $result->succeeded) {
                // القيد العكسي: صف refund مرتبط بصف الدفعة الأصلي.
                if (! GatewayTransaction::query()->where('idempotency_key', $refundKey)->exists()) {
                    GatewayTransaction::create([
                        'payment_intent_id' => $locked->id,
                        'type' => GatewayTransaction::TYPE_REFUND,
                        'gateway' => $locked->gateway,
                        'gateway_reference' => $result->gatewayReference,
                        'amount_halalas' => (int) $locked->amount_halalas,
                        'status' => GatewayTransaction::STATUS_SUCCEEDED,
                        'idempotency_key' => $refundKey,
                        'related_transaction_id' => $paymentTransaction?->id,
                    ]);
                }

                $locked->forceFill([
                    'status' => PaymentIntent::STATUS_REFUNDED,
                    'refund_status' => PaymentIntent::REFUND_REFUNDED,
                    'refunded_at' => now(),
                ])->save();

                $this->markParticipantRefunded($locked, $reason);
                $this->notifyRefunded($locked);

                AuditLogService::record(
                    action: AuditAction::REFUND_ISSUED,
                    entity: $locked,
                    before: ['status' => PaymentIntent::STATUS_PAID],
                    after: [
                        'status' => PaymentIntent::STATUS_REFUNDED,
                        'amount_halalas' => (int) $locked->amount_halalas,
                        'gateway' => $locked->gateway,
                        'gateway_reference' => $result->gatewayReference,
                    ],
                    reason: $reason,
                );

                return true;
            }

            $locked->forceFill([
                'refund_status' => PaymentIntent::REFUND_FAILED,
                'refund_attempts' => $locked->refund_attempts + 1,
                'refund_last_error' => $result?->error ?? 'استثناء أثناء نداء البوابة',
            ])->save();

            app(CriticalAlertService::class)->raise(
                key: 'payments.refund_failed',
                title: 'فشل استرداد مطالبة',
                body: "المطالبة #{$locked->id} دخلت قائمة فشل الاستردادات.",
                context: ['payment_intent_id' => $locked->id],
            );

            Log::error("فشل استرداد المطالبة #{$locked->id} — دخلت قائمة فشل الاستردادات.", [
                'payment_intent_id' => $locked->id,
                'error' => $result?->error,
            ]);

            AuditLogService::record(
                action: AuditAction::REFUND_FAILED,
                entity: $locked,
                after: [
                    'amount_halalas' => (int) $locked->amount_halalas,
                    'refund_attempts' => (int) $locked->refund_attempts,
                    'error' => $locked->refund_last_error,
                ],
                reason: $reason,
            );

            return false;
        });
    }

    /**
     * إعادة المحاولة الآلية لفشل الاستردادات (مسؤولية يومية للأدمن المالي —
     * القائمة مرئية ولا فشل يُترك صامتاً).
     *
     * @return int عدد ما نجح رده
     */
    public function retryFailedRefunds(): int
    {
        $succeeded = 0;

        $failed = PaymentIntent::query()
            ->where('refund_status', PaymentIntent::REFUND_FAILED)
            ->where('refund_attempts', '<', (int) config('payments.refunds.max_auto_retries', 5))
            ->get();

        foreach ($failed as $intent) {
            if ($this->refundIntent($intent, $intent->refund_reason ?? 'إعادة محاولة استرداد فاشل')) {
                $succeeded++;
            }
        }

        return $succeeded;
    }

    private function markParticipantRefunded(PaymentIntent $intent, string $reason): void
    {
        $event = Event::withoutGlobalScopes()->find($intent->event_id);
        if ($event === null) {
            return;
        }

        $participant = EventParticipant::query()
            ->where('event_id', $event->id)
            ->where('employee_id', $intent->employee_id)
            ->first();

        if ($participant !== null && $participant->payment_status !== 'refunded') {
            $from = $participant->payment_status;
            $participant->forceFill(['payment_status' => 'refunded'])->save();

            ParticipantEvent::create([
                'event_id' => $event->id,
                'employee_id' => $intent->employee_id,
                'field' => 'payment_status',
                'from_value' => $from,
                'to_value' => 'refunded',
                'actor_type' => null,
                'actor_id' => null,
                'reason' => $reason,
                'created_at' => now(),
            ]);
        }
    }

    private function notifyRefunded(PaymentIntent $intent): void
    {
        Notify::sendToId(
            'payment.refunded',
            Employee::class,
            (int) $intent->employee_id,
            ['amount' => Money::format((int) $intent->amount_halalas)],
            ['data' => ['event_id' => $intent->event_id, 'payment_intent_id' => $intent->id]],
        );
    }
}

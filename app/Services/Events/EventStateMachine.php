<?php

namespace App\Services\Events;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Services\Billing\FinancialTermsService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * آلة حالات الفعالية — «العمود الفقري للنظام كله» (H §9، إلزامية بحرفها).
 *
 * الطبقة الوحيدة التي يُغيَّر فيها عمود `events.status`:
 * - كل انتقال غير مذكور في جدول §9 يرمي {@see IllegalEventTransition} ولا يكتب شيئاً.
 * - كل انتقال (بما فيه اليدوي) يُسجَّل سطراً في `event_status_history`
 *   بالفاعل والسبب والوقت.
 * - التغيير اليدوي خارج الجدول لأدمن تيمات وحده عبر {@see force()} بسبب مكتوب
 *   إلزامي (H §9 القاعدة 2).
 *
 * الأثر المالي لكل حالة ليس هنا: الحجوزات والتحصيل في خط A10
 * (CollectionService — تستدعيه CloseRegistration)، والتسويات A11.
 *
 * حدود A9: قناة قرار المزوّد (روابط موقعة/مهل/الأسبق يفوز) عند A9 — تستدعي
 * الانتقالات المسماة providerAccepted / providerRejected /
 * providerProposedAlternative / providerCancelled ولا تكتب الحالة مباشرة.
 */
class EventStateMachine
{
    /**
     * جدول H §9 حرفياً — من كل حالة إلى ماذا يجوز الانتقال.
     *
     * ملاحظات موثقة في divergences.md:
     * - `rejected` هدف انتقال pending_approval في الجدول نفسه وإن لم يُفرد له صف.
     * - لا يوجد انتقال إلغاء من open/pending_provider/provider_alternative —
     *   الفعالية المفتوحة تموت بالانتهاء (expired) لا بالإلغاء؛ الاستثناء الوحيد
     *   تدخل أدمن تيمات اليدوي عبر force().
     * - إضافتا A8 لمصالحة §8 مع جدول §9 (قسم A8 في divergences.md):
     *   booked ← open (إعادة الجدولة مرة واحدة عند فشل الحد الأدنى — H §8
     *   يفرضها وصف expired نفسه «دون إعادة جدولة» يفترضها)، و
     *   open ← cancelled_min_not_met (فشل «المحاولة الثانية» — محفز صف
     *   cancelled_min_not_met في §9 — يقع أيضاً وهي open).
     *
     * @var array<string, string[]>
     */
    public const TRANSITIONS = [
        'pending_approval' => ['open', 'rejected'],
        'open' => ['pending_provider', 'expired', 'cancelled_min_not_met'],
        'pending_provider' => ['booked', 'provider_alternative', 'cancelled_provider'],
        'provider_alternative' => ['open', 'cancelled_provider'],
        'booked' => ['awaiting_payment', 'cancelled_min_not_met', 'cancelled_company', 'cancelled_provider', 'open'],
        'awaiting_payment' => ['confirmed', 'cancelled_payment_failed'],
        'confirmed' => ['in_progress', 'cancelled_company', 'cancelled_provider'],
        'in_progress' => ['completed'],
        'completed' => ['settled'],
        'settled' => [],
        'rejected' => [],
        'expired' => [],
        'cancelled_min_not_met' => [],
        'cancelled_provider' => [],
        'cancelled_company' => [],
        'cancelled_payment_failed' => [],
    ];

    public function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    /**
     * تنفيذ انتقال مشروع: قفل صف الفعالية، التحقق من الجدول، كتابة الحالة
     * وسجل الانتقال في معاملة واحدة.
     *
     * @param  array<string, mixed>  $metadata
     *
     * @throws IllegalEventTransition
     */
    public function transition(Event $event, EventStatus $to, ?Model $actor = null, ?string $reason = null, array $metadata = []): Event
    {
        return DB::transaction(function () use ($event, $to, $actor, $reason, $metadata) {
            /** @var Event $fresh */
            $fresh = Event::withoutGlobalScopes()->whereKey($event->id)->lockForUpdate()->firstOrFail();

            $from = (string) $fresh->status;

            if (! $this->canTransition($from, $to->value)) {
                throw new IllegalEventTransition($from, $to->value);
            }

            $this->apply($fresh, $from, $to, $actor, $reason, false, $metadata);

            $event->setRawAttributes($fresh->getAttributes(), true);

            return $event;
        });
    }

    /**
     * سطر التاريخ الافتتاحي عند إنشاء الفعالية (from = null) — ليس انتقالاً.
     */
    public function initialize(Event $event, ?Model $actor = null, ?string $reason = null): void
    {
        $this->writeHistory($event, null, (string) $event->status, $actor, $reason, false, []);
    }

    /**
     * التغيير اليدوي — أدمن تيمات وحده، بسبب مكتوب إلزامي، خارج قيود الجدول
     * (H §9 القاعدة 2: مثلاً إرجاع completed إذا ثبت أنها لم تُقم).
     * الاستدعاء محروس بصلاحية `event.force_state` في المتحكم.
     */
    public function force(Event $event, EventStatus $to, Model $actor, string $reason): Event
    {
        if (trim($reason) === '') {
            throw new \InvalidArgumentException('التغيير اليدوي للحالة يتطلب سبباً مكتوباً (H §9).');
        }

        return DB::transaction(function () use ($event, $to, $actor, $reason) {
            /** @var Event $fresh */
            $fresh = Event::withoutGlobalScopes()->whereKey($event->id)->lockForUpdate()->firstOrFail();

            $from = (string) $fresh->status;

            $this->apply($fresh, $from, $to, $actor, $reason, true, [
                'before' => $from,
                'after' => $to->value,
            ]);

            $event->setRawAttributes($fresh->getAttributes(), true);

            return $event;
        });
    }

    // ------------------------------------------------------------------
    // الانتقالات المسماة — أسماء المحفزات كما في جدول §9
    // ------------------------------------------------------------------

    /** اعتماد اقتراح الموظف (قائد/منسّق) خلال 48 ساعة → open. */
    public function approveProposal(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::Open, $actor, $reason ?? 'اعتماد اقتراح الفعالية');
    }

    /** رفض الاقتراح (صراحةً أو بانقضاء 48 ساعة) → rejected. */
    public function rejectProposal(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::Rejected, $actor, $reason ?? 'رفض اقتراح الفعالية');
    }

    /** بلوغ عدد المنضمين الحد الأدنى → إرسال الطلب الملزم للمزوّد. */
    public function minimumReached(Event $event, ?Model $actor = null): Event
    {
        return $this->transition($event, EventStatus::PendingProvider, $actor, 'بلغ عدد المنضمين الحد الأدنى — أُرسل الطلب للمزوّد');
    }

    /** مرّ موعدها وهي open دون بلوغ الحد الأدنى → expired. */
    public function expire(Event $event, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::Expired, null, $reason ?? 'مرّ الموعد دون بلوغ الحد الأدنى');
    }

    /** حلول وقت إغلاق التسجيل والعدد بلغ الحد الأدنى → بدء التحصيل. */
    public function closeRegistration(Event $event): Event
    {
        return $this->transition($event, EventStatus::AwaitingPayment, null, 'أُغلق التسجيل وثُبّت العدد — بدأ التحصيل');
    }

    /** اكتمال حجز الدعم وتحصيل كل الحصص → confirmed + كتابة event_snapshot. */
    public function collectionComplete(Event $event, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::Confirmed, null, $reason ?? 'اكتمل حجز الدعم وتحصيل الحصص');
    }

    /** فشل التحصيل ونزل العدد تحت الحد الأدنى → cancelled_payment_failed (A10). */
    public function collectionFailed(Event $event, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::CancelledPaymentFailed, null, $reason ?? 'لم يكتمل التحصيل ونزل العدد تحت الحد الأدنى');
    }

    /** حلول وقت البدء → in_progress. */
    public function start(Event $event): Event
    {
        return $this->transition($event, EventStatus::InProgress, null, 'حلّ وقت البدء');
    }

    /**
     * انتهاء الوقت → completed «تلقائي بالكامل بلا أي تدخل بشري» (H §9 قاعدة 1).
     * فعالية فاتها انتقال in_progress تمرّ به أولاً — لا قفز فوق الجدول.
     */
    public function complete(Event $event): Event
    {
        if ((string) $event->status === EventStatus::Confirmed->value) {
            $this->start($event);
        }

        return $this->transition($event, EventStatus::Completed, null, 'انتهى وقت الفعالية — اكتمال تلقائي');
    }

    /** اعتماد ودفع كشف التسوية → settled (يستدعيه A11). */
    public function settle(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::Settled, $actor, $reason ?? 'صُرفت مستحقات المزوّد');
    }

    /** فشل بلوغ الحد الأدنى عند إغلاق التسجيل (المحاولة الثانية) → cancelled_min_not_met. */
    public function cancelMinNotMet(Event $event, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::CancelledMinNotMet, null, $reason ?? 'لم يبلغ عدد المنضمين الحد الأدنى عند إغلاق التسجيل');
    }

    /**
     * H §8 (A8): إعادة الجدولة مرة واحدة عند فشل الحد الأدنى — نفس السجل:
     * booked تعود open (بعد إبلاغ المزوّد وفك حجز الوحدة — مسؤولية
     * RescheduleService)، وopen تبقى open مع سطر تاريخ توثيقي (ليس انتقالاً).
     * تعديل التواريخ نفسه (starts_at + reschedule_attempt/original_starts_at)
     * مسؤولية المستدعي — هذه الطبقة تكتب الحالة وسجلها فقط.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function rescheduleMinNotMet(Event $event, ?string $reason = null, array $metadata = []): Event
    {
        $reason ??= 'لم يبلغ العدد الحد الأدنى عند إغلاق التسجيل — أُعيدت الجدولة مرة واحدة (H §8)';

        if ((string) $event->status === EventStatus::Booked->value) {
            return $this->transition($event, EventStatus::Open, null, $reason, $metadata);
        }

        if ((string) $event->status === EventStatus::Open->value) {
            $this->writeHistory($event, EventStatus::Open->value, EventStatus::Open->value, null, $reason, false, $metadata);

            return $event;
        }

        throw new IllegalEventTransition((string) $event->status, EventStatus::Open->value);
    }

    /** إلغاء من الشركة (مسؤول الحساب أو أدمن تيمات) — من booked أو confirmed فقط. */
    public function cancelCompany(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::CancelledCompany, $actor, $reason ?? 'إلغاء من الشركة');
    }

    // ------------------------------------------------------------------
    // حدود A9 — قناة قرار المزوّد تستدعي هذه الأربعة ولا تكتب الحالة مباشرة
    // ------------------------------------------------------------------

    /** قبول المزوّد → booked (الوحدة محجوزة والتسجيل ما زال مفتوحاً — لا مال). */
    public function providerAccepted(Event $event, ?Model $actor = null): Event
    {
        return $this->transition($event, EventStatus::Booked, $actor, 'قبل المزوّد الطلب — الوحدة محجوزة');
    }

    /** رفض المزوّد (أو انقضاء مهلة رده) → cancelled_provider. */
    public function providerRejected(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::CancelledProvider, $actor, $reason ?? 'رفض المزوّد الطلب');
    }

    /** اقتراح المزوّد وقتاً بديلاً → provider_alternative. */
    public function providerProposedAlternative(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::ProviderAlternative, $actor, $reason ?? 'اقترح المزوّد وقتاً بديلاً');
    }

    /** إلغاء المزوّد بعد القبول → cancelled_provider (من booked أو confirmed). */
    public function providerCancelled(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::CancelledProvider, $actor, $reason ?? 'ألغى المزوّد بعد القبول');
    }

    /** قبول منشئ الفعالية للبديل → open بالتاريخ الجديد (+ نافذة انسحاب حر 6 ساعات). */
    public function creatorAcceptedAlternative(Event $event, ?Model $actor = null): Event
    {
        return $this->transition($event, EventStatus::Open, $actor, 'قبل المنشئ الوقت البديل — عادت مفتوحة بالتاريخ الجديد');
    }

    /** رفض المنشئ للبديل (أو انقضاء مهلته 12 ساعة) → cancelled_provider. */
    public function creatorRejectedAlternative(Event $event, ?Model $actor = null, ?string $reason = null): Event
    {
        return $this->transition($event, EventStatus::CancelledProvider, $actor, $reason ?? 'رفض المنشئ الوقت البديل');
    }

    // ------------------------------------------------------------------

    /**
     * كتابة الحالة وأعمدتها الجانبية وسطر التاريخ — داخل معاملة المستدعي.
     *
     * @param  array<string, mixed>  $metadata
     */
    private function apply(Event $event, string $from, EventStatus $to, ?Model $actor, ?string $reason, bool $isManual, array $metadata): void
    {
        $attributes = ['status' => $to->value];

        if ($to === EventStatus::Completed && $event->completed_at === null) {
            $attributes['completed_at'] = now();
        }

        if ($to === EventStatus::Confirmed && $event->event_snapshot === null) {
            // H §7/§12.10: نسخة ثابتة تُكتب عند التأكيد — هوية المنشئ والمزوّد
            // والوحدة الآن؛ الحقول المالية النهائية يملؤها A10 عند بناء التحصيل.
            $attributes['event_snapshot'] = $this->buildSnapshot($event);
        }

        if (in_array($to->value, ['rejected', 'cancelled_provider', 'cancelled_company', 'cancelled_min_not_met', 'cancelled_payment_failed'], true)
            && $reason !== null && $event->rejection_reason === null) {
            $attributes['rejection_reason'] = $reason;
        }

        $event->forceFill($attributes)->save();

        $this->writeHistory($event, $from, $to->value, $actor, $reason, $isManual, $metadata);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function writeHistory(Event $event, ?string $from, string $to, ?Model $actor, ?string $reason, bool $isManual, array $metadata): void
    {
        EventStatusHistory::create([
            'event_id' => $event->id,
            'from_status' => $from,
            'to_status' => $to,
            'actor_type' => $actor?->getMorphClass(),
            'actor_id' => $actor?->getKey(),
            'reason' => $reason,
            'is_manual' => $isManual,
            'metadata' => $metadata === [] ? null : $metadata,
            'created_at' => now(),
        ]);
    }

    /**
     * بنية `event_snapshot` عند التأكيد (H §7): هوية المنشئ (جهة اتصال المزوّد)
     * والمزوّد والوحدة والتوقيت، وقشرة الحقول المالية التي يستكملها A10.
     *
     * @return array<string, mixed>
     */
    private function buildSnapshot(Event $event): array
    {
        $event->loadMissing(['creator', 'partner', 'community', 'company', 'venues', 'venuePricing']);

        return [
            'written_at' => now()->toIso8601String(),
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'starts_at' => $event->starts_at?->toIso8601String(),
                'ends_at' => $event->ends_at?->toIso8601String(),
                'duration_minutes' => (int) $event->duration_minutes,
                'min_participants' => (int) $event->min_participants,
                'max_participants' => (int) $event->capacity,
                'participants_count' => (int) $event->participants_count,
            ],
            'creator' => [
                'id' => $event->creator?->id,
                'name' => $event->creator?->name,
                'phone' => $event->creator?->phone,
                'role' => $event->creator_role,
            ],
            'provider' => [
                'id' => $event->partner?->id,
                'name' => $event->partner?->name,
                // A11 — H §12.10: **النسبة السارية** لا نسبة الملف الحيّة —
                // تغيير النسبة يسري من تاريخ مستقبلي ولا يُطبَّق بأثر رجعي،
                // وهذه القيمة المجمّدة وحدها مصدر احتساب العمولة عند الاكتمال.
                'commission_rate' => $event->partner !== null
                    ? app(FinancialTermsService::class)->commissionRatePercentFor($event->partner, now())
                    : null,
            ],
            // A11 — H §12.10: «رسوم النظام السارية وسياسة الإلغاء» تُجمَّد مع
            // البقية. رسوم النظام تُفوتر للشركة شهرياً (H §12.8) لا على
            // الفعالية — تُحفظ هنا للتاريخ لا للاحتساب.
            'terms' => [
                'system_fee' => $event->company !== null
                    ? app(FinancialTermsService::class)->contractTermsFor($event->company, now())
                    : null,
                // H §12.4: استرداد كامل أو لا شيء — لا نسب متدرجة.
                'cancellation_policy' => 'full_refund_or_none',
                'tax' => config('billing.tax'),
            ],
            'unit' => [
                'venue_pricing_id' => $event->venue_pricing_id,
                'venues' => $event->venues->map(fn ($venue) => [
                    'id' => $venue->id,
                    'name' => $venue->name,
                ])->all(),
                'venues_count' => (int) $event->venues_count,
            ],
            'community' => ['id' => $event->community?->id, 'name' => $event->community?->name],
            'company' => ['id' => $event->company?->id, 'name' => $event->company?->name],
            // A10 — H §12.10: الحقول المالية النهائية بالهللة (integer) —
            // هذه النسخة وحدها مصدر التسوية والفوترة والاسترداد والتاريخ.
            'financial' => [
                'currency' => 'SAR',
                'total_amount_halalas' => (int) $event->total_amount_halalas,
                'base_amount_halalas' => (int) $event->base_amount_halalas,
                'vat_amount_halalas' => (int) $event->vat_amount_halalas,
                'subsidy_type' => (string) $event->subsidy_type,
                'subsidy_value' => (int) $event->subsidy_value,
                'subsidy_halalas' => $event->subsidy_halalas !== null ? (int) $event->subsidy_halalas : null,
                'max_share_halalas' => (int) $event->max_share_halalas,
                'share_per_participant_halalas' => $event->final_share_halalas !== null ? (int) $event->final_share_halalas : null,
                'collected_from_participants_halalas' => (int) $event->paymentIntents()
                    ->whereIn('status', ['paid', 'refunded'])
                    ->sum('amount_halalas'),
                'shortfall_covered_halalas' => (int) $event->shortfall_covered_halalas,
                // فرق كسور القسمة يُحمَّل على جانب عمولة تيمات (بند معلّق H §24
                // — يستهلكه A11 عند احتساب العمولة).
                'rounding_remainder_halalas' => (int) $event->rounding_remainder_halalas,
                'rounding_remainder_charged_to' => 'teamat_commission',
                // عرض بالريال — للقراءة البشرية فقط، لا حساب عليها.
                'display' => [
                    'total_amount' => (string) $event->total_amount,
                    'subsidy' => (string) $event->company_subsidy,
                    'share_per_participant' => (string) $event->cost_per_person,
                ],
            ],
        ];
    }
}

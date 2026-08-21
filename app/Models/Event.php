<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'community_id',
    'company_id',
    'partner_id',
    'venue_pricing_id',
    'category_id',
    'created_by',
    'creator_role',
    'parent_event_id',
    'template_id',
    'reschedule_attempt',
    'original_starts_at',
    'title',
    'event_date',
    'start_time',
    'starts_at',
    'ends_at',
    'registration_closes_at',
    'registration_extended_at',
    'registration_extended_by',
    'free_withdrawal_until',
    'duration_minutes',
    'venues_count',
    'total_amount',
    'total_amount_halalas',
    'subsidy_type',
    'subsidy_value',
    'max_share_halalas',
    'capacity',
    'min_participants',
    'participants_count',
    'is_full',
    'funding_status',
    'event_snapshot',
    'cost_per_person',
    'company_subsidy',
    'community_contribution',
    'player_payment',
    'notes',
    'rejection_reason',
    'refund_percentage',
    'refund_amount',
    'status',
    'completed_at',
    'attendance_locked_at',
    'budget_deducted_at',
    'payment_deadline',
])]
class Event extends Model
{
    use HasFactory, ScopedToCompany;

    /**
     * جسر مخطط A7: starts_at/ends_at (UTC) هما المصدر؛ event_date/start_time
     * عمودان قديمان مُزامَنان تلقائياً في الاتجاهين حتى تُرحَّل بقية القراءات،
     * و registration_closes_at يُشتق آلياً من إعداد الشركة (H §7).
     */
    protected static function booted(): void
    {
        static::saving(function (Event $event) {
            if ($event->isDirty('starts_at') && $event->starts_at !== null) {
                $event->event_date = $event->starts_at->format('Y-m-d');
                $event->start_time = $event->starts_at->format('H:i:s');
            } elseif (($event->isDirty('event_date') || $event->isDirty('start_time') || $event->starts_at === null)
                && $event->event_date !== null && $event->start_time !== null) {
                $event->starts_at = Carbon::parse(
                    Carbon::parse($event->event_date)->format('Y-m-d').' '.$event->start_time
                );
            }

            if ($event->starts_at !== null
                && ($event->ends_at === null || $event->isDirty(['starts_at', 'duration_minutes', 'event_date', 'start_time']))) {
                $event->ends_at = $event->starts_at->copy()->addMinutes((int) $event->duration_minutes);
            }

            if ($event->starts_at !== null
                && ($event->registration_closes_at === null || $event->isDirty(['starts_at', 'event_date', 'start_time']))) {
                $hours = (int) (CompanySetting::query()
                    ->where('company_id', $event->company_id)
                    ->value('registration_close_hours') ?? 24);

                $event->registration_closes_at = $event->starts_at->copy()->subHours($hours);
            }
        });
    }

    /**
     * الأسماء المالية القديمة تبقى في التسلسل كقيم عرض بالريال مشتقة من
     * أعمدة الهللات — كل الحساب المالي هللات صحيحة حصراً (A10 — H §12.1).
     *
     * @var list<string>
     */
    protected $appends = [
        'total_amount',
        'cost_per_person',
        'company_subsidy',
        'community_contribution',
        'player_payment',
        'max_share',
        'final_share',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date:Y-m-d',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'registration_closes_at' => 'datetime',
            'free_withdrawal_until' => 'datetime',
            'original_starts_at' => 'datetime',
            'min_participants' => 'integer',
            'is_full' => 'boolean',
            'reschedule_attempt' => 'integer',
            'event_snapshot' => 'array',
            'duration_minutes' => 'integer',
            'venues_count' => 'integer',
            'total_amount_halalas' => 'integer',
            'base_amount_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'subsidy_value' => 'integer',
            'subsidy_halalas' => 'integer',
            'max_share_halalas' => 'integer',
            'final_share_halalas' => 'integer',
            'rounding_remainder_halalas' => 'integer',
            'shortfall_covered_halalas' => 'integer',
            'collection_deadline_at' => 'datetime',
            'discount_amount_halalas' => 'integer',
            'refund_amount_halalas' => 'integer',
            'capacity' => 'integer',
            'participants_count' => 'integer',
            'registration_extended_at' => 'datetime',
            'completed_at' => 'datetime',
            // A12 — H §13: ختم إقفال نافذة تعديل الحضور (24 ساعة).
            'attendance_locked_at' => 'datetime',
            'budget_deducted_at' => 'datetime',
            'payment_deadline' => 'datetime',
            'refund_percentage' => 'integer',
        ];
    }

    // ── A10: المال هللات صحيحة — الأسماء القديمة عرضٌ وجسور إدخال ─────────

    /**
     * الدعم المخطط بالهللة (H §12.2): fixed = القيمة نفسها، percentage =
     * نسبة من الإجمالي بلا تقريب لأعلى — مسقوف بالإجمالي دائماً.
     */
    public function plannedSubsidyHalalas(): int
    {
        $total = (int) $this->total_amount_halalas;

        $planned = $this->subsidy_type === 'percentage'
            ? intdiv($total * min(100, (int) $this->subsidy_value), 100)
            : (int) $this->subsidy_value;

        return min($planned, $total);
    }

    /**
     * الدعم الفعال: المقفل عند الإغلاق إن وُجد وإلا المخطط.
     */
    public function effectiveSubsidyHalalas(): int
    {
        return $this->subsidy_halalas ?? $this->plannedSubsidyHalalas();
    }

    public function getTotalAmountAttribute(): string
    {
        return Money::format((int) $this->total_amount_halalas);
    }

    public function setTotalAmountAttribute(mixed $value): void
    {
        $halalas = Money::toHalalas($value ?? 0);
        $vat = Money::decomposeVat($halalas);

        $this->attributes['total_amount_halalas'] = $halalas;
        $this->attributes['base_amount_halalas'] = $vat['base'];
        $this->attributes['vat_amount_halalas'] = $vat['vat'];
    }

    /**
     * «حصة الفرد» للعرض: النهائية المقفلة بعد الإغلاق، وإلا السقف الملزم.
     */
    public function getCostPerPersonAttribute(): string
    {
        return Money::format((int) ($this->final_share_halalas ?? $this->max_share_halalas));
    }

    public function setCostPerPersonAttribute(mixed $value): void
    {
        $this->attributes['max_share_halalas'] = Money::toHalalas($value ?? 0);
    }

    public function getMaxShareAttribute(): string
    {
        return Money::format((int) $this->max_share_halalas);
    }

    public function getFinalShareAttribute(): ?string
    {
        return $this->final_share_halalas === null
            ? null
            : Money::format((int) $this->final_share_halalas);
    }

    public function getCompanySubsidyAttribute(): string
    {
        return Money::format($this->effectiveSubsidyHalalas());
    }

    public function setCompanySubsidyAttribute(mixed $value): void
    {
        $this->attributes['subsidy_type'] = 'fixed';
        $this->attributes['subsidy_value'] = Money::toHalalas($value ?? 0);
    }

    public function getCommunityContributionAttribute(): string
    {
        return Money::format($this->effectiveSubsidyHalalas());
    }

    public function setCommunityContributionAttribute(mixed $value): void
    {
        // مشتق من الدعم — يُبتلع الإدخال القديم عمداً.
    }

    public function getPlayerPaymentAttribute(): string
    {
        return Money::format(max(0, (int) $this->total_amount_halalas - $this->effectiveSubsidyHalalas()));
    }

    public function setPlayerPaymentAttribute(mixed $value): void
    {
        // مشتق (الإجمالي − الدعم) — يُبتلع الإدخال القديم عمداً.
    }

    public function getDiscountAmountAttribute(): ?string
    {
        return $this->discount_amount_halalas === null
            ? null
            : Money::format((int) $this->discount_amount_halalas);
    }

    public function setDiscountAmountAttribute(mixed $value): void
    {
        // أرشيف الميزة المحذوفة — لا مسار كتابة جديداً؛ يُبتلع الإدخال القديم.
        $this->attributes['discount_amount_halalas'] = $value === null ? null : Money::toHalalas($value);
    }

    public function getRefundAmountAttribute(): ?string
    {
        return $this->refund_amount_halalas === null
            ? null
            : Money::format((int) $this->refund_amount_halalas);
    }

    public function setRefundAmountAttribute(mixed $value): void
    {
        $this->attributes['refund_amount_halalas'] = $value === null ? null : Money::toHalalas($value);
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function parentEvent(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'parent_event_id');
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function occurrences(): HasMany
    {
        return $this->hasMany(Event::class, 'parent_event_id');
    }

    /**
     * قالب التكرار الذي وُلّدت منه هذه الفعالية (أو رُبطت به بالترحيل) — A8.
     *
     * @return BelongsTo<EventTemplate, $this>
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(EventTemplate::class);
    }

    /**
     * Whether this event is the parent of a legacy recurring series.
     *
     * أعمدة التكرار المدمجة ماتت (A8 — التكرار قوالب الآن)؛ السلسلة القديمة
     * تُعرف بنسبها: أمٌّ لها تكرارات عبر parent_event_id.
     */
    public function isRecurringSeries(): bool
    {
        return $this->parent_event_id === null && $this->occurrences()->exists();
    }

    /**
     * Whether this event is an occurrence of a recurring series.
     */
    public function isOccurrence(): bool
    {
        return $this->parent_event_id !== null;
    }

    /**
     * وقت بدء الفعالية — العمود starts_at (UTC)، مع اشتقاق احتياطي من الجسر
     * القديم event_date + start_time.
     */
    public function startsAt(): Carbon
    {
        return $this->starts_at?->copy()
            ?? Carbon::parse($this->event_date->format('Y-m-d').' '.$this->start_time);
    }

    /**
     * وقت انتهاء الفعالية — العمود ends_at، مع اشتقاق احتياطي.
     */
    public function endsAt(): Carbon
    {
        return $this->ends_at?->copy()
            ?? $this->startsAt()->addMinutes((int) $this->duration_minutes);
    }

    /**
     * هل التسجيل ما زال مفتوحاً؟ (H §7: registration_closes_at مشتق آلياً).
     */
    public function isRegistrationOpen(): bool
    {
        $closesAt = $this->registration_closes_at ?? $this->startsAt();

        return now()->lt($closesAt);
    }

    /**
     * الحد الأقصى للمشاركين (H §7: max_participants) — العمود القديم capacity.
     */
    public function getMaxParticipantsAttribute(): int
    {
        return (int) $this->capacity;
    }

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return BelongsTo<VenuePricing, $this>
     */
    public function venuePricing(): BelongsTo
    {
        return $this->belongsTo(VenuePricing::class);
    }

    /**
     * مطالبات دفع حصص المشاركين (A10 — H §12.3).
     *
     * @return HasMany<PaymentIntent, $this>
     */
    public function paymentIntents(): HasMany
    {
        return $this->hasMany(PaymentIntent::class);
    }

    /**
     * @return BelongsTo<Sport, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    /**
     * @return BelongsToMany<Employee, $this>
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'event_participants')
            ->using(EventParticipant::class)
            ->withPivot(['seat_status', 'payment_status', 'attendance_status', 'joined_at', 'position', 'offered_at', 'offer_expires_at']);
    }

    /**
     * المشاركون المحجوزة مقاعدهم (seat_status = reserved).
     *
     * @return BelongsToMany<Employee, $this>
     */
    public function reservedParticipants(): BelongsToMany
    {
        return $this->participants()->wherePivot('seat_status', 'reserved');
    }

    /**
     * سجل انتقالات الحالة (H §9).
     *
     * @return HasMany<EventStatusHistory, $this>
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(EventStatusHistory::class)->orderBy('created_at');
    }

    /**
     * سجل تغييرات حالات المشاركين (H §10).
     *
     * @return HasMany<ParticipantEvent, $this>
     */
    public function participantEvents(): HasMany
    {
        return $this->hasMany(ParticipantEvent::class);
    }

    /**
     * Member comments — the only discussion surface in the product (H §6).
     *
     * @return HasMany<EventComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(EventComment::class);
    }

    /**
     * Get waitlisted participants ordered by position.
     *
     * @return BelongsToMany<Employee, $this>
     */
    public function waitlistEntries(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'event_participants')
            ->using(EventParticipant::class)
            ->withPivot(['seat_status', 'joined_at', 'position', 'offered_at', 'offer_expires_at'])
            ->wherePivot('seat_status', 'waitlisted')
            ->orderByPivot('position');
    }

    /**
     * @return BelongsToMany<Venue, $this>
     */
    public function venues(): BelongsToMany
    {
        return $this->belongsToMany(Venue::class, 'event_venue');
    }

    /**
     * @return HasMany<EventAlternative, $this>
     */
    public function alternatives(): HasMany
    {
        return $this->hasMany(EventAlternative::class);
    }

    /**
     * قيود الدفتر التي تشير إلى هذه الفعالية (استقطاع/استرداد/حجز… — H §12.5).
     *
     * @return MorphMany<WalletTransaction, $this>
     */
    public function walletTransactions(): MorphMany
    {
        return $this->morphMany(WalletTransaction::class, 'reference');
    }

    /**
     * بنود التسوية على الفعالية (A11 — H §12.7): بند واحد عند الاكتمال،
     * وأي بنود تصحيحية لاحقة عليه.
     *
     * @return HasMany<SettlementItem, $this>
     */
    public function settlementItems(): HasMany
    {
        return $this->hasMany(SettlementItem::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['open', 'pending_provider', 'provider_alternative', 'booked']);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString());
    }

    /**
     * Get the total venues booked by overlapping events at a given partner/date/time.
     */
    public static function overlappingvenuesCount(int $partnerId, string $date, string $startTime, int $durationMinutes, ?int $excludeEventId = null): int
    {
        $newStart = Carbon::parse($startTime);
        $newEnd = $newStart->copy()->addMinutes($durationMinutes);

        return (int) static::where('partner_id', $partnerId)
            ->where('event_date', $date)
            // H §9: الوحدة محجوزة لدى المزوّد من booked حتى الاكتمال.
            ->whereIn('status', ['booked', 'awaiting_payment', 'confirmed', 'in_progress'])
            ->where('event_date', '>=', now()->toDateString())
            ->when($excludeEventId, fn ($q) => $q->where('id', '!=', $excludeEventId))
            ->get(['id', 'start_time', 'duration_minutes', 'venues_count'])
            ->filter(function ($event) use ($newStart, $newEnd) {
                $existingStart = Carbon::parse($event->start_time);
                $existingEnd = $existingStart->copy()->addMinutes($event->duration_minutes);

                return $newStart->lt($existingEnd) && $newEnd->gt($existingStart);
            })
            ->sum('venues_count');
    }
}

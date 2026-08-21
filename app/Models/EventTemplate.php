<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use App\Support\Money;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * قالب التكرار — محرك التشغيل التلقائي (H §8): ينشئ القالبَ قائدُ المجتمع أو
 * المنسّق أو مسؤول الحساب؛ الأنماط أسبوعي/كل أسبوعين/شهري؛ التوليد قبل 14
 * يوماً؛ بداية الأسبوع الأحد؛ «يوم 31» في شهر أقصر ← آخر يوم.
 *
 * - الإيقاف يوقف التوليد المستقبلي فقط ولا يمس أي فعالية مولّدة.
 * - التعديل يسري على ما سيُولَّد لاحقاً فقط (القيم تُنسخ لحظة التوليد).
 * - المال (A10 — H §12.2): `total_amount_halalas` شامل الضريبة +
 *   `subsidy_type` (fixed | percentage) + `subsidy_value` (هللات للثابت،
 *   نسبة 0–100 للمئوية) — تُنسخ للفعاليات المولّدة ويُشتق سقف الحصة منها
 *   لحظة التوليد. الأسماء القديمة جسور عرض/إدخال بالريال.
 */
#[Fillable([
    'company_id',
    'community_id',
    'partner_id',
    'activity_unit_id',
    'category_id',
    'venue_pricing_id',
    'venue_ids',
    'created_by',
    'title',
    'notes',
    'recurrence_pattern',
    'day_of_week',
    'day_of_month',
    'anchor_date',
    'ends_on',
    'start_time',
    'duration_minutes',
    'capacity',
    'min_participants',
    'venues_count',
    'total_amount',
    'total_amount_halalas',
    'subsidy_type',
    'subsidy_value',
    'company_subsidy',
    'community_contribution',
    'player_payment',
    'cost_per_person',
    'blackout_behavior',
    'reschedule_interval_days',
    'status',
    'paused_at',
])]
class EventTemplate extends Model
{
    use HasFactory, ScopedToCompany;

    public const PATTERN_WEEKLY = 'weekly';

    public const PATTERN_BIWEEKLY = 'biweekly';

    public const PATTERN_MONTHLY = 'monthly';

    public const BLACKOUT_SKIP = 'skip';

    public const BLACKOUT_SHIFT_WEEK = 'shift_week';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_PAUSED = 'paused';

    /** أفق التوليد: تُولَّد الفعالية قبل 14 يوماً من موعدها (H §8). */
    public const GENERATION_HORIZON_DAYS = 14;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'venue_ids' => 'array',
            'day_of_week' => 'integer',
            'day_of_month' => 'integer',
            'anchor_date' => 'date:Y-m-d',
            'ends_on' => 'date:Y-m-d',
            'duration_minutes' => 'integer',
            'capacity' => 'integer',
            'min_participants' => 'integer',
            'venues_count' => 'integer',
            'total_amount_halalas' => 'integer',
            'subsidy_value' => 'integer',
            'reschedule_interval_days' => 'integer',
            'paused_at' => 'datetime',
        ];
    }

    /** @var list<string> */
    protected $appends = ['total_amount', 'company_subsidy'];

    // ── A10: جسور الأسماء المالية القديمة (عرض/إدخال بالريال) ───────────

    public function getTotalAmountAttribute(): string
    {
        return Money::format((int) $this->total_amount_halalas);
    }

    public function setTotalAmountAttribute(mixed $value): void
    {
        $this->attributes['total_amount_halalas'] = Money::toHalalas($value ?? 0);
    }

    public function getCompanySubsidyAttribute(): string
    {
        return $this->subsidy_type === 'percentage'
            ? Money::format(intdiv((int) $this->total_amount_halalas * min(100, (int) $this->subsidy_value), 100))
            : Money::format((int) $this->subsidy_value);
    }

    public function setCompanySubsidyAttribute(mixed $value): void
    {
        $this->attributes['subsidy_type'] = 'fixed';
        $this->attributes['subsidy_value'] = Money::toHalalas($value ?? 0);
    }

    public function setCommunityContributionAttribute(mixed $value): void
    {
        // مشتق من الدعم — يُبتلع الإدخال القديم عمداً (A10).
    }

    public function setPlayerPaymentAttribute(mixed $value): void
    {
        // مشتق — يُبتلع الإدخال القديم عمداً (A10).
    }

    public function setCostPerPersonAttribute(mixed $value): void
    {
        // سقف الحصة يُشتق بمعادلة §12.2 لحظة التوليد — لا يُخزَّن على القالب.
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
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
     * @return BelongsTo<ActivityUnit, $this>
     */
    public function activityUnit(): BelongsTo
    {
        return $this->belongsTo(ActivityUnit::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<VenuePricing, $this>
     */
    public function venuePricing(): BelongsTo
    {
        return $this->belongsTo(VenuePricing::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    /**
     * الفعاليات المولّدة من هذا القالب (والمرحّلة المربوطة به).
     *
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'template_id');
    }
}

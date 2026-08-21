<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * وحدة النشاط — ملعب أو مسار أو قاعة تتبع فرعاً واحداً (H §11): النشاط من
 * الكتالوج المركزي، الطاقة الدنيا والقصوى، نوع التسعير، السعر، المدة الافتراضية.
 */
#[Fillable([
    'provider_branch_id',
    'category_id',
    'venue_id',
    'name',
    'min_capacity',
    'max_capacity',
    'pricing_type',
    'price',
    'price_halalas',
    'default_duration_minutes',
    'status',
])]
class ActivityUnit extends Model
{
    use HasFactory;

    public const PRICING_UNIT_HOUR = 'unit_hour';

    public const PRICING_PACKAGE = 'package';

    public const PRICING_PER_PERSON = 'per_person';

    /** @var list<string> */
    protected $appends = ['price'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_capacity' => 'integer',
            'max_capacity' => 'integer',
            'price_halalas' => 'integer',
            'default_duration_minutes' => 'integer',
        ];
    }

    /**
     * السعر هللات صحيحة (A10)؛ الاسم القديم `price` جسر عرض/إدخال بالريال.
     * السعر شامل ضريبة 15% (H §12.1).
     */
    public function getPriceAttribute(): string
    {
        return Money::format((int) $this->price_halalas);
    }

    public function setPriceAttribute(mixed $value): void
    {
        $this->attributes['price_halalas'] = Money::toHalalas($value ?? 0);
    }

    /**
     * @return BelongsTo<ProviderBranch, $this>
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(ProviderBranch::class, 'provider_branch_id');
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * جسر إلى صف venue القديم (توافق مرحلة الانتقال).
     *
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * @return HasMany<UnitSlot, $this>
     */
    public function slots(): HasMany
    {
        return $this->hasMany(UnitSlot::class);
    }

    /**
     * @return HasMany<UnitPriceChange, $this>
     */
    public function priceChanges(): HasMany
    {
        return $this->hasMany(UnitPriceChange::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

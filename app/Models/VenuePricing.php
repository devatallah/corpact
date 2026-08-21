<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * السعر هللات صحيحة (`price_halalas` — A10)؛ الاسم القديم `price` جسر
 * عرض/إدخال بالريال. السعر شامل ضريبة 15% (H §12.1).
 */
#[Fillable(['venue_id', 'duration_minutes', 'price', 'price_halalas', 'is_peak', 'label', 'start_time', 'end_time', 'days', 'status'])]
class VenuePricing extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $appends = ['price'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'price_halalas' => 'integer',
            'is_peak' => 'boolean',
            'days' => 'array',
        ];
    }

    public function getPriceAttribute(): string
    {
        return Money::format((int) $this->price_halalas);
    }

    public function setPriceAttribute(mixed $value): void
    {
        $this->attributes['price_halalas'] = Money::toHalalas($value ?? 0);
    }

    /**
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}

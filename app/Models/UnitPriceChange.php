<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * تعديل سعر وحدة تحت عقد سعر — لا يسري إلا بعد اعتماد أدمن تيمات (H §17).
 * بلا عقد سعر يسري التعديل مباشرة ولا يمر من هنا.
 * المبالغ هللات صحيحة (A10)؛ الاسمان القديمان جسرا عرض/إدخال بالريال.
 */
#[Fillable([
    'activity_unit_id',
    'old_price',
    'new_price',
    'old_price_halalas',
    'new_price_halalas',
    'status',
    'requested_by',
    'decided_by',
    'decided_at',
])]
class UnitPriceChange extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $appends = ['old_price', 'new_price'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_price_halalas' => 'integer',
            'new_price_halalas' => 'integer',
            'decided_at' => 'datetime',
        ];
    }

    public function getOldPriceAttribute(): string
    {
        return Money::format((int) $this->old_price_halalas);
    }

    public function setOldPriceAttribute(mixed $value): void
    {
        $this->attributes['old_price_halalas'] = Money::toHalalas($value ?? 0);
    }

    public function getNewPriceAttribute(): string
    {
        return Money::format((int) $this->new_price_halalas);
    }

    public function setNewPriceAttribute(mixed $value): void
    {
        $this->attributes['new_price_halalas'] = Money::toHalalas($value ?? 0);
    }

    /**
     * @return BelongsTo<ActivityUnit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(ActivityUnit::class, 'activity_unit_id');
    }
}

<?php

namespace App\Models;

use App\Contracts\FinancialAction;
use App\Exceptions\PaidSettlementImmutableException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * كشف تسوية مزوّد (H §12.7): يُولَّد **كل 15 يوماً لكل مزوّد** ويجمع بنود
 * الفعاليات المكتملة في الفترة، ويمر بـ `draft` ← `approved` ← `paid`.
 *
 * ثلاث قواعد مثبتة هنا:
 * 1. **المنشئ لا يعتمد ولا يصرف** — {@see FinancialAction} + `SelfApprovalGuard`.
 * 2. **لا صرف قبل اعتماد الحساب البنكي** — `Partner::payoutsBlocked()`.
 * 3. **الكشف المدفوع لا يُعدَّل إطلاقاً** — حراسة في النموذج نفسه.
 */
#[Fillable([
    'partner_id',
    'period_key',
    'period_start',
    'period_end',
    'status',
    'items_count',
    'gross_amount_halalas',
    'commission_amount_halalas',
    'vat_amount_halalas',
    'net_amount_halalas',
    'generated_by_user_id',
    'approved_by_user_id',
    'approved_at',
    'paid_by_user_id',
    'paid_at',
    'transferred_at',
    'payout_reference',
    'notes',
])]
class SettlementStatement extends Model implements FinancialAction
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_PAID = 'paid';

    protected static function booted(): void
    {
        static::updating(function (self $statement): void {
            if ((string) $statement->getOriginal('status') === self::STATUS_PAID) {
                throw new PaidSettlementImmutableException;
            }
        });

        static::deleting(function (): never {
            throw new PaidSettlementImmutableException('لا يُحذف كشف تسوية — لا تصحيح بالحذف في أي سجل مالي.');
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_start' => 'date:Y-m-d',
            'period_end' => 'date:Y-m-d',
            'items_count' => 'integer',
            'gross_amount_halalas' => 'integer',
            'commission_amount_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'net_amount_halalas' => 'integer',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
            'transferred_at' => 'datetime',
        ];
    }

    /**
     * الفاعل الذي أنشأ الكشف — null حين يولّده الجدول الآلي.
     */
    public function createdByUserId(): ?int
    {
        return $this->generated_by_user_id !== null ? (int) $this->generated_by_user_id : null;
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return HasMany<SettlementItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(SettlementItem::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by_user_id');
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }
}

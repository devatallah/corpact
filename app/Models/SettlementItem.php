<?php

namespace App\Models;

use App\Exceptions\PaidSettlementImmutableException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * بند تسوية (H §12.7 — «جدول إلزامي»): سطر مستقل لكل فعالية مكتملة.
 *
 * - يُنشأ **عند انتقال الفعالية إلى `completed` حصراً** ولا قبله بأي حال.
 * - `snapshot_json` نسخة مجمّدة (اسم المزوّد، السعر، نسبة العمولة **وقت
 *   الاحتساب**) فلا يتغير التاريخ بتغيّر ملف المزوّد لاحقاً.
 * - المبالغ هللات صحيحة **موقّعة**: بند التصحيح (`type = correction`) يحمل
 *   الفرق وقد يكون سالباً.
 * - `disputed`/`adjusted` موجودتان في الحالات من اليوم الأول وإن تأجلت واجهة
 *   النزاع بقرار المالك.
 * - بند دخل كشفاً مدفوعاً **لا يُعدَّل أبداً**: التصحيح حركة عكسية + بند
 *   تصحيحي في الكشف التالي بسبب مسجَّل (استثناء الانتقال إلى `adjusted` وهو
 *   ختم التصحيح نفسه).
 */
#[Fillable([
    'partner_id',
    'event_id',
    'company_id',
    'settlement_statement_id',
    'type',
    'corrects_item_id',
    'gross_amount_halalas',
    'commission_amount_halalas',
    'vat_amount_halalas',
    'net_amount_halalas',
    'activity_vat_amount_halalas',
    'rounding_remainder_halalas',
    'commission_rate_percent',
    'status',
    'tax_treatment',
    'invoice_issuer',
    'snapshot_json',
    'reason',
    'created_by_user_id',
    'idempotency_key',
    'computed_at',
])]
class SettlementItem extends Model
{
    use HasFactory;

    public const TYPE_EVENT = 'event';

    public const TYPE_CORRECTION = 'correction';

    public const STATUS_PENDING = 'pending';

    public const STATUS_INCLUDED = 'included';

    public const STATUS_PAID = 'paid';

    public const STATUS_DISPUTED = 'disputed';

    public const STATUS_ADJUSTED = 'adjusted';

    protected static function booted(): void
    {
        static::updating(function (self $item): void {
            $original = (string) $item->getOriginal('status');

            if ($original !== self::STATUS_PAID) {
                return;
            }

            // الختم الوحيد المسموح على بند مدفوع: تعليمه adjusted بعد إصدار
            // حركة عكسية وبند تصحيحي — لا تُمس مبالغه ولا لقطته.
            $touched = array_keys($item->getDirty());

            if ($touched === ['status'] && $item->status === self::STATUS_ADJUSTED) {
                return;
            }

            throw new PaidSettlementImmutableException;
        });

        static::deleting(function (): never {
            throw new PaidSettlementImmutableException('لا يُحذف بند تسوية — التصحيح بحركة عكسية وبند تصحيحي.');
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gross_amount_halalas' => 'integer',
            'commission_amount_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'net_amount_halalas' => 'integer',
            'activity_vat_amount_halalas' => 'integer',
            'rounding_remainder_halalas' => 'integer',
            'commission_rate_percent' => 'decimal:2',
            'snapshot_json' => 'array',
            'computed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<SettlementStatement, $this>
     */
    public function statement(): BelongsTo
    {
        return $this->belongsTo(SettlementStatement::class, 'settlement_statement_id');
    }

    /**
     * البند الأصلي الذي يصححه هذا البند.
     *
     * @return BelongsTo<SettlementItem, $this>
     */
    public function correctedItem(): BelongsTo
    {
        return $this->belongsTo(self::class, 'corrects_item_id');
    }

    /**
     * بنود لم تدخل كشفاً بعد — مادة الكشف القادم.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}

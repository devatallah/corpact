<?php

namespace App\Models;

use App\Contracts\FinancialAction;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * فاتورة رسوم النظام الشهرية (H §12.8/§12.9).
 *
 * - الدورة ميلادية كاملة (1 → آخر الشهر)، تصدر اليوم الثالث من الشهر التالي
 *   وتُستحق خلال 15 يوماً.
 * - الأساس عدد **الموظفين المفعّلين** (شارك في فعالية اكتملت في الدورة ولم
 *   يُسجَّل غائباً، مرة واحدة)، مضروباً في رسم العقد، ثم الحد الأدنى الشهري
 *   إن كان أعلى، ثم 15% ضريبة **تُضاف** على الرسوم.
 * - `tax_treatment = principal` و`invoice_issuer = teamat` (تيمات أصيل في
 *   رسوم النظام — H §12.9).
 * - `issuance_mode = provisional` ما دام `billing.real_invoices_enabled`
 *   مغلقاً بانتظار المحاسب القانوني.
 */
#[Fillable([
    'company_id',
    'serial_sequence',
    'serial',
    'invoice_uuid',
    'period_key',
    'period_start',
    'period_end',
    'status',
    'issuance_mode',
    'activated_employees_count',
    'departed_activated_count',
    'fee_per_activated_employee_halalas',
    'fees_subtotal_halalas',
    'monthly_minimum_halalas',
    'minimum_adjustment_halalas',
    'subtotal_halalas',
    'vat_amount_halalas',
    'total_amount_halalas',
    'vat_rate_percent',
    'tax_treatment',
    'invoice_issuer',
    'seller_name',
    'seller_vat_number',
    'buyer_name',
    'buyer_vat_number',
    'qr_payload',
    'issued_at',
    'due_at',
    'paid_at',
    'paid_by_user_id',
    'payment_reference',
    'reminder_7_sent_at',
    'reminder_15_sent_at',
    'blocked_at',
    'generated_by_user_id',
    'metadata',
])]
class PlatformFeeInvoice extends Model implements FinancialAction
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ISSUED = 'issued';

    public const STATUS_PAID = 'paid';

    public const STATUS_VOID = 'void';

    public const MODE_PROVISIONAL = 'provisional';

    public const MODE_REAL = 'real';

    protected static function booted(): void
    {
        static::deleting(function (): never {
            throw new \LogicException('لا تُحذف فاتورة — الإلغاء بحالة void موثقة، لا بالحذف.');
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
            'activated_employees_count' => 'integer',
            'departed_activated_count' => 'integer',
            'fee_per_activated_employee_halalas' => 'integer',
            'fees_subtotal_halalas' => 'integer',
            'monthly_minimum_halalas' => 'integer',
            'minimum_adjustment_halalas' => 'integer',
            'subtotal_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'total_amount_halalas' => 'integer',
            'vat_rate_percent' => 'integer',
            'issued_at' => 'datetime',
            'due_at' => 'datetime',
            'paid_at' => 'datetime',
            'reminder_7_sent_at' => 'datetime',
            'reminder_15_sent_at' => 'datetime',
            'blocked_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function createdByUserId(): ?int
    {
        return $this->generated_by_user_id !== null ? (int) $this->generated_by_user_id : null;
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return HasMany<InvoiceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * عدد أيام التأخر عن الاستحقاق (0 إن لم تُستحق أو سُدّدت).
     */
    public function daysOverdue(?Carbon $now = null): int
    {
        if ($this->status !== self::STATUS_ISSUED || $this->due_at === null) {
            return 0;
        }

        $now ??= Carbon::now();

        return $this->due_at->lt($now) ? (int) $this->due_at->diffInDays($now) : 0;
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOutstanding($query)
    {
        return $query->where('status', self::STATUS_ISSUED);
    }
}

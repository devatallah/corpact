<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\URL;

/**
 * مطالبة دفع حصة مشارك (H §12.3): تُنشأ عند إغلاق التسجيل بمبلغ الحصة
 * المقفلة بالهللة (شاملة الضريبة ومفكَّكة)، بمفتاح تفرّد يمنع التحصيل
 * مرتين (القاعدة 5)، ونافذة 120 دقيقة أو حتى 6 ساعات قبل البدء أيهما أقرب.
 * المبلغ لا يزيد بعد الإنشاء أبداً — ولا رسوم بوابة على الموظف (H §12.6).
 */
#[Fillable([
    'event_id', 'employee_id', 'company_id',
    'amount_halalas', 'base_amount_halalas', 'vat_amount_halalas', 'currency',
    'status', 'gateway', 'payment_method', 'gateway_reference', 'idempotency_key',
    'expires_at', 'paid_at', 'cancelled_at',
    'refund_status', 'refund_reason', 'refund_idempotency_key',
    'refund_attempts', 'refund_last_error', 'refunded_at',
])]
class PaymentIntent extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_REFUNDED = 'refunded';

    public const REFUND_NONE = 'none';

    public const REFUND_PENDING = 'pending';

    public const REFUND_FAILED = 'failed';

    public const REFUND_REFUNDED = 'refunded';

    /** @var list<string> */
    protected $appends = ['amount', 'base_amount', 'vat_amount'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_halalas' => 'integer',
            'base_amount_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'refund_attempts' => 'integer',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * @return HasMany<GatewayTransaction, $this>
     */
    public function gatewayTransactions(): HasMany
    {
        return $this->hasMany(GatewayTransaction::class);
    }

    public function isPayable(): bool
    {
        return $this->status === self::STATUS_PENDING && $this->expires_at->isFuture();
    }

    /**
     * رابط الدفع الموقّع (H §12.3: المطالبة برابط دفع؛ إغلاق الصفحة لا يلغي
     * شيئاً — الدفع يُستأنف من نفس الرابط طوال النافذة).
     */
    public function signedPaymentUrl(): string
    {
        return URL::signedRoute('employee.payments.show', ['intent' => $this->id]);
    }

    // ── عرض بالريال (لا حساب عليها) ────────────────────────────────────

    public function getAmountAttribute(): string
    {
        return Money::format((int) $this->amount_halalas);
    }

    public function getBaseAmountAttribute(): string
    {
        return Money::format((int) $this->base_amount_halalas);
    }

    public function getVatAmountAttribute(): string
    {
        return Money::format((int) $this->vat_amount_halalas);
    }
}

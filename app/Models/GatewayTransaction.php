<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * أثر نداء بوابة (دفعة أو استرداد) — سجل مال الموظفين المقابل لدفتر
 * المحافظ: append-only بالعرف، والاسترداد صف مرتبط بصف الدفعة الأصلي
 * (تصحيح بحركة عكسية — القاعدة 2)، ولكل صف مفتاح تفرّد (القاعدة 5).
 */
#[Fillable([
    'payment_intent_id', 'type', 'gateway', 'gateway_reference',
    'amount_halalas', 'status', 'idempotency_key', 'related_transaction_id',
    'payload', 'error',
])]
class GatewayTransaction extends Model
{
    public const TYPE_PAYMENT = 'payment';

    public const TYPE_REFUND = 'refund';

    public const STATUS_INITIATED = 'initiated';

    public const STATUS_SUCCEEDED = 'succeeded';

    public const STATUS_FAILED = 'failed';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_halalas' => 'integer',
            'payload' => 'array',
        ];
    }

    /**
     * @return BelongsTo<PaymentIntent, $this>
     */
    public function paymentIntent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class);
    }

    /**
     * @return BelongsTo<GatewayTransaction, $this>
     */
    public function relatedTransaction(): BelongsTo
    {
        return $this->belongsTo(GatewayTransaction::class, 'related_transaction_id');
    }
}

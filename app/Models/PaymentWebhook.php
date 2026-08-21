<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ويبهوك بوابة مخزَّن خاماً **قبل** معالجته (H §12.6): الحمولة + التوقيع +
 * مفتاح التفرّد + حالة المعالجة. المكرر يُتجاهل بالمفتاح ولا يُنشئ قيداً
 * ثانياً؛ المتأخر يُقبل ما لم يُمنح المقعد لغيره فيُرد المبلغ تلقائياً.
 */
#[Fillable([
    'gateway', 'event_type', 'gateway_reference', 'idempotency_key',
    'payload', 'signature', 'processing_status', 'payment_intent_id',
    'processed_at', 'error',
])]
class PaymentWebhook extends Model
{
    public const STATUS_RECEIVED = 'received';

    public const STATUS_PROCESSED = 'processed';

    public const STATUS_DUPLICATE = 'duplicate';

    public const STATUS_INVALID = 'invalid';

    public const STATUS_FAILED = 'failed';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'processed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<PaymentIntent, $this>
     */
    public function paymentIntent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class);
    }
}

<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * سطر واحد لكل **محاولة** إرسال (H §14 — «كل رسالة تُسجَّل في
 * `notification_logs` مع القالب والمتحوّلات والقناة وحالة التسليم ووقتها»).
 *
 * هذا أول ما يفتحه الدعم في شكوى «ما وصلني شيء» (G — دليل وكيل الدعم):
 * السطر يقول أي قالب، بأي متحوّلات، على أي قناة، وفي أي محاولة، وماذا حدث.
 */
#[Fillable([
    'template_key',
    'notification_id',
    'recipient_type',
    'recipient_id',
    'recipient_phone',
    'channel',
    'status',
    'attempt',
    'reason',
    'variables',
    'rendered_body',
    'locale',
    'purpose',
    'provider_message_id',
    'error',
    'queued_at',
    'deferred_until',
    'sent_at',
    'delivered_at',
    'failed_at',
])]
class NotificationLog extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => DeliveryStatus::class,
            'variables' => 'array',
            'attempt' => 'integer',
            'queued_at' => 'datetime',
            'deferred_until' => 'datetime',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function recipient(): MorphTo
    {
        return $this->morphTo('recipient');
    }

    public function template(): ?NotificationTemplate
    {
        return $this->template_key === null
            ? null
            : NotificationTemplate::query()->where('key', $this->template_key)->first();
    }

    public function markSent(?string $providerMessageId = null): void
    {
        $this->forceFill([
            'status' => DeliveryStatus::Sent,
            'provider_message_id' => $providerMessageId ?? $this->provider_message_id,
            'sent_at' => now(),
        ])->save();
    }

    public function markDelivered(?string $providerMessageId = null): void
    {
        $this->forceFill([
            'status' => DeliveryStatus::Delivered,
            'provider_message_id' => $providerMessageId ?? $this->provider_message_id,
            'sent_at' => $this->sent_at ?? now(),
            'delivered_at' => now(),
        ])->save();
    }

    public function markFailed(?string $error = null, ?string $reason = null): void
    {
        $this->forceFill([
            'status' => DeliveryStatus::Failed,
            'error' => $error,
            'reason' => $reason ?? $this->reason,
            'failed_at' => now(),
        ])->save();
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForRecipient($query, Model $recipient)
    {
        return $query
            ->where('recipient_type', $recipient->getMorphClass())
            ->where('recipient_id', $recipient->getKey());
    }
}

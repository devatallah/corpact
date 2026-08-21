<?php

namespace App\Services\Messaging;

use App\Enums\DeliveryStatus;
use App\Jobs\ConfirmMessageDelivery;
use App\Jobs\DeliverOutboundMessage;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Services\Messaging\Channels\OutboundChannel;
use App\Services\Notifications\CriticalAlertService;
use App\Support\Identity\PhoneNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;

/**
 * موزّع الرسائل الصادرة — قلب سلسلة القنوات (H §14).
 *
 * لكل رسالة: **واتساب ← (٦٠ ثانية بلا تأكيد تسليم، أو فوراً عند فشل صريح) ←
 * رسالة نصية**، والإشعار داخل المنصة يُكتب دائماً بمعزل عن هذه السلسلة
 * (يكتبه `NotificationDispatcher`).
 *
 * كل محاولة على كل قناة تُكتب سطراً في `notification_logs`. الفشل: ٣ محاولات
 * بتباعد أسي على القناة الواحدة، ثم القناة البديلة، ثم فشل نهائي + تنبيه أدمن.
 *
 * ترتيب القنوات المفعّلة يأتي من `messaging.chain` (قرار نشر)، بينما القالب
 * يقرر **هل** تُرسل رسالة خارجية أصلاً (بوجود قناة غير `in_app` في قنواته)
 * وأي قالب واتساب معتمد يُستخدم.
 */
class MessageDispatcher
{
    public function __construct(private CriticalAlertService $alerts) {}

    /**
     * جدولة رسالة صادرة: يُنشئ سطر السجل الأول ويطلق مهمة التسليم.
     *
     * @param  array<string, scalar|null>  $variables
     */
    public function queue(
        string $phone,
        string $body,
        string $purpose,
        ?string $templateKey = null,
        ?Model $recipient = null,
        array $variables = [],
        string $locale = 'ar',
        ?string $notificationId = null,
        ?Carbon $releaseAt = null,
    ): ?NotificationLog {
        $normalized = PhoneNumber::normalize($phone) ?? $phone;
        $chain = $this->chain();

        if ($chain === []) {
            return null;
        }

        $log = $this->log(
            channel: $chain[0],
            attempt: 1,
            status: $releaseAt !== null ? DeliveryStatus::Deferred : DeliveryStatus::Queued,
            phone: $normalized,
            body: $body,
            purpose: $purpose,
            templateKey: $templateKey,
            recipient: $recipient,
            variables: $variables,
            locale: $locale,
            notificationId: $notificationId,
            releaseAt: $releaseAt,
        );

        $job = DeliverOutboundMessage::dispatch($log->id);

        if ($releaseAt !== null) {
            $job->delay($releaseAt);
        }

        return $log;
    }

    /**
     * محاولة تسليم واحدة على القناة المسجّلة في السطر.
     */
    public function attempt(NotificationLog $log): void
    {
        if ($log->status->isTerminal() || $log->status === DeliveryStatus::Sent) {
            return;
        }

        $channel = $this->channel($log->channel);

        if ($channel === null) {
            $log->forceFill(['status' => DeliveryStatus::Skipped, 'reason' => 'unknown_channel'])->save();
            $this->escalate($log, 'unknown_channel');

            return;
        }

        if (! $channel->isConfigured()) {
            $log->forceFill(['status' => DeliveryStatus::Skipped, 'reason' => 'not_configured'])->save();
            $this->escalate($log, 'not_configured');

            return;
        }

        $result = $channel->deliver($this->message($log));

        if ($result->isDelivered()) {
            $log->markDelivered($result->providerMessageId);

            return;
        }

        if ($result->isAccepted()) {
            $log->markSent($result->providerMessageId);

            // قُبلت بلا تأكيد تسليم: تُمهَل ٦٠ ثانية ثم تُصعَّد للقناة البديلة.
            ConfirmMessageDelivery::dispatch($log->id)
                ->delay(now()->addSeconds((int) config('messaging.confirm_delivery_after_seconds', 60)));

            return;
        }

        if ($result->isNotConfigured()) {
            $log->forceFill(['status' => DeliveryStatus::Skipped, 'reason' => 'not_configured'])->save();
            $this->escalate($log, 'not_configured');

            return;
        }

        $log->markFailed($result->error, $result->isRetryable() ? 'retryable' : 'hard_failure');

        $maxAttempts = (int) config('messaging.retries.attempts', 3);

        if ($result->isRetryable() && $log->attempt < $maxAttempts) {
            $this->retry($log);

            return;
        }

        $this->escalate($log, $result->error ?? 'failed');
    }

    /**
     * انقضت مهلة تأكيد التسليم على قناة قبلت الرسالة ⇒ صعِّد إلى البديلة.
     * (H §4 — «إذا لم يصل رمز الواتساب خلال 60 ثانية يُرسل كرسالة نصية».)
     */
    public function confirmOrEscalate(NotificationLog $log): void
    {
        if ($log->status !== DeliveryStatus::Sent) {
            return;
        }

        $log->forceFill(['reason' => 'no_delivery_confirmation'])->save();

        $this->escalate($log, 'no_delivery_confirmation');
    }

    /**
     * إعادة المحاولة على القناة نفسها بتباعد أسي.
     */
    private function retry(NotificationLog $log): void
    {
        $next = $this->clone($log, $log->channel, $log->attempt + 1);

        DeliverOutboundMessage::dispatch($next->id)
            ->delay(now()->addSeconds($this->backoff($next->attempt)));
    }

    /**
     * الانتقال للقناة التالية في السلسلة — أو الفشل النهائي + تنبيه الأدمن.
     */
    private function escalate(NotificationLog $log, string $reason): void
    {
        $chain = $this->chain();
        $index = array_search($log->channel, $chain, true);
        $next = $index === false ? null : ($chain[$index + 1] ?? null);

        if ($next === null) {
            $this->giveUp($log, $reason);

            return;
        }

        DeliverOutboundMessage::dispatch($this->clone($log, $next, 1)->id);
    }

    private function giveUp(NotificationLog $log, string $reason): void
    {
        if ($log->status !== DeliveryStatus::Failed) {
            $log->markFailed($log->error, $reason);
        }

        // فشل تسليم رسالة إلزامية بعد كل القنوات حدث يستحق أدمن يقظاً.
        $this->alerts->raise(
            key: 'notification.delivery_failed',
            title: 'فشل تسليم رسالة على كل القنوات',
            body: "القالب [{$log->template_key}] إلى {$log->recipient_phone} — آخر سبب: {$reason}",
            context: [
                'notification_log_id' => $log->id,
                'template_key' => $log->template_key,
                'recipient_type' => $log->recipient_type,
                'recipient_id' => $log->recipient_id,
                'reason' => $reason,
            ],
        );
    }

    private function message(NotificationLog $log): OutboundMessage
    {
        $template = $log->template_key === null
            ? null
            : NotificationTemplate::query()->where('key', $log->template_key)->first();

        return new OutboundMessage(
            phone: (string) $log->recipient_phone,
            body: (string) $log->rendered_body,
            purpose: (string) ($log->purpose ?? $log->template_key ?? 'notification'),
            templateName: $template?->whatsapp_template_name,
            variables: $this->positionalVariables($template, (array) $log->variables),
            language: (string) $log->locale,
        );
    }

    /**
     * متحوّلات واتساب الموضعية {{1}},{{2}} … بترتيب القالب المعتمد.
     *
     * @param  array<string, scalar|null>  $variables
     * @return array<int, string>
     */
    private function positionalVariables(?NotificationTemplate $template, array $variables): array
    {
        $order = $template?->whatsapp_variables;

        if (! is_array($order) || $order === []) {
            return [];
        }

        return array_map(
            fn ($name) => (string) ($variables[$name] ?? ''),
            array_values($order),
        );
    }

    private function clone(NotificationLog $log, string $channel, int $attempt): NotificationLog
    {
        return $this->log(
            channel: $channel,
            attempt: $attempt,
            status: DeliveryStatus::Queued,
            phone: (string) $log->recipient_phone,
            body: (string) $log->rendered_body,
            purpose: (string) $log->purpose,
            templateKey: $log->template_key,
            recipient: null,
            variables: (array) $log->variables,
            locale: (string) $log->locale,
            notificationId: $log->notification_id,
            releaseAt: null,
            recipientType: $log->recipient_type,
            recipientId: $log->recipient_id,
        );
    }

    /**
     * @param  array<string, scalar|null>  $variables
     */
    private function log(
        string $channel,
        int $attempt,
        DeliveryStatus $status,
        string $phone,
        string $body,
        string $purpose,
        ?string $templateKey,
        ?Model $recipient,
        array $variables,
        string $locale,
        ?string $notificationId,
        ?Carbon $releaseAt,
        ?string $recipientType = null,
        ?int $recipientId = null,
    ): NotificationLog {
        return NotificationLog::query()->create([
            'template_key' => $templateKey,
            'notification_id' => $notificationId,
            'recipient_type' => $recipient?->getMorphClass() ?? $recipientType,
            'recipient_id' => $recipient?->getKey() ?? $recipientId,
            'recipient_phone' => $phone,
            'channel' => $channel,
            'status' => $status,
            'attempt' => $attempt,
            'variables' => $variables,
            'rendered_body' => $body,
            'locale' => $locale,
            'purpose' => $purpose,
            'queued_at' => now(),
            'deferred_until' => $releaseAt,
        ]);
    }

    private function backoff(int $attempt): int
    {
        /** @var array<int, int> $backoff */
        $backoff = (array) config('messaging.retries.backoff_seconds', [60, 300, 900]);

        return (int) ($backoff[$attempt - 2] ?? end($backoff) ?: 60);
    }

    /**
     * @return array<int, string>
     */
    public function chain(): array
    {
        $chain = array_values(array_filter(array_map(
            fn ($name) => trim((string) $name),
            (array) config('messaging.chain', []),
        )));

        return array_values(array_unique($chain));
    }

    public function channel(string $name): ?OutboundChannel
    {
        $class = config("messaging.channels.{$name}");

        if (! is_string($class) || ! class_exists($class)) {
            return null;
        }

        $instance = App::make($class);

        return $instance instanceof OutboundChannel ? $instance : null;
    }
}

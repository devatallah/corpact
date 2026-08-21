<?php

namespace App\Services\Messaging\Channels;

use App\Services\Messaging\DeliveryResult;
use App\Services\Messaging\OutboundMessage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * درايفر الرسائل النصية — القناة البديلة الكاملة (H §4/§14).
 *
 * «يجب أن تعمل الرسائل النصية كقناة بديلة كاملة قابلة للتشغيل منفردة قبل أي
 * إطلاق تجريبي» — لذلك هذا الدرايفر مستقل تماماً عن واتساب، ويصلح وحده لتسليم
 * رموز الدخول.
 *
 * بوابة عامة عبر HTTP: العنوان والطريقة والاعتمادات وأسماء الحقول كلها من
 * `config/messaging.php` (`sms.field_map`) حتى يُركّب المالك أي مزوّد محلي بلا
 * تعديل كود. **لا اعتمادات مخترعة**: بلا إعداد كامل يعيد `notConfigured`.
 */
class SmsChannel implements OutboundChannel
{
    public function name(): string
    {
        return 'sms';
    }

    public function isConfigured(): bool
    {
        $config = $this->config();

        return (bool) ($config['enabled'] ?? false)
            && filled($config['endpoint'] ?? null);
    }

    public function send(string $phone, string $message, string $purpose): bool
    {
        return $this->deliver(new OutboundMessage(
            phone: $phone,
            body: $message,
            purpose: $purpose,
        ))->isSuccessful();
    }

    public function deliver(OutboundMessage $message): DeliveryResult
    {
        if (! $this->isConfigured()) {
            return DeliveryResult::notConfigured($this->name());
        }

        $config = $this->config();
        $method = mb_strtolower((string) ($config['method'] ?? 'post'));

        try {
            $request = Http::timeout((int) ($config['timeout'] ?? 10))->acceptJson();

            if (filled($config['token'] ?? null)) {
                $request = $request->withToken((string) $config['token']);
            }

            if (filled($config['basic_auth_username'] ?? null)) {
                $request = $request->withBasicAuth(
                    (string) $config['basic_auth_username'],
                    (string) ($config['basic_auth_password'] ?? ''),
                );
            }

            $payload = $this->payload($message);

            $response = $method === 'get'
                ? $request->get((string) $config['endpoint'], $payload)
                : $request->asJson()->post((string) $config['endpoint'], $payload);
        } catch (ConnectionException $e) {
            return DeliveryResult::retryable('تعذّر الاتصال ببوابة الرسائل النصية: '.$e->getMessage());
        } catch (Throwable $e) {
            Log::warning('SMS delivery threw.', ['error' => $e->getMessage()]);

            return DeliveryResult::retryable($e->getMessage());
        }

        if ($response->serverError() || $response->status() === 429) {
            return DeliveryResult::retryable('بوابة الرسائل النصية أعادت '.$response->status().': '.$response->body());
        }

        if ($response->failed()) {
            return DeliveryResult::failed('بوابة الرسائل النصية أعادت '.$response->status().': '.$response->body());
        }

        // بوابات الرسائل النصية تؤكد القبول فوراً؛ إن كان للمزوّد ويبهوك تسليم
        // فيُحدَّث السجل لاحقاً عبر `NotificationLog::markDelivered`.
        $id = data_get($response->json(), (string) ($config['response_id_path'] ?? 'id'));

        return DeliveryResult::delivered(is_scalar($id) ? (string) $id : null);
    }

    /**
     * حقول الطلب بأسماء البوابة — لا افتراض عن مزوّد بعينه.
     *
     * @return array<string, mixed>
     */
    protected function payload(OutboundMessage $message): array
    {
        $config = $this->config();

        /** @var array<string, string> $map */
        $map = (array) ($config['field_map'] ?? []);

        $payload = [
            ($map['to'] ?? 'to') => $message->phone,
            ($map['body'] ?? 'body') => $message->body,
        ];

        if (filled($config['sender'] ?? null)) {
            $payload[$map['sender'] ?? 'sender'] = (string) $config['sender'];
        }

        return $payload + (array) ($config['extra_fields'] ?? []);
    }

    /** @return array<string, mixed> */
    protected function config(): array
    {
        return (array) config('messaging.sms', []);
    }
}

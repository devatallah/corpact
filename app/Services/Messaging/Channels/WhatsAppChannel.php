<?php

namespace App\Services\Messaging\Channels;

use App\Services\Messaging\DeliveryResult;
use App\Services\Messaging\OutboundMessage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * درايفر WhatsApp Business Cloud API — القناة الأساسية (H §14) وقناة رموز
 * الدخول (H §4).
 *
 * كل شيء من الإعداد: عنوان الـ API، إصداره، معرّف رقم الإرسال، الرمز، وخريطة
 * أسماء القوالب المعتمدة. **لا اعتمادات مكتوبة في الكود ولا مخترعة** — حساب
 * واتساب واعتماد القوالب إجراء مالك (أيام إلى أسابيع، وهو على المسار الحرج).
 * ما دامت الاعتمادات ناقصة يعيد الدرايفر `notConfigured` بهدوء فينتقل
 * الموزِّع إلى الرسائل النصية، ولا يتعطل الدخول ولا أي إشعار.
 *
 * ملاحظة على قوالب واتساب: خارج نافذة الجلسة (٢٤ ساعة) لا يقبل المزوّد نصاً
 * حراً، فتُرسل الرسالة كقالب معتمد بمتحوّلات موضعية. لذلك يحمل كل قالب في
 * `notification_templates` اسم قالب واتساب وترتيب متحوّلاته؛ القالب الذي لا
 * يحمل اسماً معتمداً يُرسل نصاً حراً (يعمل داخل نافذة الجلسة فقط).
 */
class WhatsAppChannel implements OutboundChannel
{
    public function name(): string
    {
        return 'whatsapp';
    }

    public function isConfigured(): bool
    {
        $config = $this->config();

        return (bool) ($config['enabled'] ?? false)
            && filled($config['phone_number_id'] ?? null)
            && filled($config['token'] ?? null);
    }

    public function send(string $phone, string $message, string $purpose): bool
    {
        return $this->deliver(new OutboundMessage(
            phone: $phone,
            body: $message,
            purpose: $purpose,
            templateName: $this->templateFor($purpose),
        ))->isSuccessful();
    }

    public function deliver(OutboundMessage $message): DeliveryResult
    {
        if (! $this->isConfigured()) {
            return DeliveryResult::notConfigured($this->name());
        }

        $config = $this->config();

        try {
            $response = Http::withToken((string) $config['token'])
                ->timeout((int) ($config['timeout'] ?? 10))
                ->acceptJson()
                ->asJson()
                ->post($this->endpoint(), $this->payload($message));
        } catch (ConnectionException $e) {
            return DeliveryResult::retryable('تعذّر الاتصال بواتساب: '.$e->getMessage());
        } catch (Throwable $e) {
            Log::warning('WhatsApp delivery threw.', ['error' => $e->getMessage()]);

            return DeliveryResult::retryable($e->getMessage());
        }

        if ($response->serverError() || $response->status() === 429) {
            return DeliveryResult::retryable('واتساب أعاد '.$response->status().': '.$response->body());
        }

        if ($response->failed()) {
            return DeliveryResult::failed('واتساب أعاد '.$response->status().': '.$response->body());
        }

        // الـ Cloud API يقبل الرسالة ويؤكد تسليمها لاحقاً بويبهوك؛ لذلك
        // «قُبلت» لا «سُلّمت» — وهذا ما يشغّل مهلة الـ ٦٠ ثانية.
        $id = data_get($response->json(), 'messages.0.id');

        return DeliveryResult::accepted(is_string($id) ? $id : null);
    }

    /**
     * حمولة الطلب: قالب معتمد إن وُجد اسمه، وإلا نص حر (نافذة الجلسة).
     *
     * @return array<string, mixed>
     */
    protected function payload(OutboundMessage $message): array
    {
        $base = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $message->phone,
        ];

        if ($message->templateName === null) {
            return $base + [
                'type' => 'text',
                'text' => ['preview_url' => false, 'body' => $message->body],
            ];
        }

        $parameters = array_map(
            fn (string $value) => ['type' => 'text', 'text' => $value],
            $message->variables !== [] ? array_values($message->variables) : [$message->body],
        );

        return $base + [
            'type' => 'template',
            'template' => [
                'name' => $message->templateName,
                'language' => ['code' => $message->language ?: (string) ($this->config()['default_language'] ?? 'ar')],
                'components' => [
                    ['type' => 'body', 'parameters' => $parameters],
                ],
            ],
        ];
    }

    protected function endpoint(): string
    {
        $config = $this->config();

        return rtrim((string) $config['base_url'], '/')
            .'/'.trim((string) $config['api_version'], '/')
            .'/'.(string) $config['phone_number_id'].'/messages';
    }

    /** اسم قالب واتساب المعتمد لغرض معيّن (رموز الدخول، الدعوات …). */
    protected function templateFor(string $purpose): ?string
    {
        $templates = (array) ($this->config()['templates'] ?? []);

        $name = $templates[$purpose] ?? $templates['default'] ?? null;

        return is_string($name) && $name !== '' ? $name : null;
    }

    /** @return array<string, mixed> */
    protected function config(): array
    {
        return (array) config('messaging.whatsapp', []);
    }
}

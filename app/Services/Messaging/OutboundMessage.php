<?php

namespace App\Services\Messaging;

/**
 * رسالة صادرة واحدة كما تُسلَّم للدرايفر.
 *
 * `body` هو النص المرسوم من القالب. `templateName`/`variables` تخدم قنوات
 * القوالب المعتمدة (واتساب) التي لا تقبل نصاً حراً خارج نافذة الجلسة.
 */
final class OutboundMessage
{
    /**
     * @param  array<int, string>  $variables  متحوّلات موضعية بترتيب {{1}}, {{2}} …
     */
    public function __construct(
        public readonly string $phone,
        public readonly string $body,
        public readonly string $purpose,
        public readonly ?string $templateName = null,
        public readonly array $variables = [],
        public readonly string $language = 'ar',
    ) {}
}

<?php

namespace App\Services\Notifications;

use App\Models\NotificationTemplate;

/**
 * نص رسالة مرسوم من قالب بمتحوّلاته.
 */
final class RenderedMessage
{
    /**
     * @param  array<string, scalar|null>  $variables
     * @param  array<int, string>  $missingVariables  متحوّلات ظهرت في النص ولم تُمرَّر
     */
    public function __construct(
        public readonly string $key,
        public readonly string $title,
        public readonly string $body,
        public readonly string $locale,
        public readonly array $variables = [],
        public readonly ?NotificationTemplate $template = null,
        public readonly array $missingVariables = [],
    ) {}

    /** هل رُسمت من قالب حقيقي، أم من مسار الاحتياط عند غياب القالب؟ */
    public function hasTemplate(): bool
    {
        return $this->template !== null;
    }
}

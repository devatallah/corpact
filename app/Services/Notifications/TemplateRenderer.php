<?php

namespace App\Services\Notifications;

use App\Models\NotificationTemplate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * رسم نص الرسالة من قالب مُدار (H §14).
 *
 * المتحوّلات بالشكل `{name}`. اللغة: العربية أساسية والإنجليزية اختيارية —
 * غياب النص الإنجليزي يسقط على العربي بدل أن يرسل فراغاً.
 *
 * **مسار الاحتياط عند غياب القالب**: لا نرمي استثناء أبداً. إشعار بلا قالب
 * يجب ألا يُسقط معاملة مالية أو انتقال حالة؛ يُرسم نص احتياطي، ويُسجَّل
 * التحذير، ويظهر النقص في `notification_logs` بسبب `template_missing`.
 */
class TemplateRenderer
{
    /**
     * @param  array<string, scalar|null>  $variables
     */
    public function render(string $key, array $variables = [], ?string $locale = null, ?string $fallbackBody = null, ?string $fallbackTitle = null): RenderedMessage
    {
        $locale = $this->normalizeLocale($locale);
        $template = $this->find($key);

        if ($template === null || ! $template->active) {
            return $this->fallback($key, $variables, $locale, $fallbackBody, $fallbackTitle, $template !== null);
        }

        $title = $this->pick($template->title_ar, $template->title_en, $locale);
        $body = $this->pick($template->body_ar, $template->body_en, $locale);

        return new RenderedMessage(
            key: $key,
            title: $this->interpolate($title, $variables),
            body: $this->interpolate($body, $variables),
            locale: $locale,
            variables: $variables,
            template: $template,
            missingVariables: $this->missing($title.' '.$body, $variables),
        );
    }

    /** قالب واحد من الخريطة المخزّنة. */
    public function find(string $key): ?NotificationTemplate
    {
        return $this->map()->get($key);
    }

    /** خريطة القوالب المُهيَّأة لهذا الطلب — تُبنى مرة واحدة. */
    private ?Collection $memo = null;

    /**
     * كل القوالب مفهرسة بالمفتاح. تُخزَّن مؤقتاً لأن مسارات الإشعارات تُنادى
     * في حلقات (أعضاء مجتمع، مشاركو فعالية).
     *
     * **ما يُخزَّن صفوف خام لا كائنات Eloquent**: مشغّلات الذاكرة التي تسلسل
     * القيمة (file/database/redis) لا تعيد Collection من نماذج، فتنكسر أي
     * عملية Collection على المُستَرجَع — وهذا لا يظهر في الاختبارات لأن
     * مشغّل `array` يعيد الكائن نفسه بلا تسلسل. التخزين صفوفاً والتهيئة بعد
     * الاسترجاع يجعل السلوك واحداً على كل المشغّلات.
     *
     * @return Collection<string, NotificationTemplate>
     */
    public function map(): Collection
    {
        if ($this->memo !== null) {
            return $this->memo;
        }

        /** @var array<int, array<string, mixed>> $rows */
        $rows = Cache::remember(
            NotificationTemplate::CACHE_KEY,
            now()->addMinutes(10),
            fn () => NotificationTemplate::query()->get()
                ->map(fn (NotificationTemplate $template) => $template->getAttributes())
                ->all(),
        );

        return $this->memo = collect($rows)->mapWithKeys(function (array $attributes) {
            $template = (new NotificationTemplate)->newFromBuilder($attributes);

            return [(string) $template->key => $template];
        });
    }

    /** تُنادى من الاختبارات وبعد تحرير الأدمن لإسقاط الخريطة المُهيَّأة. */
    public function flush(): void
    {
        $this->memo = null;
        Cache::forget(NotificationTemplate::CACHE_KEY);
    }

    /**
     * استبدال `{name}` بقيمها. المتحوّل الغائب يُترك حرفياً كما هو ليَظهر
     * النقص في السجل بدل أن يختفي بصمت.
     *
     * @param  array<string, scalar|null>  $variables
     */
    public function interpolate(string $text, array $variables): string
    {
        if ($text === '' || ! str_contains($text, '{')) {
            return $text;
        }

        return (string) preg_replace_callback(
            '/\{([a-zA-Z0-9_.]+)\}/',
            function (array $matches) use ($variables): string {
                $name = $matches[1];

                if (! array_key_exists($name, $variables) || $variables[$name] === null) {
                    return $matches[0];
                }

                return (string) $variables[$name];
            },
            $text,
        );
    }

    /**
     * أسماء المتحوّلات المذكورة في نص القالب — تستخدمها شاشة الأدمن.
     *
     * @return array<int, string>
     */
    public function declaredVariables(string $text): array
    {
        preg_match_all('/\{([a-zA-Z0-9_.]+)\}/', $text, $matches);

        return array_values(array_unique($matches[1] ?? []));
    }

    /**
     * @param  array<string, scalar|null>  $variables
     * @return array<int, string>
     */
    private function missing(string $text, array $variables): array
    {
        return array_values(array_filter(
            $this->declaredVariables($text),
            fn (string $name) => ! array_key_exists($name, $variables) || $variables[$name] === null,
        ));
    }

    /**
     * @param  array<string, scalar|null>  $variables
     */
    private function fallback(string $key, array $variables, string $locale, ?string $body, ?string $title, bool $inactive): RenderedMessage
    {
        Log::warning($inactive
            ? "قالب الإشعار [{$key}] معطَّل — أُرسل نص احتياطي."
            : "قالب الإشعار [{$key}] غير موجود — أُرسل نص احتياطي.", ['variables' => array_keys($variables)]);

        $body ??= $this->genericBody($variables);
        $title ??= 'إشعار';

        return new RenderedMessage(
            key: $key,
            title: $this->interpolate($title, $variables),
            body: $this->interpolate($body, $variables),
            locale: $locale,
            variables: $variables,
            template: null,
        );
    }

    /**
     * @param  array<string, scalar|null>  $variables
     */
    private function genericBody(array $variables): string
    {
        $readable = array_filter(
            $variables,
            fn ($value) => is_scalar($value) && (string) $value !== '',
        );

        return $readable === []
            ? 'لديك إشعار جديد.'
            : 'لديك إشعار جديد: '.implode('، ', array_map(
                fn ($k, $v) => "{$k}: {$v}",
                array_keys($readable),
                array_values($readable),
            ));
    }

    private function pick(?string $ar, ?string $en, string $locale): string
    {
        if ($locale === 'en') {
            return $en !== null && $en !== '' ? $en : (string) $ar;
        }

        return (string) ($ar !== null && $ar !== '' ? $ar : $en);
    }

    /**
     * لغة الرسالة **لا تتبع `app.locale`** عمداً: المنصة عربية بالكامل (كل نص
     * واجهة مكتوب عربياً)، بينما `APP_LOCALE=en` بقية من قالب Laravel الأصلي —
     * لو تبعناها لأرسلنا رسائل إنجليزية لموظفين سعوديين. اللغة تأتي من إعداد
     * صريح أو من نداء الإرسال، لا من إعداد الإطار.
     */
    private function normalizeLocale(?string $locale): string
    {
        $locale ??= (string) config('messaging.default_locale', 'ar');

        return str_starts_with($locale, 'en') ? 'en' : 'ar';
    }
}

<?php

namespace App\Models;

use App\Enums\NotificationClass;
use App\Services\Notifications\TemplateRenderer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * نص رسالة واحد يديره أدمن تيمات (H §14 — «القوالب يديرها أدمن تيمات فقط،
 * ولا تُكتب نصوص الرسائل داخل الكود»).
 *
 * المتحوّلات تُكتب داخل النص بالشكل `{name}`؛ والقالب هو صاحب القرار في
 * التصنيف (إلزامي/اختياري) وترتيب القنوات المسموحة.
 */
#[Fillable([
    'key',
    'group',
    'audience',
    'class',
    'title_ar',
    'title_en',
    'body_ar',
    'body_en',
    'channels',
    'whatsapp_template_name',
    'whatsapp_variables',
    'variables',
    'in_app_type',
    'active',
])]
class NotificationTemplate extends Model
{
    /** مفتاح ذاكرة القوالب — تُمسح عند أي كتابة. */
    public const CACHE_KEY = 'notification_templates.map';

    protected static function booted(): void
    {
        // يُسقط ذاكرة الطلب وذاكرة المشغّل معاً — تحرير الأدمن يجب أن يظهر في
        // أول رسالة بعده، لا بعد عشر دقائق.
        $flush = fn () => app(TemplateRenderer::class)->flush();

        static::saved($flush);
        static::deleted($flush);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'class' => NotificationClass::class,
            'channels' => 'array',
            'whatsapp_variables' => 'array',
            'variables' => 'array',
            'active' => 'boolean',
        ];
    }

    public function isMandatory(): bool
    {
        return $this->class === NotificationClass::Mandatory;
    }

    /** هل يستطيع المستخدم إيقاف هذا القالب؟ الإلزامي: أبداً. */
    public function isDisableable(): bool
    {
        return ! $this->isMandatory();
    }

    /** القنوات الخارجية (ما عدا داخل المنصة) بترتيب القالب. */
    public function outboundChannels(): array
    {
        return array_values(array_filter(
            (array) ($this->channels ?? []),
            fn ($channel) => $channel !== 'in_app',
        ));
    }

    public function deliversInApp(): bool
    {
        return in_array('in_app', (array) ($this->channels ?? []), true);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOptional($query)
    {
        return $query->where('class', NotificationClass::Optional->value);
    }
}

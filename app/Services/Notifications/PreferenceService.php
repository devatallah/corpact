<?php

namespace App\Services\Notifications;

use App\Models\NotificationPreference;
use App\Models\NotificationTemplate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * تفضيلات الإشعارات (H §14).
 *
 * القاعدة الوحيدة التي لا تُخترق: **الإلزامي لا يُوقف**. أي محاولة لتخزين
 * تفضيل لقالب إلزامي تُرفض على مستوى الخدمة، لا على مستوى الواجهة فقط.
 */
class PreferenceService
{
    public function __construct(private TemplateRenderer $templates) {}

    /**
     * هل يستقبل هذا المستلم رسائل هذا القالب؟
     * الافتراضي: نعم — الإيقاف فعل صريح.
     */
    public function allows(Model $notifiable, string $templateKey): bool
    {
        $template = $this->templates->find($templateKey);

        // قالب غير معروف أو إلزامي ⇒ يمر دائماً.
        if ($template === null || $template->isMandatory()) {
            return true;
        }

        $preference = NotificationPreference::query()
            ->where('notifiable_type', $notifiable->getMorphClass())
            ->where('notifiable_id', $notifiable->getKey())
            ->where('template_key', $templateKey)
            ->first();

        return $preference === null || $preference->enabled;
    }

    /**
     * تعيين تفضيل واحد. يعيد false إذا كان القالب إلزامياً (لا يُخزَّن شيء).
     */
    public function set(Model $notifiable, string $templateKey, bool $enabled): bool
    {
        $template = $this->templates->find($templateKey);

        if ($template === null || $template->isMandatory()) {
            return false;
        }

        NotificationPreference::query()->updateOrCreate(
            [
                'notifiable_type' => $notifiable->getMorphClass(),
                'notifiable_id' => $notifiable->getKey(),
                'template_key' => $templateKey,
            ],
            ['enabled' => $enabled],
        );

        return true;
    }

    /**
     * تعيين دفعة تفضيلات — تتجاهل المفاتيح الإلزامية وغير المعروفة بصمت.
     *
     * @param  array<string, bool>  $values
     * @return int عدد التفضيلات التي طُبِّقت فعلاً
     */
    public function setMany(Model $notifiable, array $values): int
    {
        $applied = 0;

        foreach ($values as $key => $enabled) {
            if ($this->set($notifiable, (string) $key, (bool) $enabled)) {
                $applied++;
            }
        }

        return $applied;
    }

    /**
     * القوالب الاختيارية القابلة للعرض في ملف المستخدم، مع حالتها الحالية.
     *
     * @return Collection<int, array{key: string, title: string, group: string, audience: string|null, enabled: bool}>
     */
    public function editable(Model $notifiable): Collection
    {
        $disabled = NotificationPreference::query()
            ->where('notifiable_type', $notifiable->getMorphClass())
            ->where('notifiable_id', $notifiable->getKey())
            ->pluck('enabled', 'template_key');

        return $this->templates->map()
            ->filter(fn (NotificationTemplate $t) => $t->active && $t->isDisableable())
            ->sortBy(['group', 'key'])
            ->values()
            ->map(fn (NotificationTemplate $t) => [
                'key' => $t->key,
                'title' => $t->title_ar,
                'group' => $t->group,
                'audience' => $t->audience,
                'enabled' => (bool) ($disabled[$t->key] ?? true),
            ]);
    }
}

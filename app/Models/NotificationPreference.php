<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * تفضيل مستخدم واحد لقالب اختياري واحد (H §14).
 *
 * القاعدة الحاكمة مفروضة في `PreferenceService`: لا يُقبل صفّ تفضيل لقالب
 * **إلزامي** أصلاً — المستخدم «لا يستطيع إيقاف الإلزامية».
 */
#[Fillable([
    'notifiable_type',
    'notifiable_id',
    'template_key',
    'enabled',
])]
class NotificationPreference extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}

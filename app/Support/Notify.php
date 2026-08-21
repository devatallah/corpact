<?php

namespace App\Support;

use App\Models\Notification;
use App\Models\NotificationLog;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Facade;

/**
 * الواجهة المختصرة لإرسال الإشعارات (H §14).
 *
 * ```php
 * Notify::send('event.confirmed.participant', $employee, [
 *     'community' => $event->community->name,
 *     'date'      => $event->startsAt()->timezone('Asia/Riyadh')->format('Y-m-d H:i'),
 * ], ['data' => ['event_id' => $event->id]]);
 * ```
 *
 * قاعدة الاستعمال الوحيدة: **لا نص رسالة داخل الكود**. موضع الاستدعاء يمرر
 * مفتاح القالب ومتحوّلاته فقط؛ النص يملكه أدمن تيمات في
 * `notification_templates`.
 *
 * @method static Notification|null send(string $key, Model $recipient, array $variables = [], array $options = [])
 * @method static Notification|null sendToId(string $key, string $modelClass, int $id, array $variables = [], array $options = [])
 * @method static int sendToIds(string $key, string $modelClass, iterable $ids, array $variables = [], array $options = [])
 * @method static int sendMany(string $key, iterable $recipients, array $variables = [], array $options = [])
 * @method static NotificationLog|null toPhone(string $key, string $phone, array $variables = [], array $options = [])
 * @method static string|null phoneOf(Model $recipient, array $options = [])
 *
 * @see NotificationDispatcher
 */
class Notify extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return NotificationDispatcher::class;
    }
}

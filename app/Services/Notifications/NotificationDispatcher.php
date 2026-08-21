<?php

namespace App\Services\Notifications;

use App\Enums\DeliveryStatus;
use App\Enums\NotificationChannel;
use App\Models\Notification;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Services\Messaging\MessageDispatcher;
use App\Support\Identity\PhoneNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * نقطة الدخول الوحيدة لإرسال أي إشعار (H §14).
 *
 * كل موضع في التطبيق ينادي `Notify::send($key, $recipient, $vars)` — لا نص
 * رسالة داخل الكود، ولا `Notification::create` مباشرة.
 *
 * ما يفعله النداء الواحد بالترتيب:
 *   1. يرسم النص من القالب المُدار (وإن غاب القالب: نص احتياطي + تحذير).
 *   2. يحترم التفضيلات — للاختياري فقط؛ الإلزامي يمر دائماً.
 *   3. **يكتب الإشعار داخل المنصة دائماً** (قناة سحب لا توقظ أحداً).
 *   4. يجدول الرسالة الخارجية عبر سلسلة القنوات، مؤجَّلةً إلى 08:00 إن كانت
 *      اختيارية وكنا داخل نافذة الهدوء 22:00–08:00 بتوقيت الرياض.
 *   5. يسجل كل ذلك في `notification_logs`.
 */
class NotificationDispatcher
{
    /** @var array<string, Model|null> */
    private array $resolved = [];

    public function __construct(
        private TemplateRenderer $templates,
        private PreferenceService $preferences,
        private QuietHours $quietHours,
        private MessageDispatcher $messages,
    ) {}

    /**
     * إرسال إشعار واحد إلى مستلم واحد.
     *
     * @param  array<string, scalar|null>  $variables
     * @param  array{data?: array<string, mixed>, locale?: string, phone?: string, email?: string, purpose?: string, fallback_title?: string, fallback_body?: string, in_app?: bool}  $options
     */
    public function send(string $key, Model $recipient, array $variables = [], array $options = []): ?Notification
    {
        $template = $this->templates->find($key);

        // الاختياري المُوقَف: لا شيء إطلاقاً — «إيقاف» يجب أن يعني الإيقاف.
        if ($template !== null && $template->isDisableable() && ! $this->preferences->allows($recipient, $key)) {
            $this->skip($key, $recipient, $variables, 'opted_out', $options);

            return null;
        }

        $rendered = $this->templates->render(
            key: $key,
            variables: $variables,
            locale: $options['locale'] ?? null,
            fallbackBody: $options['fallback_body'] ?? null,
            fallbackTitle: $options['fallback_title'] ?? null,
        );

        $notification = null;

        if (($options['in_app'] ?? true) && ($template === null || $template->deliversInApp())) {
            $notification = $this->recordInApp($recipient, $rendered, $template, $options);
        }

        $this->deliverOutbound($key, $recipient, $rendered, $template, $variables, $options, $notification?->id);

        return $notification;
    }

    /**
     * إرسال إلى مستلم معروف بمعرّفه فقط (المسارات التي تعمل على قوائم معرّفات).
     *
     * يُحمَّل الصف مرة واحدة لكل طلب (خريطة هوية داخلية) لأن رقم الجوال لا
     * يُعرف بلا صف، وبلا رقم لا رسالة خارجية.
     *
     * @param  class-string<Model>  $modelClass
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    public function sendToId(string $key, string $modelClass, int $id, array $variables = [], array $options = []): ?Notification
    {
        $recipient = $this->resolve($modelClass, $id);

        return $recipient === null ? null : $this->send($key, $recipient, $variables, $options);
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  iterable<int, int|string>  $ids
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    public function sendToIds(string $key, string $modelClass, iterable $ids, array $variables = [], array $options = []): int
    {
        $sent = 0;

        foreach ($ids as $id) {
            if ($this->sendToId($key, $modelClass, (int) $id, $variables, $options) !== null) {
                $sent++;
            }
        }

        return $sent;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private function resolve(string $modelClass, int $id): ?Model
    {
        $cacheKey = $modelClass.'#'.$id;

        if (array_key_exists($cacheKey, $this->resolved)) {
            return $this->resolved[$cacheKey];
        }

        // بلا نطاقات عامة: المهام المجدولة تعبر الشركات بطبيعتها.
        return $this->resolved[$cacheKey] = $modelClass::query()->withoutGlobalScopes()->find($id);
    }

    /**
     * إرسال القالب نفسه إلى عدة مستلمين (أعضاء مجتمع، مشاركو فعالية).
     *
     * @param  iterable<int, Model>  $recipients
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    public function sendMany(string $key, iterable $recipients, array $variables = [], array $options = []): int
    {
        $sent = 0;

        foreach ($recipients as $recipient) {
            if ($recipient instanceof Model) {
                $this->send($key, $recipient, $variables, $options);
                $sent++;
            }
        }

        return $sent;
    }

    /**
     * إرسال إلى رقم جوال بلا حساب في المنصة (الدعوات قبل القبول).
     *
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    public function toPhone(string $key, string $phone, array $variables = [], array $options = []): ?NotificationLog
    {
        $rendered = $this->templates->render($key, $variables, $options['locale'] ?? null);
        $template = $rendered->template;

        return $this->messages->queue(
            phone: $phone,
            body: $rendered->body,
            purpose: $options['purpose'] ?? $key,
            templateKey: $key,
            recipient: null,
            variables: $variables,
            locale: $rendered->locale,
            notificationId: null,
            releaseAt: $this->quietHours->releaseAt($template === null || $template->isMandatory()),
        );
    }

    /**
     * الإشعار داخل المنصة — يُكتب دائماً ولا يعتمد على أي قناة خارجية.
     *
     * @param  array<string, mixed>  $options
     */
    private function recordInApp(Model $recipient, RenderedMessage $rendered, ?NotificationTemplate $template, array $options): Notification
    {
        /** @var array<string, mixed> $data */
        $data = $options['data'] ?? [];

        $notification = Notification::query()->create([
            'notifiable_type' => $recipient->getMorphClass(),
            'notifiable_id' => $recipient->getKey(),
            'type' => $template?->in_app_type ?? 'info',
            'template_key' => $rendered->key,
            'title' => $rendered->title,
            'body' => $rendered->body,
            'data' => $data,
        ]);

        NotificationLog::query()->create([
            'template_key' => $rendered->key,
            'notification_id' => $notification->id,
            'recipient_type' => $recipient->getMorphClass(),
            'recipient_id' => $recipient->getKey(),
            'recipient_phone' => $this->phoneOf($recipient, $options),
            'channel' => NotificationChannel::InApp->value,
            'status' => DeliveryStatus::Delivered,
            'attempt' => 1,
            'reason' => $rendered->hasTemplate() ? null : 'template_missing',
            'variables' => $rendered->variables,
            'rendered_body' => $rendered->body,
            'locale' => $rendered->locale,
            'purpose' => $options['purpose'] ?? $rendered->key,
            'queued_at' => now(),
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        return $notification;
    }

    /**
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    private function deliverOutbound(
        string $key,
        Model $recipient,
        RenderedMessage $rendered,
        ?NotificationTemplate $template,
        array $variables,
        array $options,
        ?string $notificationId,
    ): void {
        // قالب مجهول أو داخل المنصة فقط ⇒ لا رسالة خارجية.
        if ($template === null || $template->outboundChannels() === []) {
            return;
        }

        $phone = $this->phoneOf($recipient, $options);

        if ($phone !== null) {
            $this->messages->queue(
                phone: $phone,
                body: $rendered->body,
                purpose: $options['purpose'] ?? $key,
                templateKey: $key,
                recipient: $recipient,
                variables: $variables,
                locale: $rendered->locale,
                notificationId: $notificationId,
                releaseAt: $this->quietHours->releaseAt($template->isMandatory()),
            );

            return;
        }

        // ملاحظة A4: مستلم بلا رقم جوال (دعوة بالبريد) — البريد مسار أخير حتى
        // لا تسقط رسالة إلزامية بصمت لغياب رقم.
        $this->deliverByMail($key, $recipient, $rendered, $variables, $options, $notificationId);
    }

    /**
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    private function deliverByMail(
        string $key,
        Model $recipient,
        RenderedMessage $rendered,
        array $variables,
        array $options,
        ?string $notificationId,
    ): void {
        $email = $options['email'] ?? (is_string($recipient->getAttribute('email')) ? $recipient->getAttribute('email') : null);

        $log = NotificationLog::query()->create([
            'template_key' => $key,
            'notification_id' => $notificationId,
            'recipient_type' => $recipient->getMorphClass(),
            'recipient_id' => $recipient->getKey(),
            'recipient_phone' => null,
            'channel' => NotificationChannel::Mail->value,
            'status' => DeliveryStatus::Queued,
            'attempt' => 1,
            'reason' => 'no_phone',
            'variables' => $variables,
            'rendered_body' => $rendered->body,
            'locale' => $rendered->locale,
            'purpose' => $options['purpose'] ?? $key,
            'queued_at' => now(),
        ]);

        if ($email === null) {
            $log->forceFill([
                'status' => DeliveryStatus::Skipped,
                'reason' => 'no_phone_no_email',
            ])->save();

            return;
        }

        try {
            Mail::raw($rendered->body, function ($message) use ($email, $rendered) {
                $message->to($email)->subject($rendered->title);
            });

            $log->markDelivered();
        } catch (Throwable $e) {
            $log->markFailed($e->getMessage(), 'mail_failed');
        }
    }

    /**
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $options
     */
    private function skip(string $key, Model $recipient, array $variables, string $reason, array $options): void
    {
        NotificationLog::query()->create([
            'template_key' => $key,
            'recipient_type' => $recipient->getMorphClass(),
            'recipient_id' => $recipient->getKey(),
            'recipient_phone' => $this->phoneOf($recipient, $options),
            'channel' => NotificationChannel::InApp->value,
            'status' => DeliveryStatus::Skipped,
            'attempt' => 1,
            'reason' => $reason,
            'variables' => $variables,
            'locale' => $options['locale'] ?? 'ar',
            'purpose' => $options['purpose'] ?? $key,
            'queued_at' => now(),
        ]);
    }

    /**
     * رقم الجوال حسب نوع المستلم — الأعمدة تختلف بين الجداول القائمة.
     *
     * @param  array<string, mixed>  $options
     */
    public function phoneOf(Model $recipient, array $options = []): ?string
    {
        $raw = $options['phone'] ?? null;

        if (! is_string($raw) || $raw === '') {
            foreach (['phone', 'contact_phone', 'requester_phone'] as $column) {
                $value = $recipient->getAttribute($column);

                if (is_string($value) && $value !== '') {
                    $raw = $value;
                    break;
                }
            }
        }

        if (! is_string($raw) || $raw === '') {
            // الموظف بلا رقم قد يحمل حساباً عالمياً يحمله.
            $user = $recipient->getAttribute('user');
            $raw = is_object($user) && is_string($user->phone ?? null) ? $user->phone : null;
        }

        return is_string($raw) && $raw !== ''
            ? (PhoneNumber::normalize($raw) ?? $raw)
            : null;
    }
}

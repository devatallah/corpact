<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function __construct(public string $url) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تأكيد البريد الإلكتروني — تيمات')
            ->greeting('مرحبًا!')
            ->line('يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني.')
            ->action('تأكيد البريد الإلكتروني', $this->url)
            ->line('إذا لم تنشئ حسابًا، يمكنك تجاهل هذا البريد.')
            ->salutation('فريق تيمات');
    }
}

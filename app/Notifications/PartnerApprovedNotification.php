<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(public string $activationUrl) {}

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
            ->subject('تمت الموافقة على حسابك كشريك — تيمات')
            ->greeting("مرحبًا {$notifiable->name}!")
            ->line('يسعدنا إبلاغك بأنه تمت الموافقة على طلب تسجيلك كشريك في منصة تيمات.')
            ->line('يرجى الضغط على الزر أدناه لتفعيل حسابك وتعيين كلمة المرور.')
            ->action('تفعيل الحساب', $this->activationUrl)
            ->line('صلاحية هذا الرابط 72 ساعة.')
            ->salutation('فريق تيمات');
    }
}

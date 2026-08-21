<?php

namespace App\Enums;

/**
 * قنوات التسليم (H §14): «القناة الأساسية واتساب … والقناة البديلة رسالة
 * نصية، ثم إشعار داخل المنصة». `log` درايفر التطوير.
 */
enum NotificationChannel: string
{
    case WhatsApp = 'whatsapp';
    case Sms = 'sms';
    case InApp = 'in_app';

    /**
     * البريد ليس قناة في مصفوفة H §14 — أُضيف لحالة واحدة نصّت عليها ملاحظة A4:
     * دعوة موظف **بلا رقم جوال** لا يُسلَّم لها شيء عبر قناة الرسائل.
     */
    case Mail = 'mail';

    case Log = 'log';

    /** قنوات تحتاج رقم جوال. */
    public function needsPhone(): bool
    {
        return ! in_array($this, [self::InApp, self::Mail], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::WhatsApp => 'واتساب',
            self::Sms => 'رسالة نصية',
            self::InApp => 'داخل المنصة',
            self::Mail => 'بريد إلكتروني',
            self::Log => 'سجل التطوير',
        };
    }
}

<?php

namespace App\Enums;

/**
 * H §14: «المستخدم يستطيع إيقاف الإشعارات الاختيارية فقط، ولا يستطيع إيقاف
 * الإلزامية». التصنيف خاصية على القالب لا على موضع الاستدعاء.
 */
enum NotificationClass: string
{
    case Mandatory = 'mandatory';
    case Optional = 'optional';

    public function isMandatory(): bool
    {
        return $this === self::Mandatory;
    }

    public function label(): string
    {
        return match ($this) {
            self::Mandatory => 'إلزامي',
            self::Optional => 'اختياري',
        };
    }
}

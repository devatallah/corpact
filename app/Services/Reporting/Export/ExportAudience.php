<?php

namespace App\Services\Reporting\Export;

use App\Enums\Role;

/**
 * A13 — من يصدّر، وبأي حق (H §15).
 *
 * الجمهور ليس «الدور» بل **موقع المصدِّر من البيانات**: مسؤول الحساب يصدّر في
 * نطاق شركته، والقائد في نطاق مجتمعه بلا مالية، والمنسّق في نطاق الشركات
 * المسندة إليه، وأدمن المنصة بلا نطاق — **ولا أحد منهم غير مسؤول الحساب يرى
 * جوال موظف** (نص المواصفة حرفياً، وأدمن المنصة مشمول بالمنع).
 */
enum ExportAudience: string
{
    case AccountManager = 'account_manager';
    case CommunityLeader = 'community_leader';
    case Coordinator = 'coordinator';
    case PlatformAdmin = 'platform_admin';

    public function label(): string
    {
        return match ($this) {
            self::AccountManager => 'مسؤول الحساب',
            self::CommunityLeader => 'قائد المجتمع',
            self::Coordinator => 'المنسّق المُدار',
            self::PlatformAdmin => 'أدمن تيمات',
        };
    }

    /**
     * «أرقام جوال الموظفين لا تظهر في أي تصدير إلا لمسؤول الحساب» — منع مطلق
     * لا استثناء فيه لأدمن المنصة.
     */
    public function allowsPhone(): bool
    {
        return $this === self::AccountManager;
    }

    /**
     * «القائد يصدّر بيانات مجتمعه بلا أي بيانات مالية».
     */
    public function allowsFinancial(): bool
    {
        return $this !== self::CommunityLeader;
    }

    /**
     * الجمهور المقابل لدور المواصفة.
     */
    public static function fromRole(Role $role): self
    {
        return match ($role) {
            Role::AccountManager => self::AccountManager,
            Role::CommunityLeader => self::CommunityLeader,
            Role::Coordinator => self::Coordinator,
            default => self::PlatformAdmin,
        };
    }
}

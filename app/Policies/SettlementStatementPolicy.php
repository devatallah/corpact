<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\SettlementStatement;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

/**
 * كشف التسوية (H §12.7) يخص **المزوّد** وتيمات فقط — لا الشركة: الشركة تدفع
 * رسوم النظام بفاتورتها، ولا شأن لها بما يُصرف للمزوّد. الإنشاء والاعتماد
 * والصرف كلها أفعال أدمن خلف صلاحية `settlement.approve` في المسارات.
 */
class SettlementStatementPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return $user instanceof User || $user instanceof Partner;
    }

    public function view(Authenticatable $user, SettlementStatement $statement): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Partner => $user->resolvedPartnerId() === (int) $statement->partner_id,
            default => false,
        };
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof User;
    }

    public function update(Authenticatable $user, SettlementStatement $statement): bool
    {
        // «الكشف المدفوع لا يُعدَّل إطلاقاً» (H §12.7) — حتى للأدمن.
        return $user instanceof User && ! $statement->isPaid();
    }

    /**
     * لا حذف لسجل مالي — لا لأحد (القاعدة الثانية: لا تصحيح بالحذف).
     */
    public function delete(Authenticatable $user, SettlementStatement $statement): bool
    {
        return false;
    }

    public function forceDelete(Authenticatable $user, SettlementStatement $statement): bool
    {
        return false;
    }
}

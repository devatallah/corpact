<?php

namespace App\Support\Authorization;

use App\Contracts\FinancialAction;
use App\Exceptions\SelfApprovalException;
use App\Models\User;

/**
 * The code-level enforcement of the universal financial rule (H §3,
 * ملحق ب): «لا يعتمد أي شخص إجراءً مالياً أنشأه بنفسه» — من رفع طلب
 * اعتماد التحويل لا يعتمده، ومن أنشأ كشف التسوية لا يعتمد صرفه.
 *
 * Later briefs (A6 bank top-ups, A11 settlements/invoices) call this at
 * every approval site.
 */
class SelfApprovalGuard
{
    /**
     * @throws SelfApprovalException
     */
    public static function assertNotSelfApproval(User|int|null $actor, FinancialAction|User|int|null $creator): void
    {
        $actorId = $actor instanceof User ? $actor->id : $actor;

        $creatorId = match (true) {
            $creator instanceof FinancialAction => $creator->createdByUserId(),
            $creator instanceof User => $creator->id,
            default => $creator,
        };

        if ($actorId === null || $creatorId === null) {
            // An unattributable action can never be proven self-approved;
            // approvals of actorless records are a data problem, not a
            // self-approval — other layers (audit) surface those.
            return;
        }

        if ((int) $actorId === (int) $creatorId) {
            throw new SelfApprovalException;
        }
    }
}

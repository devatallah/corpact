<?php

namespace App\Observers;

use App\Enums\Role;
use App\Models\RoleAssignment;
use App\Services\Audit\AuditLogService;
use App\Services\Audit\SecurityEventService;
use App\Support\Audit\AuditAction;

/**
 * H §19: «تغيير الصلاحيات» is the first mandatory audit event, and H §19
 * again lists «تغيير صلاحية» among the separate security events. Both are
 * written here so no grant path can forget — `assignRole()`, the admin
 * screen, the leadership service and the identity resolver all funnel
 * through this model.
 *
 * Baseline provisioning grants (`employee` on account creation, `provider`
 * on partner creation) are excluded: they are account creation, not a
 * permission change, and logging them would bury the real ones. Documented
 * in divergences.md.
 */
class RoleAssignmentObserver
{
    /**
     * Roles whose grant/revocation is a real permission change.
     *
     * @return string[]
     */
    private static function auditedRoles(): array
    {
        return [
            Role::PlatformAdmin->value,
            Role::FinanceAdmin->value,
            Role::SupportAgent->value,
            Role::AccountManager->value,
            Role::Coordinator->value,
            Role::CommunityLeader->value,
        ];
    }

    public function created(RoleAssignment $assignment): void
    {
        $this->record($assignment, AuditAction::PERMISSION_GRANTED, 'منح');
    }

    public function deleted(RoleAssignment $assignment): void
    {
        $this->record($assignment, AuditAction::PERMISSION_REVOKED, 'سحب');
    }

    private function record(RoleAssignment $assignment, string $action, string $verb): void
    {
        if (! in_array($assignment->role->value, self::auditedRoles(), true)) {
            return;
        }

        $payload = [
            'user_id' => $assignment->user_id,
            'role' => $assignment->role->value,
            'role_label' => $assignment->role->label(),
            'scope_type' => $assignment->scope_type,
            'scope_id' => $assignment->scope_id,
        ];

        AuditLogService::record(
            action: $action,
            entity: $assignment,
            before: $action === AuditAction::PERMISSION_REVOKED ? $payload : null,
            after: $action === AuditAction::PERMISSION_GRANTED ? $payload : null,
            reason: "{$verb} دور «{$assignment->role->label()}» على نطاق {$assignment->scope_type}",
            scopeType: $assignment->scope_type,
            scopeId: $assignment->scope_id !== null ? (int) $assignment->scope_id : null,
        );

        SecurityEventService::permissionChanged(
            $assignment,
            ['action' => $action] + $payload,
            $assignment->scope_type === RoleAssignment::SCOPE_COMPANY && $assignment->scope_id !== null
                ? (int) $assignment->scope_id
                : null,
        );
    }
}

<?php

namespace App\Services\Authorization;

use App\Models\Community;
use App\Models\RoleAssignment;
use App\Models\User;

/**
 * The single authorization primitive (H §4): every check is a
 * (permission + scope) pair — «هل يملك هذا المستخدم صلاحية event.cancel
 * على المجتمع رقم 12؟» — never a bare role.
 */
class AuthorizationService
{
    /** @var array<int, int|null> community_id => company_id, request-lifetime cache */
    private array $communityCompanies = [];

    /**
     * Does the user hold `$permission` on the given scope?
     */
    public function can(User $user, string $permission, string $scopeType = RoleAssignment::SCOPE_PLATFORM, ?int $scopeId = null): bool
    {
        foreach ($user->roleAssignments as $assignment) {
            if (! $assignment->role->hasPermission($permission)) {
                continue;
            }

            if ($this->scopeCovers($assignment, $scopeType, $scopeId)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Abort with 403 unless the user holds the permission on the scope.
     */
    public function authorize(User $user, string $permission, string $scopeType = RoleAssignment::SCOPE_PLATFORM, ?int $scopeId = null): void
    {
        if (! $this->can($user, $permission, $scopeType, $scopeId)) {
            abort(403, 'غير مصرح لك بتنفيذ هذا الإجراء.');
        }
    }

    /**
     * Does an assignment's scope cover the requested scope?
     *
     * - platform assignments cover everything;
     * - a company assignment covers that company and its communities;
     * - community/provider assignments cover exactly their own id.
     */
    private function scopeCovers(RoleAssignment $assignment, string $scopeType, ?int $scopeId): bool
    {
        if ($assignment->scope_type === RoleAssignment::SCOPE_PLATFORM) {
            return true;
        }

        if ($assignment->scope_type === $scopeType) {
            return (int) $assignment->scope_id === (int) $scopeId;
        }

        // Company-scope roles reach into the company's own communities.
        if ($assignment->scope_type === RoleAssignment::SCOPE_COMPANY
            && $scopeType === RoleAssignment::SCOPE_COMMUNITY
            && $scopeId !== null) {
            return $this->communityCompany($scopeId) === (int) $assignment->scope_id;
        }

        return false;
    }

    private function communityCompany(int $communityId): ?int
    {
        if (! array_key_exists($communityId, $this->communityCompanies)) {
            $this->communityCompanies[$communityId] = Community::withoutGlobalScopes()
                ->whereKey($communityId)
                ->value('company_id');
        }

        return $this->communityCompanies[$communityId];
    }
}

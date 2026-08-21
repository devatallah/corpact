<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Support\Audit\AuditAction;
use App\Support\Identity\CurrentActor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * A15 — the single writer of `audit_logs` (H §19).
 *
 * Every entry carries the full mandated field set: actor, actor role, scope,
 * action, entity, before/after values, IP, user agent, timestamp. Actor and
 * request metadata are resolved automatically so no call site can forget
 * them — the defect the gap analysis named on `activity_logs`.
 *
 * A13 (reports/exports) calls {@see self::export()}; it is the mechanism the
 * «كل تصدير أو تنزيل تقرير» catalog line requires.
 */
class AuditLogService
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public static function record(
        string $action,
        ?Model $entity = null,
        ?array $before = null,
        ?array $after = null,
        ?string $reason = null,
        ?int $companyId = null,
        string $scopeType = RoleAssignment::SCOPE_PLATFORM,
        ?int $scopeId = null,
        ?int $actorUserId = null,
        ?string $actorName = null,
    ): AuditLog {
        if ($actorUserId === null && $actorName === null) {
            ['id' => $actorUserId, 'name' => $actorName] = CurrentActor::resolve();
        }

        if ($actorUserId !== null && $actorName === null) {
            $actorName = User::query()->whereKey($actorUserId)->value('name');
        }

        $companyId ??= self::inferCompanyId($entity, $scopeType, $scopeId);

        return AuditLog::create([
            'actor_user_id' => $actorUserId,
            'actor_name' => $actorName,
            'actor_role' => self::resolveRole($actorUserId, $scopeType, $scopeId),
            'actor_guard' => self::currentGuard(),
            'scope_type' => $scopeType,
            'scope_id' => $scopeId,
            'company_id' => $companyId,
            'action' => $action,
            'entity_type' => $entity?->getMorphClass(),
            'entity_id' => $entity?->getKey(),
            'before_values' => $before,
            'after_values' => $after,
            'reason' => $reason,
            'ip_address' => self::requestValue(fn ($request) => $request->ip()),
            'user_agent' => self::requestValue(fn ($request) => $request->userAgent()),
            'is_financial' => AuditAction::isFinancial($action),
        ]);
    }

    /**
     * Convenience for a model whose dirty attributes are the diff — captures
     * «القيمة قبل وبعد» without every caller hand-rolling the arrays.
     *
     * @param  string[]  $attributes
     */
    public static function recordChange(
        string $action,
        Model $entity,
        array $attributes,
        ?string $reason = null,
        ?int $companyId = null,
    ): AuditLog {
        $before = [];
        $after = [];

        foreach ($attributes as $attribute) {
            $before[$attribute] = $entity->getOriginal($attribute);
            $after[$attribute] = $entity->getAttribute($attribute);
        }

        return self::record(
            action: $action,
            entity: $entity,
            before: $before,
            after: $after,
            reason: $reason,
            companyId: $companyId,
        );
    }

    /**
     * The export/download hook A13 calls. H §19 makes «كل تصدير أو تنزيل
     * تقرير» a mandatory catalog entry — the payload records what was pulled,
     * not just that something was.
     *
     * @param  array<string, mixed>  $context
     */
    public static function export(string $report, ?int $companyId = null, array $context = [], string $format = 'json'): AuditLog
    {
        return self::record(
            action: AuditAction::REPORT_EXPORTED,
            after: ['report' => $report, 'format' => $format] + $context,
            companyId: $companyId,
            scopeType: $companyId !== null ? RoleAssignment::SCOPE_COMPANY : RoleAssignment::SCOPE_PLATFORM,
            scopeId: $companyId,
        );
    }

    /**
     * A private file was handed to a browser through a 15-minute signed URL.
     *
     * @param  array<string, mixed>  $context
     */
    public static function download(string $descriptor, ?Model $entity = null, ?int $companyId = null, array $context = []): AuditLog
    {
        return self::record(
            action: AuditAction::FILE_DOWNLOADED,
            entity: $entity,
            after: ['file' => $descriptor] + $context,
            companyId: $companyId,
        );
    }

    /**
     * Mirror hook used by {@see ActivityLogService}: an activity
     * type that maps into the mandatory catalog also lands in `audit_logs`.
     *
     * @param  array<string, mixed>|null  $data
     */
    public static function mirrorActivity(
        string $activityType,
        Model $subject,
        string $description,
        ?array $data,
        ?int $companyId,
        ?int $actorUserId,
        ?string $actorName,
    ): ?AuditLog {
        $action = AuditAction::fromActivityType($activityType);

        if ($action === null) {
            return null;
        }

        $before = is_array($data) ? ($data['before'] ?? null) : null;
        $after = is_array($data) ? ($data['after'] ?? null) : null;

        if ($before === null && $after === null) {
            $after = $data;
        }

        return self::record(
            action: $action,
            entity: $subject,
            before: is_array($before) ? $before : null,
            after: is_array($after) ? $after : null,
            reason: is_array($data) ? ($data['reason'] ?? $description) : $description,
            companyId: $companyId,
            actorUserId: $actorUserId,
            actorName: $actorName,
        );
    }

    private static function inferCompanyId(?Model $entity, string $scopeType, ?int $scopeId): ?int
    {
        if ($scopeType === RoleAssignment::SCOPE_COMPANY && $scopeId !== null) {
            return $scopeId;
        }

        $companyId = $entity?->getAttribute('company_id');

        return is_numeric($companyId) ? (int) $companyId : null;
    }

    private static function resolveRole(?int $actorUserId, string $scopeType, ?int $scopeId): ?string
    {
        if ($actorUserId === null) {
            return null;
        }

        $user = User::query()->with('roleAssignments')->find($actorUserId);

        if ($user === null) {
            return null;
        }

        $assignments = $user->roleAssignments;

        $match = $assignments->first(
            fn (RoleAssignment $assignment) => $assignment->scope_type === $scopeType
                && (int) $assignment->scope_id === (int) $scopeId
        ) ?? $assignments->first(
            fn (RoleAssignment $assignment) => $assignment->scope_type === RoleAssignment::SCOPE_PLATFORM
        ) ?? $assignments->first();

        return $match?->role->value;
    }

    private static function currentGuard(): ?string
    {
        if (! app()->bound('request')) {
            return null;
        }

        foreach (['admin', 'company', 'partner', 'employee'] as $guard) {
            if (auth($guard)->check()) {
                return $guard;
            }
        }

        return null;
    }

    /**
     * @param  callable(Request): (string|null)  $resolver
     */
    private static function requestValue(callable $resolver): ?string
    {
        if (! app()->bound('request')) {
            return null;
        }

        $value = $resolver(request());

        return $value === null ? null : mb_substr($value, 0, 1000);
    }
}

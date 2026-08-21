<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use App\Support\Identity\CurrentActor;
use Illuminate\Database\Eloquent\Model;

/**
 * The company-facing activity feed. It is **not** the audit log: A15 added
 * `audit_logs` (H §19 — append-only, actor + role + scope + before/after +
 * IP + user agent) alongside it.
 *
 * The two are bridged here rather than at 60+ call sites: any activity type
 * that maps into {@see AuditAction::fromActivityTypeMap()}
 * also produces an audit row, so the mandatory catalog is covered wherever
 * an activity entry already existed.
 */
class ActivityLogService
{
    /**
     * Log an activity for a subject model. The acting global user is
     * recorded automatically from the current session unless passed
     * explicitly (audit answers «who did it» — gap-analysis A15 note).
     */
    public static function log(
        ?int $companyId,
        Model $subject,
        string $type,
        string $description,
        ?array $data = null,
        ?int $actorUserId = null,
        ?string $actorName = null,
    ): ActivityLog {
        if ($actorUserId === null && $actorName === null) {
            ['id' => $actorUserId, 'name' => $actorName] = CurrentActor::resolve();
        }

        $log = ActivityLog::create([
            'company_id' => $companyId,
            'actor_user_id' => $actorUserId,
            'actor_name' => $actorName,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'type' => $type,
            'description' => $description,
            'data' => $data,
        ]);

        AuditLogService::mirrorActivity(
            $type,
            $subject,
            $description,
            $data,
            $companyId,
            $actorUserId,
            $actorName,
        );

        return $log;
    }
}

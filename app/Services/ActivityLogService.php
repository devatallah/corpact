<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log an activity for a subject model.
     */
    public static function log(
        ?int $companyId,
        Model $subject,
        string $type,
        string $description,
        ?array $data = null,
    ): ActivityLog {
        return ActivityLog::create([
            'company_id' => $companyId,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'type' => $type,
            'description' => $description,
            'data' => $data,
        ]);
    }
}

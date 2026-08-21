<?php

namespace App\Console\Commands\Concerns;

use App\Models\JobRun;

/**
 * كل مهمة مجدولة تسجل نبضة عند كل تشغيل — يقرأها app:watchdog-scheduled-jobs
 * ليتحقق أن المهام الحرجة تعمل فعلاً: الصمت ليس دليل نجاح (H §20).
 */
trait RecordsHeartbeat
{
    protected function recordHeartbeat(): void
    {
        JobRun::heartbeat($this->getName());
    }
}

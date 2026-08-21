<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\JobRun;
use App\Services\Attendance\AttendanceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * إقفال نافذة تعديل الحضور بعد 24 ساعة من الاكتمال (H §13, §20 — كل ساعة).
 *
 * بعد الإقفال لا يعدّل القائمة إلا **أدمن تيمات بسبب موثَّق** — استثناء لا
 * إجراء روتيني. المفتاح idempotent عبر `JobRun::runOnce` بمفتاح
 * (الفعالية + المهمة + تاريخ الاكتمال)، فتشغيل المهمة مرتين لا يُنتج أثراً
 * مزدوجاً ولا سطر تدقيق مكرراً.
 */
class CloseAttendanceWindow extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:close-attendance-window';

    protected $description = 'إقفال نافذة تعديل الحضور بعد 24 ساعة من الاكتمال (H §13, §20 — كل ساعة)';

    public function __construct(private AttendanceService $attendance)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->recordHeartbeat();

        $locked = 0;
        $failed = 0;

        foreach ($this->attendance->lockableEvents() as $event) {
            try {
                $ran = JobRun::runOnce(
                    job: $this->getName(),
                    entityType: 'event',
                    entityId: (int) $event->id,
                    period: $event->completed_at->format('Y-m-d'),
                    callback: function () use ($event): void {
                        $this->attendance->lockWindow($event);
                    },
                );

                if ($ran) {
                    $locked++;
                }
            } catch (Throwable $e) {
                // فشل فعالية واحدة لا يوقف البقية — job_runs يعيد المحاولة.
                $failed++;
                Log::error("فشل إقفال نافذة حضور الفعالية #{$event->id}.", [
                    'exception' => $e->getMessage(),
                ]);
            }
        }

        $this->info("أُقفلت نوافذ الحضور: {$locked} — فشلت: {$failed}.");

        return self::SUCCESS;
    }
}

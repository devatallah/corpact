<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Jobs\CompleteEvent;
use App\Models\Event;
use App\Services\Events\EventStateMachine;
use App\Services\Events\IllegalEventTransition;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * دورة حياة الفعالية الزمنية (A1 ← حُدّثت لآلة A7 — H §9):
 * - confirmed ← in_progress عند وقت البدء، ثم completed عند الانتهاء
 *   (عبر CompleteEvent بمفتاح idempotency).
 * - open التي مرّ وقت بدئها دون بلوغ الحد الأدنى ← expired.
 * كل الانتقالات عبر EventStateMachine مع سجل event_status_history.
 */
class TransitionEventLifecycle extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:transition-event-lifecycle';

    protected $description = 'نقل الفعاليات المؤكدة إلى in_progress ثم completed، وإنهاء المفتوحة التي مرّ موعدها (H §9 + §13)';

    public function __construct(private EventStateMachine $machine)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $now = now();
        $started = 0;
        $completed = 0;
        $expired = 0;
        $failed = 0;

        // المرشحون: فعاليات مؤكدة أو جارية بدأ وقتها.
        $candidates = Event::whereIn('status', ['confirmed', 'in_progress'])
            ->where('starts_at', '<=', $now)
            ->get();

        foreach ($candidates as $event) {
            try {
                if ($now->gte($event->endsAt())) {
                    // انتهى الوقت — completed مع الحضور التلقائي. يُنفَّذ عبر Job
                    // يحمل مفتاح idempotency وإعدادات إعادة المحاولة (H §20).
                    CompleteEvent::dispatchSync($event->id);
                    $completed++;
                } elseif ($event->status === 'confirmed') {
                    $this->machine->start($event);
                    $started++;
                }
            } catch (Throwable $e) {
                // فشل فعالية واحدة لا يوقف البقية — سيُعاد عبر job_runs بتباعد أسي.
                $failed++;
                Log::error("فشل انتقال دورة حياة الفعالية #{$event->id}.", [
                    'exception' => $e->getMessage(),
                ]);
            }
        }

        // H §9: open مرّ وقت بدئها دون بلوغ الحد الأدنى — expired (لا شيء مالياً).
        $stale = Event::where('status', 'open')
            ->where('starts_at', '<=', $now)
            ->get();

        foreach ($stale as $event) {
            try {
                $this->machine->expire($event);
                $expired++;
            } catch (IllegalEventTransition) {
                // سباق مع انتقال آخر — الحالة تغيرت تحت أقدامنا؛ لا شيء يُفعل.
            } catch (Throwable $e) {
                $failed++;
                Log::error("فشل إنهاء الفعالية المفتوحة #{$event->id}.", [
                    'exception' => $e->getMessage(),
                ]);
            }
        }

        $this->recordHeartbeat();

        $this->info("بدأت: {$started} · عولجت للاكتمال: {$completed} · انتهت: {$expired} · فشلت: {$failed}");

        return self::SUCCESS;
    }
}

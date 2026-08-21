<?php

namespace App\Jobs;

use App\Events\EventCompleted;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\JobRun;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * نقل فعالية منتهية الوقت إلى completed مع الحضور التلقائي (H §9 + §13).
 *
 * الانتقال تلقائي بالكامل فور انتهاء الوقت بلا أي تدخل بشري، وكل مشارك مؤكد
 * يُسجَّل حاضراً — لا توجد عملية توثيق حضور في المنتج إطلاقاً.
 */
class CompleteEvent implements ShouldQueue
{
    use Queueable;

    /**
     * H §20: إعادة المحاولة 3 مرات بتباعد أسي.
     */
    public int $tries = 3;

    public function __construct(public int $eventId) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(): void
    {
        $event = Event::find($this->eventId);

        if ($event === null) {
            return;
        }

        // مفتاح idempotency: (الكيان + المهمة + الفترة) — H §20.
        JobRun::runOnce(
            job: 'event-lifecycle:complete',
            entityType: 'event',
            entityId: $event->id,
            period: $event->event_date->format('Y-m-d'),
            callback: function (): void {
                DB::transaction(function (): void {
                    $event = Event::whereKey($this->eventId)->lockForUpdate()->first();

                    if ($event === null || ! in_array($event->status, ['confirmed', 'in_progress'], true)) {
                        return;
                    }

                    // آلة A7: confirmed تمر عبر in_progress ثم completed —
                    // انتقالان مسجلان في event_status_history (H §9).
                    app(EventStateMachine::class)->complete($event);

                    // الحضور تلقائي بالكامل: كل مشارك محجوز المقعد يُسجَّل attended.
                    // whereNull يحمي تعديلات القائد داخل نافذة الـ24 ساعة من الكتابة فوقها.
                    $marked = EventParticipant::where('event_id', $event->id)
                        ->where('seat_status', 'reserved')
                        ->whereNull('attendance_status')
                        ->pluck('employee_id');

                    EventParticipant::where('event_id', $event->id)
                        ->where('seat_status', 'reserved')
                        ->whereNull('attendance_status')
                        ->update(['attendance_status' => 'attended']);

                    $participation = app(ParticipationService::class);
                    foreach ($marked as $employeeId) {
                        $participation->logChange($event, (int) $employeeId, 'attendance_status', null, 'attended', null, 'حضور تلقائي عند اكتمال الفعالية (H §13)');
                    }
                });

                // A9: مستمع الموثوقية (+3 اكتمال بلا مشاكل — H §11) وأي
                // مستمعين لاحقين (A12/A13).
                event(new EventCompleted($this->eventId));
            },
        );
    }

    public function failed(?Throwable $exception): void
    {
        Log::error("فشل نقل الفعالية #{$this->eventId} إلى completed.", [
            'exception' => $exception?->getMessage(),
        ]);
    }
}

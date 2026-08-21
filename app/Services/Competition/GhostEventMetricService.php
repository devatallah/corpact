<?php

namespace App\Services\Competition;

use DateTimeInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * مؤشر الإنذار المبكر لـ«الفعالية الشبح» (H §13).
 *
 * المقايضة المعلنة في المواصفة: الحضور التلقائي يعني أن **فعالية لم تُقم
 * فعلاً ولم يبلّغ عنها أحد ستُحتسب مكتملة**، فتُصرف للمزوّد وتدخل الفوترة.
 * الضمانات ثلاث (نافذة 24 ساعة، إلغاء المزوّد، تدخل الأدمن)، ونص المواصفة
 * صريح: **«يجب مراقبة معدل التعديلات بعد الاكتمال كمؤشر إنذار مبكر»**.
 *
 * هذه الخدمة تُخرج المؤشرين قابلين للاستعلام:
 * 1. **معدل التعديل بعد الاكتمال** — نسبة الفعاليات المكتملة التي عُدِّل
 *    حضورها بعد `completed_at`.
 * 2. **معدل التغيير اليدوي للحالة** — نسبة الفعاليات التي أُجبرت حالتها
 *    يدوياً (`event_status_history.is_manual`).
 *
 * A13 يرسم التقارير فوق هذه الأرقام؛ هنا الاستعلام وحده.
 */
class GhostEventMetricService
{
    /**
     * @return array<string, mixed>
     */
    public function stats(?int $companyId = null, ?DateTimeInterface $from = null, ?DateTimeInterface $to = null): array
    {
        $from = Carbon::parse($from ?? Carbon::now()->subDays(30)->startOfDay());
        $to = Carbon::parse($to ?? Carbon::now());

        $completedEvents = DB::table('events')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$from, $to])
            ->when($companyId !== null, fn ($q) => $q->where('company_id', $companyId));

        $completedCount = (clone $completedEvents)->count();

        // فعاليات عُدِّل حضورها بعد لحظة اكتمالها (الحضور التلقائي يكتب سطره
        // عند الاكتمال نفسه، فالتعديل اللاحق وحده هو ما يُحسب).
        $editedIds = DB::table('participant_events')
            ->join('events', 'events.id', '=', 'participant_events.event_id')
            ->where('participant_events.field', 'attendance_status')
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$from, $to])
            ->whereColumn('participant_events.created_at', '>', 'events.completed_at')
            ->when($companyId !== null, fn ($q) => $q->where('events.company_id', $companyId))
            ->distinct()
            ->pluck('events.id');

        $editedCount = $editedIds->count();

        $absenceCount = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.attendance_status', 'absent')
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$from, $to])
            ->when($companyId !== null, fn ($q) => $q->where('events.company_id', $companyId))
            ->count();

        // التغيير اليدوي للحالة (تدخل أدمن تيمات المسبَّب — A7).
        $eventsInWindow = DB::table('events')
            ->whereBetween('created_at', [$from, $to])
            ->when($companyId !== null, fn ($q) => $q->where('company_id', $companyId));

        $eventsCount = (clone $eventsInWindow)->count();

        $manualIds = DB::table('event_status_history')
            ->join('events', 'events.id', '=', 'event_status_history.event_id')
            ->where('event_status_history.is_manual', true)
            ->whereBetween('event_status_history.created_at', [$from, $to])
            ->when($companyId !== null, fn ($q) => $q->where('events.company_id', $companyId))
            ->distinct()
            ->pluck('events.id');

        $manualCount = $manualIds->count();

        // الفعاليات المكتملة التي مرت نافذتها بلا مراجعة واحدة — الخانة التي
        // تسكنها الفعالية الشبح إن وُجدت.
        $unreviewedCount = (clone $completedEvents)
            ->whereNotNull('attendance_locked_at')
            ->whereNotIn('id', $editedIds->all())
            ->count();

        return [
            'period' => [
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
            ],
            'company_id' => $companyId,
            'completed_events' => $completedCount,
            'post_completion_edited_events' => $editedCount,
            'post_completion_edit_rate' => $this->rate($editedCount, $completedCount),
            'absence_marks' => $absenceCount,
            'events_created' => $eventsCount,
            'manual_state_change_events' => $manualCount,
            'manual_state_change_rate' => $this->rate($manualCount, $eventsCount),
            'locked_without_review' => $unreviewedCount,
            'locked_without_review_rate' => $this->rate($unreviewedCount, $completedCount),
        ];
    }

    private function rate(int $numerator, int $denominator): float
    {
        return $denominator === 0 ? 0.0 : round(($numerator / $denominator) * 100, 1);
    }
}

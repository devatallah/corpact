<?php

namespace App\Services\Attendance;

use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * دلالات «الموظف المفعّل» القابلة للاستعلام (H §13 ⟶ H §12.8).
 *
 * التعريف الملزم: **حضر فعالية مكتملة واحدة على الأقل داخل الدورة، ولم
 * يكن غائباً، ويُحتسب مرة واحدة**. الغياب أثره غير مالي فقط: خارج لوحة
 * المواظبة، **وغير محتسب موظفاً مفعّلاً في فوترة الشهر**، ويظهر في سجله.
 *
 * A11 (التسويات والفوترة) يقرأ من هنا: هذه الخدمة تملك الدلالة، وA11 يملك
 * المال. لا حركة مال واحدة تنشأ في هذا الملف.
 *
 * ملاحظة مقصودة: **لا فلترة على حالة الموظف ولا على عضويته**. «الموظف الذي
 * غادر خلال الدورة وكان مفعّلاً يُحتسب» (H §12.8)، وصفوف المشاركة لا تُحذف
 * أبداً (قيد A7) فيبقى التفعيل صحيحاً بعد المغادرة.
 */
class ActivationService
{
    /**
     * معرّفات الموظفين المفعّلين في شركة خلال فترة (شاملة الطرفين).
     *
     * @return Collection<int, int>
     */
    public function activatedEmployeeIds(int $companyId, DateTimeInterface $from, DateTimeInterface $to): Collection
    {
        return $this->baseQuery($companyId, $from, $to)
            ->distinct()
            ->pluck('event_participants.employee_id')
            ->map(fn ($id) => (int) $id)
            ->values();
    }

    /**
     * عدد الموظفين المفعّلين — كل موظف مرة واحدة مهما تعددت فعالياته.
     */
    public function activatedCount(int $companyId, DateTimeInterface $from, DateTimeInterface $to): int
    {
        return $this->activatedEmployeeIds($companyId, $from, $to)->count();
    }

    /**
     * هل فُعِّل هذا الموظف في الفترة؟
     */
    public function isActivated(Employee $employee, DateTimeInterface $from, DateTimeInterface $to): bool
    {
        return $this->baseQuery((int) $employee->company_id, $from, $to)
            ->where('event_participants.employee_id', $employee->id)
            ->exists();
    }

    /**
     * الموظفون الذين شاركوا لكن **لم** يُفعَّلوا لأنهم سُجِّلوا غائبين ولم
     * يحضروا شيئاً آخر في الفترة — المقابل المباشر لأثر الغياب.
     *
     * @return Collection<int, int>
     */
    public function absentOnlyEmployeeIds(int $companyId, DateTimeInterface $from, DateTimeInterface $to): Collection
    {
        $activated = $this->activatedEmployeeIds($companyId, $from, $to);

        return EventParticipant::query()
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $companyId)
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$from, $to])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', AttendanceService::ABSENT)
            ->whereNotIn('event_participants.employee_id', $activated->all())
            ->distinct()
            ->pluck('event_participants.employee_id')
            ->map(fn ($id) => (int) $id)
            ->values();
    }

    /**
     * سجل غيابات الموظف — «يظهر في سجله» (H §13).
     *
     * @return array<int, array<string, mixed>>
     */
    public function absenceRecord(Employee $employee, ?int $limit = null): array
    {
        $query = EventParticipant::query()
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.attendance_status', AttendanceService::ABSENT)
            ->orderByDesc('events.completed_at')
            ->select([
                'events.id as event_id',
                'events.title as event_title',
                'events.completed_at',
                'event_participants.attendance_reason',
                'event_participants.attendance_marked_at',
            ]);

        if ($limit !== null) {
            $query->limit($limit);
        }

        return $query->get()->map(fn ($row) => [
            'event_id' => (int) $row->event_id,
            'event_title' => $row->event_title,
            'completed_at' => $row->completed_at,
            'reason' => $row->attendance_reason,
            'marked_at' => $row->attendance_marked_at,
        ])->all();
    }

    /**
     * الفعاليات المكتملة التي حضرها الموظف فعلاً في الفترة (عدّاد المواظبة).
     */
    public function attendedCount(Employee $employee, DateTimeInterface $from, DateTimeInterface $to): int
    {
        return $this->baseQuery((int) $employee->company_id, $from, $to)
            ->where('event_participants.employee_id', $employee->id)
            ->count();
    }

    /**
     * الأساس المشترك: مقعد محجوز + حضور مؤكد + فعالية اكتملت داخل الفترة.
     *
     * `completed_at` هو المرساة الزمنية لا حالة الفعالية — الفعالية المسوّاة
     * (`settled` بعد A11) تبقى محتسَبة، والملغاة لا `completed_at` لها أصلاً.
     *
     * @return Builder<EventParticipant>
     */
    private function baseQuery(int $companyId, DateTimeInterface $from, DateTimeInterface $to)
    {
        return EventParticipant::query()
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $companyId)
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$from, $to])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', AttendanceService::ATTENDED);
    }

    /**
     * @return Builder<Event>
     */
    public function completedEventsQuery(int $companyId, DateTimeInterface $from, DateTimeInterface $to)
    {
        return Event::withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$from, $to]);
    }
}

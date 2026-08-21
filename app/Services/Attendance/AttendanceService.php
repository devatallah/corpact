<?php

namespace App\Services\Attendance;

use App\Enums\Role;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Authorization\AuthorizationService;
use App\Services\Events\ParticipationService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * الحضور — تلقائي بالكامل مع ضماناته (H §13).
 *
 * لا توجد عملية توثيق حضور: عند `completed` يُسجَّل كل مشارك محجوز المقعد
 * `attended` تلقائياً (يفعلها Job الاكتمال — A1/A7). ما تملكه هذه الخدمة هو
 * **الضمانة** المقابلة لتلك التلقائية:
 *
 * 1. نافذة 24 ساعة من `completed_at` يعدّل فيها **قائد المجتمع أو المنسّق
 *    وحدهما** القائمة (حاضر ⇄ غائب)، بشرط إعداد الشركة `allow_absence_marking`.
 * 2. بعد النافذة تُقفل القائمة (`events.attendance_locked_at` تختمه المهمة
 *    الساعية) ولا يعدّلها إلا **أدمن تيمات بسبب موثَّق** — استثناء لا إجراء
 *    روتيني، ويُسجَّل في سجل التدقيق بهذا الوصف.
 * 3. كل تغيير سطر في `participant_events` بالفاعل والسبب (قيد A7).
 *
 * **لا أثر مالي للغياب إطلاقاً** — لا استرداد ولا مساس بمستحق المزوّد ولا
 * بالعمولة. أثره غير المالي فقط: خارج لوحة المواظبة، وغير محتسب موظفاً
 * مفعّلاً في فوترة الشهر (انظر {@see ActivationService})، ويظهر في سجله.
 */
class AttendanceService
{
    public const ATTENDED = 'attended';

    public const ABSENT = 'absent';

    /** «استثناء لا إجراء روتيني» — وصف تدخل الأدمن بعد إقفال النافذة. */
    public const ADMIN_EXCEPTION_NOTE = 'استثناء لا إجراء روتيني';

    public function __construct(
        private ParticipationService $participation,
        private AuthorizationService $authorization,
    ) {}

    public function windowHours(): int
    {
        return (int) config('results.attendance.edit_window_hours', 24);
    }

    /**
     * لحظة إقفال نافذة التعديل — 24 ساعة من الاكتمال.
     */
    public function windowClosesAt(Event $event): ?Carbon
    {
        return $event->completed_at?->copy()->addHours($this->windowHours());
    }

    /**
     * هل النافذة مفتوحة الآن؟ (اكتملت الفعالية، ولم تُقفل، ولم تمض 24 ساعة)
     */
    public function isWindowOpen(Event $event): bool
    {
        if ($event->completed_at === null || $event->attendance_locked_at !== null) {
            return false;
        }

        return now()->lt($this->windowClosesAt($event));
    }

    /**
     * هل يملك إعداد الشركة السماح بتعديل القائد؟ (A4 —
     * `company_settings.allow_absence_marking`)
     */
    public function absenceMarkingAllowed(Event $event): bool
    {
        $company = $event->company;

        // غياب صف الإعدادات = الافتراض المنصوص عليه في A4 (مسموح).
        return $company === null || (bool) $company->getSettings()->allow_absence_marking;
    }

    public function isPlatformAdmin(?User $user): bool
    {
        return $user !== null && $this->authorization->can(
            $user,
            'attendance.edit',
            RoleAssignment::SCOPE_PLATFORM,
        ) && $user->roleAssignments->contains(
            fn (RoleAssignment $a) => $a->role === Role::PlatformAdmin
                && $a->scope_type === RoleAssignment::SCOPE_PLATFORM,
        );
    }

    /**
     * قدرة المستخدم على تعديل قائمة حضور هذه الفعالية، ووضع التعديل.
     *
     * @return array{allowed: bool, mode: string|null, reason_required: bool, message: string|null}
     */
    public function editability(Event $event, ?User $user): array
    {
        $denied = fn (string $message) => [
            'allowed' => false,
            'mode' => null,
            'reason_required' => false,
            'message' => $message,
        ];

        if ($user === null) {
            return $denied('غير مصرح لك بتعديل قائمة الحضور.');
        }

        if ($event->completed_at === null) {
            return $denied('لم تكتمل الفعالية بعد — لا قائمة حضور تُعدَّل.');
        }

        $isAdmin = $this->isPlatformAdmin($user);

        if ($this->isWindowOpen($event)) {
            $isLeaderOrCoordinator = $this->authorization->can(
                $user,
                'attendance.edit',
                RoleAssignment::SCOPE_COMMUNITY,
                $event->community_id,
            );

            if ($isLeaderOrCoordinator && ! $isAdmin && ! $this->absenceMarkingAllowed($event)) {
                return $denied('أوقفت شركتك تعديل الحضور من القائد (إعداد allow_absence_marking).');
            }

            if ($isLeaderOrCoordinator) {
                return [
                    'allowed' => true,
                    'mode' => $isAdmin ? 'admin_exception' : 'window',
                    // السبب إلزامي دائماً على الأدمن، واختياري داخل النافذة.
                    'reason_required' => $isAdmin,
                    'message' => null,
                ];
            }

            return $denied('تعديل الحضور لقائد المجتمع أو المنسّق فقط (H §13).');
        }

        // النافذة مقفلة — أدمن تيمات وحده، بسبب موثَّق إلزامي.
        if ($isAdmin) {
            return [
                'allowed' => true,
                'mode' => 'admin_exception',
                'reason_required' => true,
                'message' => 'أُقفلت نافذة الـ24 ساعة — التعديل الآن '.self::ADMIN_EXCEPTION_NOTE.'، ويتطلب سبباً موثَّقاً.',
            ];
        }

        return $denied('أُقفلت نافذة تعديل الحضور (24 ساعة) — لا يعدّلها إلا أدمن تيمات بسبب موثَّق.');
    }

    /**
     * تعديل حضور مشارك: حاضر ⇄ غائب.
     *
     * @param  User|null  $user  المستخدم العالمي صاحب الصلاحية
     * @param  Employee|User|null  $actor  الفاعل كما يُسجَّل في participant_events
     */
    public function mark(
        Event $event,
        Employee $target,
        string $status,
        ?User $user,
        Employee|User|null $actor = null,
        ?string $reason = null,
    ): EventParticipant {
        if (! in_array($status, [self::ATTENDED, self::ABSENT], true)) {
            throw new RuntimeException('حالة حضور غير معروفة.');
        }

        $decision = $this->editability($event, $user);

        if (! $decision['allowed']) {
            throw new RuntimeException((string) $decision['message']);
        }

        $reason = $reason !== null && trim($reason) !== '' ? trim($reason) : null;

        if ($decision['reason_required'] && $reason === null) {
            throw new RuntimeException('السبب الموثَّق إلزامي في هذا التعديل ('.self::ADMIN_EXCEPTION_NOTE.').');
        }

        return DB::transaction(function () use ($event, $target, $status, $user, $actor, $reason, $decision) {
            $row = EventParticipant::where('event_id', $event->id)
                ->where('employee_id', $target->id)
                ->lockForUpdate()
                ->first();

            if ($row === null || $row->seat_status !== 'reserved') {
                throw new RuntimeException('هذا الموظف ليس من مشاركي الفعالية المؤكدين.');
            }

            $from = $row->attendance_status;

            if ($from === $status) {
                return $row;
            }

            $row->forceFill([
                'attendance_status' => $status,
                'attendance_reason' => $reason,
                'attendance_marked_at' => now(),
                'attendance_marked_by_user_id' => $user?->id,
            ])->save();

            $logReason = $reason ?? ($decision['mode'] === 'window'
                ? 'تعديل قائمة الحضور داخل نافذة الـ24 ساعة'
                : 'تعديل قائمة الحضور');

            if ($decision['mode'] === 'admin_exception') {
                $logReason = self::ADMIN_EXCEPTION_NOTE.' — '.$logReason;
            }

            // قيد A7: كل تعديل حضور سطر في participant_events بالفاعل والسبب.
            $this->participation->logChange(
                $event,
                (int) $target->id,
                'attendance_status',
                $from,
                $status,
                $actor,
                $logReason,
            );

            ActivityLogService::log(
                $event->company_id,
                $event,
                $decision['mode'] === 'admin_exception' ? 'attendance_admin_exception' : 'attendance_edited',
                "تعديل حضور «{$target->name}» في الفعالية #{$event->id}: ".
                    ($from ?? 'غير محسوم')." ← {$status}".
                    ($decision['mode'] === 'admin_exception' ? ' ('.self::ADMIN_EXCEPTION_NOTE.')' : ''),
                [
                    'event_id' => $event->id,
                    'employee_id' => $target->id,
                    'from' => $from,
                    'to' => $status,
                    'mode' => $decision['mode'],
                    'reason' => $reason,
                    'window_closed_at' => $this->windowClosesAt($event)?->toIso8601String(),
                ],
                actorUserId: $user?->id,
                actorName: $user?->name,
            );

            return $row->fresh();
        });
    }

    /**
     * إقفال نافذة التعديل لفعالية واحدة — تستدعيه المهمة الساعية.
     */
    public function lockWindow(Event $event): bool
    {
        if ($event->completed_at === null || $event->attendance_locked_at !== null) {
            return false;
        }

        if (now()->lt($this->windowClosesAt($event))) {
            return false;
        }

        $event->forceFill(['attendance_locked_at' => now()])->save();

        ActivityLogService::log(
            $event->company_id,
            $event,
            'attendance_window_closed',
            "أُقفلت نافذة تعديل حضور الفعالية #{$event->id} بعد {$this->windowHours()} ساعة من الاكتمال.",
            ['event_id' => $event->id, 'completed_at' => $event->completed_at->toIso8601String()],
            actorUserId: null,
            actorName: 'النظام',
        );

        return true;
    }

    /**
     * الفعاليات المرشَّحة للإقفال الآن (اكتملت ومضت نافذتها ولم تُقفل بعد).
     *
     * @return Collection<int, Event>
     */
    public function lockableEvents()
    {
        return Event::withoutGlobalScopes()
            ->whereNotNull('completed_at')
            ->whereNull('attendance_locked_at')
            ->where('completed_at', '<=', now()->subHours($this->windowHours()))
            ->orderBy('id')
            ->get();
    }

    /**
     * قائمة الحضور كما تُعرض للقائد: كل مشارك محجوز المقعد بحالته وسببها.
     *
     * @return array<int, array<string, mixed>>
     */
    public function roster(Event $event): array
    {
        $rows = EventParticipant::query()
            ->where('event_id', $event->id)
            ->where('seat_status', 'reserved')
            ->with('employee:id,name,avatar,department_id')
            ->get();

        return $rows->map(fn (EventParticipant $row) => [
            'employee_id' => (int) $row->employee_id,
            'name' => $row->employee?->name,
            'avatar' => $row->employee?->avatar,
            'attendance_status' => $row->attendance_status,
            'attendance_reason' => $row->attendance_reason,
            'attendance_marked_at' => $row->attendance_marked_at?->toIso8601String(),
        ])->values()->all();
    }
}

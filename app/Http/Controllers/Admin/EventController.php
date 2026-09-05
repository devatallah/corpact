<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexEventRequest;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Services\ActivityLogService;
use App\Services\Admin\AdminEventService;
use App\Services\Audit\AuditLogService;
use App\Services\Authorization\AuthorizationService;
use App\Services\Employee\EventCreationService;
use App\Services\Events\EventStateMachine;
use App\Services\Payments\EventRefundService;
use App\Support\Audit\AuditAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private AdminEventService $eventService,
        private EventCreationService $eventCreationService,
        private EventRefundService $refundService,
        private EventStateMachine $stateMachine,
    ) {}

    /**
     * List all events with optional filters.
     */
    public function index(IndexEventRequest $request): Response
    {
        $filters = $request->validated();

        $events = $this->eventService->list($filters);
        $totalEvents = Event::count();

        return Inertia::render('admin/events/index', [
            'events' => $events,
            'totalEvents' => $totalEvents,
            'filters' => (object) $filters,
            'sort' => AdminEventService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    /**
     * Show event details with member management.
     */
    public function show(Event $event): Response
    {
        $event->load(['community', 'partner', 'category', 'creator', 'participants', 'company', 'parentEvent']);

        // Load series info for recurring events
        $seriesEvents = [];
        if ($event->isRecurringSeries()) {
            $seriesEvents = $event->occurrences()
                ->select('id', 'event_date', 'start_time', 'status', 'participants_count', 'capacity')
                ->orderBy('event_date')
                ->get();
        } elseif ($event->isOccurrence()) {
            $seriesEvents = Event::where('parent_event_id', $event->parent_event_id)
                ->select('id', 'event_date', 'start_time', 'status', 'participants_count', 'capacity')
                ->orderBy('event_date')
                ->get();
        }

        return Inertia::render('admin/events/show', [
            'event' => $event,
            'seriesEvents' => $seriesEvents,
            // H §9 القاعدة 2: سجل الانتقالات مقروء قبل أي تغيير يدوي.
            'statusHistory' => $event->statusHistory()->get(),
            'allStatuses' => EventStatus::values(),
            // زر الإلغاء لا يظهر لمن سيرفضه الحارس — الرفض بعد الضغط يعلّم
            // الأدمن أن الشاشة تعرض ما لا تملكه.
            'canCancel' => Gate::allows('cancel', $event)
                && in_array($event->status, [EventStatus::Booked->value, EventStatus::Confirmed->value], true),
            // A15 — G (أدمن تيمات §3): «تستطيع تعديل قائمة الحضور بعد انقضاء
            // نافذة الـ24 ساعة — وهو استثناء لا إجراء روتيني». الـ endpoint
            // كان جاهزاً منذ A12 بلا واجهة.
            'attendanceWindowClosed' => $event->attendance_window_closes_at !== null
                && $event->attendance_window_closes_at->isPast(),
            'attendanceWindowClosesAt' => $event->attendance_window_closes_at?->toIso8601String(),
            'attendance' => EventParticipant::query()
                ->where('event_id', $event->id)
                ->with('employee:id,name')
                ->orderBy('id')
                ->get()
                ->map(fn (EventParticipant $participant) => [
                    'employee_id' => $participant->employee_id,
                    'employee_name' => $participant->employee?->name ?? '—',
                    'attendance_status' => $participant->attendance_status,
                    'attendance_reason' => $participant->attendance_reason,
                    'attendance_marked_at' => $participant->attendance_marked_at?->toIso8601String(),
                ])
                ->all(),
        ]);
    }

    /**
     * الحذف النهائي ممنوع — الفعالية سجل مالي/تاريخي لا يُمحى (H §21).
     * الإلغاء عبر آلة الحالات، والتصحيح اليدوي عبر forceStatus بسبب مكتوب.
     */
    public function destroy(Event $event): RedirectResponse
    {
        return back()->with('error', 'حذف الفعاليات نهائياً ممنوع — استخدم الإلغاء أو التغيير اليدوي المسبَّب للحالة.');
    }

    /**
     * إلغاء من أدمن تيمات (cancelled_company) — H §9: من booked/confirmed فقط.
     */
    public function cancel(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('cancel', $event);

        // G/أدمن تيمات: «كل تدخل يدوي منك يتطلب سبباً مكتوباً ويُسجَّل في سجل
        // التدقيق» — والإلغاء الإداري إجراء مالي (استرداد كامل).
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'cancel_series' => ['sometimes', 'boolean'],
        ], [
            'reason.required' => 'الإلغاء الإداري يتطلب سبباً مكتوباً (G/أدمن تيمات).',
            'reason.min' => 'اكتب سبباً حقيقياً للإلغاء.',
        ]);

        if (! $this->stateMachine->canTransition((string) $event->status, 'cancelled_company')) {
            return back()->with('error', 'لا يمكن إلغاء الفعالية في حالتها الحالية — الإلغاء مشروع من محجوزة أو مؤكدة فقط؛ للتصحيح خارج الجدول استخدم التغيير اليدوي المسبَّب.');
        }

        $from = (string) $event->status;

        $this->stateMachine->cancelCompany($event, auth('admin')->user(), $data['reason']);

        AuditLogService::record(
            action: AuditAction::EVENT_CANCELLED_BY_ADMIN,
            entity: $event,
            before: ['status' => $from],
            after: ['status' => 'cancelled_company'],
            reason: $data['reason'],
            companyId: $event->company_id,
        );

        // مصفوفة A10 (H §12.4): الإلغاء الإداري = استرداد كامل دائماً.
        $this->refundService->refundEventCollections($event, 'إلغاء إداري من تيمات — استرداد كامل');

        // Cancel entire series if requested
        if (($data['cancel_series'] ?? false) && $event->isRecurringSeries()) {
            $cancelled = $this->eventCreationService->cancelSeries($event);

            return back()->with('success', "تم إلغاء {$cancelled} فعالية من السلسلة.");
        }

        return back()->with('success', 'تم إلغاء الفعالية — كل ما حُصِّل يُرد كاملاً.');
    }

    /**
     * التغيير اليدوي للحالة — أدمن تيمات وحده (صلاحية event.force_state)،
     * بسبب مكتوب إلزامي، خارج قيود جدول §9، مسجَّل في سجل الانتقالات
     * وسجل التدقيق (H §9 القاعدة 2).
     */
    public function forceStatus(Request $request, Event $event): RedirectResponse
    {
        $admin = auth('admin')->user();

        app(AuthorizationService::class)->authorize($admin, 'event.force_state');

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(EventStatus::values())],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'reason.required' => 'التغيير اليدوي للحالة يتطلب سبباً مكتوباً.',
            'reason.min' => 'اكتب سبباً حقيقياً للتغيير اليدوي.',
        ]);

        $from = (string) $event->status;

        $this->stateMachine->force($event, EventStatus::from($data['status']), $admin, $data['reason']);

        ActivityLogService::log(
            $event->company_id,
            $event,
            'event_status_forced',
            "تغيير يدوي لحالة الفعالية #{$event->id}: {$from} ← {$data['status']}",
            [
                // A15 — H §19: «القيمة قبل وبعد» تُقرأ من هنا في مرآة التدقيق.
                'before' => ['status' => $from],
                'after' => ['status' => $data['status']],
                'reason' => $data['reason'],
                'actor_user_id' => $admin->id,
            ],
        );

        return back()->with('success', "تم تغيير الحالة يدوياً إلى {$data['status']} وتسجيل السبب.");
    }
}

<?php

namespace App\Http\Controllers\Company;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\IndexEventRequest;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Notification;
use App\Services\Company\CompanyEventService;
use App\Services\Employee\ChallengeService;
use App\Services\Employee\EventCreationService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Payments\EventRefundService;
use App\Support\Notify;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private CompanyEventService $eventService,
        private EventCreationService $eventCreationService,
        private ChallengeService $challengeService,
        private EventRefundService $refundService,
        private ParticipationService $participationService,
        private EventStateMachine $stateMachine,
    ) {}

    /**
     * List events for the authenticated company.
     */
    public function index(IndexEventRequest $request): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $filters = $request->validated();

        $events = $this->eventService->listForCompany($company, $filters);

        $totalEvents = $events->total();
        $activeEvents = Event::whereHas('community', fn ($q) => $q->where('company_id', $company->id))
            ->whereIn('status', EventStatus::activeValues())
            ->count();

        return Inertia::render('company/events/index', [
            'company' => $company,
            'events' => $events,
            'filters' => $filters,
            'sort' => CompanyEventService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'totalEvents' => $totalEvents,
            'activeEvents' => $activeEvents,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Show event details with member management.
     */
    public function show(Event $event): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $event->load(['community', 'partner', 'category', 'creator', 'participants', 'alternatives', 'parentEvent']);

        // Get all employees from the event's community
        $communityMembers = $event->community
            ? $event->community->members()->select('employees.id', 'employees.name', 'employees.email')->orderBy('name')->get()
            : collect();

        // Get IDs of currently joined participants
        $joinedIds = $event->participants
            ->filter(fn ($p) => $p->pivot->seat_status === 'reserved')
            ->pluck('id')
            ->all();

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

        // H §9: إلغاء الشركة مشروع من booked/confirmed فقط.
        // مصفوفة A10 (H §12.4): إلغاء الشركة = استرداد كامل دائماً — نسب
        // 100/50/0 القديمة حُذفت.
        $canCancel = in_array($event->status, ['booked', 'confirmed'], true);
        $refundPreview = $canCancel ? [
            'percentage' => 100,
            'policy_label' => 'استرداد كامل — إلغاء الشركة يرد كل ما حُصِّل',
        ] : null;

        return Inertia::render('company/events/show', [
            'company' => $company,
            'event' => $event,
            'communityMembers' => $communityMembers,
            'joinedIds' => $joinedIds,
            'unreadNotifications' => $unreadNotifications,
            'seriesEvents' => $seriesEvents,
            'refundPreview' => $refundPreview,
        ]);
    }

    /**
     * الحذف النهائي ممنوع — الفعالية سجل مالي/تاريخي (H §21). الإلغاء عبر
     * آلة الحالات فقط.
     */
    public function destroy(Event $event): RedirectResponse
    {
        return back()->with('error', 'حذف الفعاليات نهائياً ممنوع — استخدم الإلغاء (سجل مالي وتاريخي لا يُمحى).');
    }

    /**
     * إلغاء من الشركة (cancelled_company) — H §9: مشروع من booked/confirmed
     * فقط؛ الفعالية المفتوحة التي لم يقبلها المزوّد تنتهي تلقائياً (expired)
     * ولا يعرف الجدول إلغاءها.
     */
    public function cancel(Request $request, Event $event): RedirectResponse
    {
        if (! $this->stateMachine->canTransition((string) $event->status, 'cancelled_company')) {
            return back()->with('error', 'لا يمكن إلغاء الفعالية في حالتها الحالية — الإلغاء مشروع بعد قبول المزوّد فقط (محجوزة أو مؤكدة، H §9).');
        }

        $this->stateMachine->cancelCompany($event, auth('company')->user(), $request->input('reason'));

        // مصفوفة A10 (H §12.4): إلغاء الشركة = استرداد كامل — فك الحجوزات،
        // عكس الاستقطاعات، ورد كل حصة مدفوعة لوسيلة الدفع الأصلية.
        $this->refundService->refundEventCollections($event, 'إلغاء الشركة — استرداد كامل');

        // Notify waitlisted members that the event is cancelled
        $waitlistedIds = $event->waitlistEntries()->pluck('employees.id');
        foreach ($waitlistedIds as $employeeId) {
            Notify::sendToId(
                'event.waitlist.cancelled',
                Employee::class,
                (int) $employeeId,
                [],
                ['data' => ['event_id' => $event->id]],
            );
        }

        // Cancel entire series if requested
        if ($request->boolean('cancel_series') && $event->isRecurringSeries()) {
            $cancelled = $this->eventCreationService->cancelSeries($event);

            return back()->with('success', "تم إلغاء {$cancelled} فعالية من السلسلة (المفتوحة التي لم يقبلها المزوّد تنتهي تلقائياً وفق آلة الحالات).");
        }

        return back()->with('success', 'تم إلغاء الفعالية — كل ما حُصِّل يُرد كاملاً (المحفظة وحصص الموظفين لوسيلة الدفع الأصلية).');
    }

    /**
     * إضافة موظف للفعالية (مسؤول الحساب) — عبر مسار الانضمام الذري نفسه:
     * عضوية المجتمع شرط، ولا تحصيل، وقائمة الانتظار عند الامتلاء (H §10).
     */
    public function addMember(Request $request, Event $event): RedirectResponse
    {
        $request->validate(['employee_id' => ['required', 'integer', 'exists:employees,id']]);

        $employee = Employee::withoutGlobalScopes()->findOrFail($request->input('employee_id'));

        try {
            $result = $this->participationService->join($event, $employee, auth('company')->user());
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', $result === 'waitlisted'
            ? 'الفعالية ممتلئة — أُضيف الموظف لقائمة الانتظار.'
            : 'تمت إضافة الموظف للفعالية.');
    }

    /**
     * إزالة موظف من الفعالية — حالة released لا حذف، والمقعد يُعرض على
     * قائمة الانتظار (H §10).
     */
    public function removeMember(Request $request, Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'pending_provider', 'provider_alternative', 'booked'])) {
            return back()->with('error', 'لا يمكن تعديل المشاركين بعد إغلاق التسجيل أو تأكيد الفعالية.');
        }

        $request->validate(['employee_id' => ['required', 'integer', 'exists:employees,id']]);

        $employee = Employee::withoutGlobalScopes()->findOrFail($request->input('employee_id'));

        try {
            $this->participationService->remove($event, $employee, auth('company')->user(), 'إزالة من بوابة الشركة');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'تمت إزالة الموظف من الفعالية.');
    }
}

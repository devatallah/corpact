<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEventRequest;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\EventComment;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Models\VenuePricing;
use App\Services\Attendance\AttendanceService;
use App\Services\Authorization\AuthorizationService;
use App\Services\Company\CompanyEventService;
use App\Services\Competition\ResultService;
use App\Services\Employee\ChallengeService;
use App\Services\Employee\EventCreationService;
use App\Services\Employee\EventDetailService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Events\RescheduleService;
use App\Services\Payments\EventRefundService;
use App\Services\Provider\ProviderSuggestionService;
use App\Support\Competition\MeasurementUnits;
use App\Support\Notify;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private EventCreationService $eventCreationService,
        private EventDetailService $eventDetailService,
        private CompanyEventService $companyEventService,
        private ChallengeService $challengeService,
        private EventRefundService $refundService,
        private ParticipationService $participationService,
        private EventStateMachine $stateMachine,
    ) {}

    /**
     * Show the event creation form.
     */
    public function create(): Response
    {
        $employee = auth('employee')->user();

        $communities = $employee->communities()
            ->with('category')
            ->withCount('members')
            ->get();

        $partners = Partner::query()
            ->with(['venues' => function ($q) {
                $q->active();
            }])
            ->active()
            ->orderBy('name')
            ->get();

        // A10 — H §12.1: لا تخفيضات ولا رموز ترويجية — الميزة أُزيلت.
        return Inertia::render('employee/events/create', [
            'communities' => $communities,
            'partners' => $partners,
        ]);
    }

    /**
     * Return pricings compatible with the given venues, date, and time.
     */
    public function pricings(Request $request): JsonResponse
    {
        $request->validate([
            'venue_ids' => ['required', 'array', 'min:1'],
            'venue_ids.*' => ['integer'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
        ]);

        $venueIds = $request->input('venue_ids');
        $date = $request->input('date');
        $time = $request->input('time');
        $dayOfWeek = (int) Carbon::parse($date)->dayOfWeek; // 0=Sun..6=Sat

        $pricings = VenuePricing::query()
            ->whereIn('venue_id', $venueIds)
            ->where('status', 'active')
            ->get()
            ->filter(function (VenuePricing $p) use ($dayOfWeek, $time) {
                // Filter by days if set
                if (! empty($p->days) && ! in_array($dayOfWeek, $p->days)) {
                    return false;
                }
                // Filter by time range if set
                if ($p->start_time && $p->end_time) {
                    $start = substr($p->start_time, 0, 5);
                    $end = substr($p->end_time, 0, 5);
                    if ($time < $start || $time >= $end) {
                        return false;
                    }
                }

                return true;
            })
            // Per venue + duration, keep only the highest price
            ->groupBy(fn (VenuePricing $p) => $p->venue_id.'-'.$p->duration_minutes)
            ->map(fn ($group) => $group->sortByDesc('price')->first())
            ->values();

        return response()->json($pricings);
    }

    /**
     * Store a newly created event.
     */
    public function store(StoreEventRequest $request): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validated();

        // A9 (H §11): لا تُنشأ فعالية بمزوّد غير متاح، وتجاوز الاقتراح
        // يتطلب سبباً مسجَّلاً إلزامياً. يسري على المزوّدين ذوي التسلسل
        // (فروع + وحدات)؛ الشركاء القدامى بلا فروع خارج الفحص حتى ترحيلهم.
        $suggestionCandidates = $this->guardProviderSelection($data);

        $event = $this->eventCreationService->create($employee, $data);

        if ($suggestionCandidates !== null) {
            app(ProviderSuggestionService::class)->logSelection(
                $event->community,
                (int) $data['partner_id'],
                $suggestionCandidates,
                $data['override_reason'] ?? null,
                event: $event,
                actorUserId: $employee->user_id,
            );
        }

        return redirect()->route('employee.events.show', $event)
            ->with('success', 'تم إنشاء الفعالية بنجاح.');
    }

    /**
     * A9 — حارس اختيار المزوّد: توفر إلزامي + سبب تجاوز إلزامي.
     * يعيد قائمة الاقتراحات لتسجيلها مع الفعالية، أو null لشريك قديم بلا تسلسل.
     *
     * @param  array<string, mixed>  $data
     * @return array<int, array<string, mixed>>|null
     */
    private function guardProviderSelection(array $data): ?array
    {
        $partner = Partner::find($data['partner_id']);

        if ($partner === null || ! $partner->hasHierarchy()) {
            return null;
        }

        $suggestionService = app(ProviderSuggestionService::class);
        $pricing = VenuePricing::find($data['venue_pricing_id']);
        $duration = (int) ($pricing?->duration_minutes ?? 60);
        $start = Carbon::parse($data['date'].' '.$data['time']);

        if (! $suggestionService->providerAvailableFor($partner, (int) $data['category_id'], $start, $duration, (int) $data['capacity'])) {
            throw ValidationException::withMessages([
                'partner_id' => ['المزوّد غير متاح في الوقت المطلوب — لا تُنشأ فعالية بمزوّد غير متاح.'],
            ]);
        }

        $suggestions = $suggestionService->suggest([
            'community_id' => (int) $data['community_id'],
            'category_id' => (int) $data['category_id'],
            'date' => $data['date'],
            'time' => $data['time'],
            'duration_minutes' => $duration,
            'participants_count' => (int) $data['capacity'],
        ]);

        $candidates = $suggestions['candidates'];
        $topPartnerId = $candidates[0]['partner_id'] ?? null;

        // سبب التجاوز إلزامي حين لا يكون المختار هو الاقتراح الأول
        if ($topPartnerId !== null
            && $topPartnerId !== (int) $data['partner_id']
            && trim((string) ($data['override_reason'] ?? '')) === '') {
            throw ValidationException::withMessages([
                'override_reason' => ['سبب تجاوز الاقتراح إلزامي — هذه الأسباب هي مادة أتمتة الاختيار لاحقاً.'],
            ]);
        }

        return $candidates;
    }

    /**
     * Show event details.
     */
    public function show(Event $event): Response
    {
        $employee = auth('employee')->user();

        $detail = $this->eventDetailService->getDetail($event, $employee);

        $isJoined = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('seat_status', 'reserved')
            ->exists();

        $waitlistEntry = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('seat_status', 'waitlisted')
            ->first();

        $isWaitlisted = $waitlistEntry !== null;
        $waitlistPosition = $isWaitlisted ? $waitlistEntry->pivot->position : null;
        $seatOffer = $isWaitlisted
            && $waitlistEntry->pivot->offer_expires_at !== null
            && $waitlistEntry->pivot->offer_expires_at->gte(now())
                ? $waitlistEntry->pivot->offer_expires_at->toIso8601String()
                : null;

        $waitlistCount = $event->waitlistEntries()->count();

        $canManageAlternatives = $event->created_by === $employee->id;

        // Load series info if this is a recurring event
        $seriesEvents = [];
        if ($event->isRecurringSeries()) {
            $seriesEvents = $event->occurrences()
                ->select('id', 'event_date', 'start_time', 'status', 'participants_count', 'capacity')
                ->orderBy('event_date')
                ->get();
        } elseif ($event->isOccurrence()) {
            $event->load('parentEvent');
            $seriesEvents = Event::where('parent_event_id', $event->parent_event_id)
                ->select('id', 'event_date', 'start_time', 'status', 'participants_count', 'capacity')
                ->orderBy('event_date')
                ->get();
        }

        // H §9: الإلغاء (cancelled_company) مشروع من booked/confirmed فقط
        // ولحامل صلاحية event.cancel — لا لمجرد كونه المنشئ.
        $canCancel = in_array($event->status, ['booked', 'confirmed'], true)
            && $this->canCancelEvent($employee, $event);
        // مصفوفة A10 (H §12.4): إلغاء الشركة/الإداري = استرداد كامل دائماً.
        $refundPreview = $canCancel ? [
            'percentage' => 100,
            'policy_label' => 'استرداد كامل — الإلغاء يرد كل ما حُصِّل',
        ] : null;

        $canApproveProposal = $event->status === 'pending_approval'
            && (($event->community !== null && $event->community->isLeader($employee))
                || ($employee->user !== null && app(AuthorizationService::class)->can(
                    $employee->user,
                    'event.approve',
                    RoleAssignment::SCOPE_COMMUNITY,
                    $event->community_id,
                )));

        // H §6: member comments live only under events — 15-min author
        // edit/delete window, report button routes to the AM.
        $comments = $event->comments()
            ->with('employee:id,name')
            ->orderBy('created_at')
            ->get()
            ->each(fn (EventComment $comment) => $comment->setAttribute(
                'can_modify',
                $comment->isModifiableBy($employee),
            ));

        $isCommunityMember = $event->community !== null
            && ($event->community->members()->where('employee_id', $employee->id)->exists()
                || $event->community->isLeader($employee));

        // H §24 (A8): تمديد التسجيل 24 ساعة مرة واحدة — قرار القائد/المنسّق/
        // مسؤول الحساب، قبل الإغلاق وقبل بلوغ الحد الأدنى.
        $canExtendRegistration = in_array($event->status, ['open', 'booked'], true)
            && $event->registration_extended_at === null
            && $event->isRegistrationOpen()
            && $event->reservedParticipants()->count() < (int) $event->min_participants
            && $event->community !== null
            && ($event->community->isLeader($employee)
                || ($employee->user !== null && app(AuthorizationService::class)->can(
                    $employee->user,
                    'event.create_direct',
                    RoleAssignment::SCOPE_COMMUNITY,
                    $event->community_id,
                )));

        // A12 — H §13: قائمة الحضور ونافذة تعديلها (24 ساعة) والنتائج.
        // الضمانة الوحيدة ضد «الفعالية الشبح» تُعرض هنا على صفحة القائد.
        $attendance = app(AttendanceService::class);
        $attendanceEditability = $attendance->editability($event, $employee->user);
        $attendancePanel = $event->completed_at === null ? null : [
            'roster' => $attendance->roster($event),
            'window_closes_at' => $attendance->windowClosesAt($event)?->toIso8601String(),
            'window_open' => $attendance->isWindowOpen($event),
            'locked_at' => $event->attendance_locked_at?->toIso8601String(),
            'can_edit' => $attendanceEditability['allowed'],
            'edit_mode' => $attendanceEditability['mode'],
            'reason_required' => $attendanceEditability['reason_required'],
            'notice' => $attendanceEditability['message'],
            'results' => app(ResultService::class)->forEvent($event),
            'units' => MeasurementUnits::forUi(),
            'can_enter_results' => $employee->user !== null && app(AuthorizationService::class)->can(
                $employee->user,
                'results.enter',
                RoleAssignment::SCOPE_COMMUNITY,
                $event->community_id,
            ),
            'can_correct_results' => $employee->user !== null && app(AuthorizationService::class)->can(
                $employee->user,
                'results.correct',
                RoleAssignment::SCOPE_COMMUNITY,
                $event->community_id,
            ),
        ];

        return Inertia::render('employee/events/show', [
            'attendancePanel' => $attendancePanel,
            'canExtendRegistration' => $canExtendRegistration,
            'event' => $detail['event'],
            'payment' => $detail['payment_breakdown'],
            'myIntent' => $detail['my_intent'],
            'isJoined' => $isJoined,
            'isWaitlisted' => $isWaitlisted,
            'waitlistPosition' => $waitlistPosition,
            'waitlistCount' => $waitlistCount,
            'seatOfferExpiresAt' => $seatOffer,
            'canManageAlternatives' => $canManageAlternatives,
            'isCreator' => $event->created_by === $employee->id,
            'canCancel' => $canCancel,
            'canApproveProposal' => $canApproveProposal,
            'registrationOpen' => $event->isRegistrationOpen(),
            'seriesEvents' => $seriesEvents,
            'refundPreview' => $refundPreview,
            'comments' => $comments,
            'canComment' => $isCommunityMember,
        ]);
    }

    /**
     * الانضمام (H §10): حجز ذري بقفل صف الفعالية داخل ParticipationService —
     * reserved إن وُجد مقعد وإلا waitlisted بترتيب زمني صارم. لا تحصيل إطلاقاً.
     */
    public function join(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        try {
            $result = $this->participationService->join($event, $employee);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        if ($result === 'waitlisted') {
            return back()->with('success', 'تم تسجيلك في قائمة الانتظار.');
        }

        $this->challengeService->incrementProgress($employee, 'events_count');

        return back()->with('success', 'تم الانضمام للفعالية.');
    }

    /**
     * الانسحاب — حر قبل إغلاق التسجيل، ممنوع بعده (H §10). الصف لا يُحذف.
     */
    public function leave(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        try {
            $this->participationService->withdraw($event, $employee);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'تم الانسحاب من الفعالية.');
    }

    /**
     * Leave the waiting list for an event.
     */
    public function leaveWaitlist(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        try {
            $this->participationService->leaveWaitlist($event, $employee);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'تم إلغاء تسجيلك من قائمة الانتظار.');
    }

    /**
     * قبول عرض المقعد الشاغر داخل مهلته (H §10).
     */
    public function acceptSeatOffer(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        try {
            $this->participationService->acceptOffer($event, $employee);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        $this->challengeService->incrementProgress($employee, 'events_count');

        return back()->with('success', 'تم تأكيد مقعدك في الفعالية.');
    }

    /**
     * رفض عرض المقعد — ينتقل العرض للتالي في قائمة الانتظار.
     */
    public function declineSeatOffer(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        try {
            $this->participationService->declineOffer($event, $employee);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'تم رفض العرض وانتقل للتالي في القائمة.');
    }

    /**
     * اعتماد اقتراح فعالية موظف (H §7) — قائد المجتمع أو حامل صلاحية
     * event.approve على نطاق المجتمع، خلال 48 ساعة.
     */
    public function approveProposal(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();
        $this->authorizeProposalAction($employee, $event);

        if ($event->status !== 'pending_approval') {
            return back()->with('error', 'هذه الفعالية ليست اقتراحاً بانتظار الاعتماد.');
        }

        $this->stateMachine->approveProposal($event, $employee);

        // إشعار المقترح والأعضاء بالنشر.
        Notify::sendToId(
            'event.proposal.approved',
            Employee::class,
            (int) $event->created_by,
            [],
            ['data' => ['event_id' => $event->id]],
        );

        $event->load('community.members');
        foreach ($event->community?->members ?? [] as $member) {
            if ($member->id === $event->created_by) {
                continue;
            }
            Notify::send(
                'event.published.member',
                $member,
                ['community' => $event->community->name],
                ['data' => ['event_id' => $event->id]],
            );
        }

        return back()->with('success', 'تم اعتماد الاقتراح ونشر الفعالية.');
    }

    /**
     * رفض اقتراح فعالية موظف بسبب مكتوب.
     */
    public function rejectProposal(Request $request, Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();
        $this->authorizeProposalAction($employee, $event);

        if ($event->status !== 'pending_approval') {
            return back()->with('error', 'هذه الفعالية ليست اقتراحاً بانتظار الاعتماد.');
        }

        $reason = trim((string) $request->input('reason', ''));

        $this->stateMachine->rejectProposal($event, $employee, $reason !== '' ? $reason : null);

        Notify::sendToId(
            'event.proposal.rejected',
            Employee::class,
            (int) $event->created_by,
            ['reason_suffix' => $reason !== '' ? " السبب: {$reason}" : ''],
            ['data' => ['event_id' => $event->id]],
        );

        return back()->with('success', 'تم رفض الاقتراح.');
    }

    /**
     * Accept a proposed alternative (creator or leader only).
     */
    public function acceptAlternative(Event $event, EventAlternative $alternative): RedirectResponse
    {
        $employee = auth('employee')->user();
        $this->authorizeAlternativeAction($employee, $event);

        $this->companyEventService->acceptAlternativeForEvent($event, $alternative, $employee);

        return back()->with('success', 'تم قبول الوقت البديل — عادت الفعالية مفتوحة بالتاريخ الجديد مع انسحاب حر 6 ساعات.');
    }

    /**
     * Reject a proposed alternative (creator or leader only).
     */
    public function rejectAlternative(Event $event, EventAlternative $alternative): RedirectResponse
    {
        $employee = auth('employee')->user();
        $this->authorizeAlternativeAction($employee, $event);

        $this->companyEventService->rejectAlternativeForEvent($event, $alternative, $employee);

        return back()->with('success', 'تم رفض الوقت البديل.');
    }

    /**
     * Remove a participant from the event (creator only).
     */
    public function removeMember(Event $event, Employee $employee): RedirectResponse
    {
        $creator = auth('employee')->user();

        if ($event->created_by !== $creator->id) {
            return back()->with('error', 'يمكن فقط لمنشئ الفعالية إزالة اللاعبين.');
        }

        if (! in_array($event->status, ['open', 'pending_provider', 'provider_alternative', 'booked'])) {
            return back()->with('error', 'لا يمكن إزالة لاعب في هذه الحالة.');
        }

        if ($employee->id === $creator->id) {
            return back()->with('error', 'لا يمكنك إزالة نفسك.');
        }

        try {
            $this->participationService->remove($event, $employee, $creator, 'إزالة بقرار منشئ الفعالية');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        Notify::send(
            'event.participant.removed',
            $employee,
            ['community' => $event->community?->name],
            ['data' => ['event_id' => $event->id]],
        );

        return back()->with('success', "تم إزالة {$employee->name} من الفعالية.");
    }

    /**
     * Preview the refund before cancellation — مصفوفة A10 (H §12.4): إلغاء
     * الشركة/الإداري استرداد كامل دائماً؛ نسب 100/50/0 القديمة حُذفت.
     */
    public function refundPreview(Event $event): JsonResponse
    {
        if (! in_array($event->status, ['booked', 'confirmed'], true)) {
            return response()->json(['error' => 'لا إلغاء إلا لفعالية محجوزة أو مؤكدة.'], 422);
        }

        return response()->json([
            'percentage' => 100,
            'policy_label' => 'استرداد كامل — الإلغاء يرد كل ما حُصِّل',
        ]);
    }

    /**
     * إلغاء فعالية (cancelled_company) — H §9: مشروع من booked/confirmed فقط
     * وبقرار حامل صلاحية `event.cancel` (مسؤول الحساب/أدمن تيمات)؛ لا يعرف
     * الجدول إلغاءً من open/pending_provider — الفعالية المفتوحة تموت بالانتهاء.
     * الاسترداد بمصفوفة A10 (H §12.4): كامل دائماً — محفظةً وحصصاً.
     */
    public function destroy(Request $request, Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        if (! $this->canCancelEvent($employee, $event)) {
            return back()->with('error', 'إلغاء الفعالية صلاحية مسؤول الحساب أو أدمن تيمات (H ملحق ب).');
        }

        $cancelSeries = $request->boolean('cancel_series');

        if (! $this->stateMachine->canTransition((string) $event->status, 'cancelled_company')
            && ! ($cancelSeries && $event->isRecurringSeries())) {
            return back()->with('error', 'لا يمكن إلغاء الفعالية في حالتها الحالية — جدول الحالات لا يجيز الإلغاء إلا بعد قبول المزوّد (محجوزة أو مؤكدة).');
        }

        $cancelled = false;

        if ($this->stateMachine->canTransition((string) $event->status, 'cancelled_company')) {
            $this->stateMachine->cancelCompany($event, $employee, $request->input('reason'));

            // مصفوفة A10 (H §12.4): استرداد كامل — لا نسب متدرجة.
            $this->refundService->refundEventCollections($event, 'إلغاء الشركة — استرداد كامل');
            $cancelled = true;
        }

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

        // Cancel the entire series if requested and event is the parent
        if ($cancelSeries && $event->isRecurringSeries()) {
            $cancelled = $this->eventCreationService->cancelSeries($event, $employee);

            return redirect()->route('employee.home')
                ->with('success', "تم إلغاء {$cancelled} فعالية من السلسلة (المفتوحة التي لم يقبلها المزوّد تنتهي تلقائياً وفق آلة الحالات).");
        }

        $message = $cancelled
            ? 'تم إلغاء الفعالية — كل ما حُصِّل يُرد كاملاً (المحفظة وحصص الموظفين لوسيلة الدفع الأصلية).'
            : 'تم إلغاء الفعالية بنجاح.';

        return redirect()->route('employee.home')
            ->with('success', $message);
    }

    /**
     * تمديد التسجيل 24 ساعة مرة واحدة — H §24: البديل المعتمد لفتح الفعالية
     * على مجتمعات أخرى (المؤجل)، قبل الوقوع في مسار إعادة الجدولة (H §8).
     * قرار قائد المجتمع (أو المنسّق/مسؤول الحساب عبر event.create_direct).
     */
    public function extendRegistration(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();
        $community = $event->community;

        abort_if($community === null, 404);

        $isLeader = $community->isLeader($employee);
        $canDirect = $employee->user !== null && app(AuthorizationService::class)->can(
            $employee->user,
            'event.create_direct',
            RoleAssignment::SCOPE_COMMUNITY,
            $community->id,
        );

        abort_unless($isLeader || $canDirect, 403, 'تمديد التسجيل قرار قائد المجتمع أو المنسّق أو مسؤول الحساب.');

        app(RescheduleService::class)->extendRegistration($event, $employee);

        return back()->with('success', 'مُدد التسجيل 24 ساعة (مرة واحدة) وأُشعر أعضاء المجتمع.');
    }

    /**
     * هل يحمل الموظف صلاحية إلغاء هذه الفعالية؟ (event.cancel على نطاق مجتمعها
     * — مسؤول الحساب عبر نطاق الشركة أو أدمن المنصة؛ المنشئ العادي لا يملكها.)
     */
    private function canCancelEvent(Employee $employee, Event $event): bool
    {
        return $employee->user !== null && app(AuthorizationService::class)->can(
            $employee->user,
            'event.cancel',
            RoleAssignment::SCOPE_COMMUNITY,
            $event->community_id,
        );
    }

    /**
     * Authorize that employee is the event creator.
     */
    private function authorizeAlternativeAction(Employee $employee, Event $event): void
    {
        if ($event->created_by !== $employee->id) {
            abort(403, 'يمكن فقط لمنشئ الفعالية قبول أو رفض البدائل.');
        }
    }

    /**
     * صلاحية اعتماد/رفض اقتراحات الفعاليات: قائد المجتمع أو حامل event.approve.
     */
    private function authorizeProposalAction(Employee $employee, Event $event): void
    {
        $community = $event->community;

        $allowed = ($community !== null && $community->isLeader($employee))
            || ($employee->user !== null && app(AuthorizationService::class)->can(
                $employee->user,
                'event.approve',
                RoleAssignment::SCOPE_COMMUNITY,
                $event->community_id,
            ));

        if (! $allowed) {
            abort(403, 'اعتماد الاقتراحات لقائد المجتمع أو المنسّق أو مسؤول الحساب.');
        }
    }
}

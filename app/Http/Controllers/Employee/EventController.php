<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEventRequest;
use App\Models\Business;
use App\Models\VenuePricing;
use App\Models\Discount;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Services\Company\CompanyEventService;
use App\Services\Employee\ChallengeService;
use App\Services\Employee\EventCreationService;
use App\Services\Employee\EventDetailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private EventCreationService $eventCreationService,
        private EventDetailService $eventDetailService,
        private CompanyEventService $companyEventService,
        private ChallengeService $challengeService,
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

        $businesss = Business::query()
            ->with(['venues' => function ($q) {
                $q->active();
            }])
            ->active()
            ->orderBy('name')
            ->get();

        // Get active discounts for this employee's company communities
        $communityIds = $communities->pluck('id')->toArray();
        $discounts = Discount::query()
            ->where('company_id', $employee->company_id)
            ->whereIn('community_id', $communityIds)
            ->where('status', 'active')
            ->where(function ($q) {
                // Exclude one_time discounts that have already been used
                $q->where('usage', '!=', 'one_time')
                    ->orWhereDoesntHave('events');
            })
            ->get();

        return Inertia::render('employee/events/create', [
            'communities' => $communities,
            'businesses' => $businesss,
            'discounts' => $discounts,
        ]);
    }

    /**
     * Return pricings compatible with the given venues, date, and time.
     */
    public function pricings(Request $request): \Illuminate\Http\JsonResponse
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
        $dayOfWeek = (int) \Carbon\Carbon::parse($date)->dayOfWeek; // 0=Sun..6=Sat

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
            ->groupBy(fn (VenuePricing $p) => $p->venue_id . '-' . $p->duration_minutes)
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

        $event = $this->eventCreationService->create($employee, $data);

        return redirect()->route('employee.events.show', $event)
            ->with('success', 'تم إنشاء الفعالية بنجاح.');
    }

    /**
     * Show event details.
     */
    public function show(Event $event): Response
    {
        $employee = auth('employee')->user();

        $detail = $this->eventDetailService->getDetail($event);

        $isJoined = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('status', 'joined')
            ->exists();

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

        return Inertia::render('employee/events/show', [
            'event' => $detail['event'],
            'payment' => $detail['payment_breakdown'],
            'isJoined' => $isJoined,
            'canManageAlternatives' => $canManageAlternatives,
            'isCreator' => $event->created_by === $employee->id,
            'seriesEvents' => $seriesEvents,
        ]);
    }

    /**
     * Join an event.
     */
    public function join(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        try {
            DB::transaction(function () use ($event, $employee) {
                // Lock the event row to prevent race conditions
                $event = Event::lockForUpdate()->findOrFail($event->id);

                if ($event->status !== 'open') {
                    throw new \RuntimeException('لا يمكن الانضمام إلا للفعاليات المفتوحة.');
                }

                if ($event->participants_count >= $event->capacity) {
                    throw new \RuntimeException('الفعالية مكتملة العدد.');
                }

                $alreadyJoined = $event->participants()
                    ->where('employee_id', $employee->id)
                    ->wherePivot('status', 'joined')
                    ->exists();

                if ($alreadyJoined) {
                    throw new \RuntimeException('أنت منضم بالفعل.');
                }

                $event->participants()->attach($employee->id, [
                    'status' => 'joined',
                    'joined_at' => now(),
                ]);

                $event->increment('participants_count');
                $event->refresh();

                // Auto-transition to waiting_business when capacity is full
                if ($event->participants_count >= $event->capacity) {
                    $event->update(['status' => 'waiting_business']);

                    Notification::create([
                        'notifiable_type' => \App\Models\Business::class,
                        'notifiable_id' => $event->business_id,
                        'type' => 'info',
                        'title' => 'طلب حجز جديد',
                        'body' => "طلب حجز جديد للفعالية #{$event->id} — {$event->venues_count} ملعب بتاريخ {$event->event_date->format('Y-m-d')}",
                        'data' => ['event_id' => $event->id],
                    ]);
                }
            });
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        $this->challengeService->incrementProgress($employee, 'events_count');

        return back()->with('success', 'تم الانضمام للفعالية.');
    }

    /**
     * Leave an event.
     */
    public function leave(Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'waiting_business'])) {
            return back()->with('error', 'لا يمكن مغادرة الفعالية في هذه الحالة.');
        }

        $employee = auth('employee')->user();

        $event->participants()->detach($employee->id);
        $event->decrement('participants_count');

        // If was waiting_business and someone left, go back to open and notify business
        if ($event->status === 'waiting_business') {
            $event->update(['status' => 'open']);

            Notification::create([
                'notifiable_type' => \App\Models\Business::class,
                'notifiable_id' => $event->business_id,
                'type' => 'warning',
                'title' => 'تغيير في طلب الحجز',
                'body' => "الفعالية #{$event->id} رجعت لحالة مفتوحة — أحد اللاعبين غادر",
                'data' => ['event_id' => $event->id],
            ]);
        }

        return back()->with('success', 'تم مغادرة الفعالية.');
    }

    /**
     * Accept a proposed alternative (creator or leader only).
     */
    public function acceptAlternative(Event $event, EventAlternative $alternative): RedirectResponse
    {
        $employee = auth('employee')->user();
        $this->authorizeAlternativeAction($employee, $event);

        $this->companyEventService->acceptAlternativeForEvent($event, $alternative);

        return back()->with('success', 'تم قبول الوقت البديل وتأكيد الحجز.');
    }

    /**
     * Reject a proposed alternative (creator or leader only).
     */
    public function rejectAlternative(Event $event, EventAlternative $alternative): RedirectResponse
    {
        $employee = auth('employee')->user();
        $this->authorizeAlternativeAction($employee, $event);

        $this->companyEventService->rejectAlternativeForEvent($event, $alternative);

        return back()->with('success', 'تم رفض الوقت البديل.');
    }

    /**
     * Remove a participant from the event (creator only).
     */
    public function removeMember(Event $event, \App\Models\Employee $employee): RedirectResponse
    {
        $creator = auth('employee')->user();

        if ($event->created_by !== $creator->id) {
            return back()->with('error', 'يمكن فقط لمنشئ الفعالية إزالة اللاعبين.');
        }

        if (! in_array($event->status, ['open', 'waiting_business', 'alternative_proposed'])) {
            return back()->with('error', 'لا يمكن إزالة لاعب في هذه الحالة.');
        }

        if ($employee->id === $creator->id) {
            return back()->with('error', 'لا يمكنك إزالة نفسك.');
        }

        $wasJoined = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('status', 'joined')
            ->exists();

        if (! $wasJoined) {
            return back()->with('error', 'هذا اللاعب غير منضم.');
        }

        $event->participants()->detach($employee->id);
        $event->decrement('participants_count');

        if ($event->status === 'waiting_business') {
            $event->update(['status' => 'open']);
        }

        Notification::create([
            'notifiable_type' => \App\Models\Employee::class,
            'notifiable_id' => $employee->id,
            'type' => 'warning',
            'title' => 'تمت إزالتك من الفعالية',
            'body' => "قام منشئ الفعالية بإزالتك من فعالية {$event->community?->name}",
            'data' => ['event_id' => $event->id],
        ]);

        return back()->with('success', "تم إزالة {$employee->name} من الفعالية.");
    }

    /**
     * Cancel/destroy an event.
     *
     * If ?cancel_series=1 is passed and the event is a recurring series parent,
     * all future occurrences are also cancelled.
     */
    public function destroy(Request $request, Event $event): RedirectResponse
    {
        if (in_array($event->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'لا يمكن إلغاء فعالية ملغاة أو منتهية.');
        }

        $cancelSeries = $request->boolean('cancel_series');

        // Refund community contribution
        $contribution = (float) $event->community_contribution;
        if ($contribution > 0 && $event->community) {
            $event->community->increment('balance', $contribution);
        }

        $event->update(['status' => 'cancelled']);

        // Cancel the entire series if requested and event is the parent
        if ($cancelSeries && $event->isRecurringSeries()) {
            $this->eventCreationService->cancelSeries($event);
            return redirect()->route('employee.home')
                ->with('success', 'تم إلغاء سلسلة الفعاليات بالكامل.');
        }

        return redirect()->route('employee.home')
            ->with('success', 'تم إلغاء الفعالية.');
    }

    /**
     * Authorize that employee is the event creator.
     */
    private function authorizeAlternativeAction(\App\Models\Employee $employee, Event $event): void
    {
        if ($event->created_by !== $employee->id) {
            abort(403, 'يمكن فقط لمنشئ الفعالية قبول أو رفض البدائل.');
        }
    }
}

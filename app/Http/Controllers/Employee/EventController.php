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

        $waitlistEntry = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('status', 'waitlisted')
            ->first();

        $isWaitlisted = $waitlistEntry !== null;
        $waitlistPosition = $isWaitlisted ? $waitlistEntry->pivot->position : null;

        $waitlistCount = $event->waitlistEntries()->count();

        $canManageAlternatives = $event->created_by === $employee->id;

        return Inertia::render('employee/events/show', [
            'event' => $detail['event'],
            'payment' => $detail['payment_breakdown'],
            'isJoined' => $isJoined,
            'isWaitlisted' => $isWaitlisted,
            'waitlistPosition' => $waitlistPosition,
            'waitlistCount' => $waitlistCount,
            'canManageAlternatives' => $canManageAlternatives,
            'isCreator' => $event->created_by === $employee->id,
        ]);
    }

    /**
     * Join an event (or join the waiting list if full).
     */
    public function join(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();
        $joinedWaitlist = false;

        try {
            DB::transaction(function () use ($event, $employee, &$joinedWaitlist) {
                // Lock the event row to prevent race conditions
                $event = Event::lockForUpdate()->findOrFail($event->id);

                if (! in_array($event->status, ['open', 'full', 'waiting_business', 'confirmed'])) {
                    throw new \RuntimeException('لا يمكن الانضمام لهذه الفعالية في حالتها الحالية.');
                }

                // Check if already joined or waitlisted
                $existing = $event->participants()
                    ->where('employee_id', $employee->id)
                    ->wherePivotIn('status', ['joined', 'waitlisted'])
                    ->first();

                if ($existing) {
                    $status = $existing->pivot->status;
                    if ($status === 'joined') {
                        throw new \RuntimeException('أنت منضم بالفعل.');
                    }
                    if ($status === 'waitlisted') {
                        throw new \RuntimeException('أنت مسجل في قائمة الانتظار بالفعل.');
                    }
                }

                // If there is room, join directly
                if ($event->participants_count < $event->capacity && $event->status === 'open') {
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
                } else {
                    // Event is full — add to waiting list
                    $maxPosition = (int) DB::table('event_participants')
                        ->where('event_id', $event->id)
                        ->where('status', 'waitlisted')
                        ->max('position');

                    $event->participants()->attach($employee->id, [
                        'status' => 'waitlisted',
                        'joined_at' => now(),
                        'position' => $maxPosition + 1,
                    ]);

                    $joinedWaitlist = true;
                }
            });
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        if ($joinedWaitlist) {
            return back()->with('success', 'تم تسجيلك في قائمة الانتظار.');
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

        DB::transaction(function () use ($event, $employee) {
            $event = Event::lockForUpdate()->findOrFail($event->id);

            $event->participants()->detach($employee->id);
            $event->decrement('participants_count');

            // Try to promote from waitlist
            $promoted = $this->promoteFromWaitlist($event);

            // If no one was promoted and the event was waiting_business, revert to open
            if (! $promoted && $event->status === 'waiting_business') {
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
        });

        return back()->with('success', 'تم مغادرة الفعالية.');
    }

    /**
     * Leave the waiting list for an event.
     */
    public function leaveWaitlist(Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        $isWaitlisted = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('status', 'waitlisted')
            ->exists();

        if (! $isWaitlisted) {
            return back()->with('error', 'أنت غير مسجل في قائمة الانتظار.');
        }

        DB::transaction(function () use ($event, $employee) {
            $removedPosition = (int) DB::table('event_participants')
                ->where('event_id', $event->id)
                ->where('employee_id', $employee->id)
                ->where('status', 'waitlisted')
                ->value('position');

            $event->participants()->detach($employee->id);

            // Reorder remaining waitlist positions
            DB::table('event_participants')
                ->where('event_id', $event->id)
                ->where('status', 'waitlisted')
                ->where('position', '>', $removedPosition)
                ->decrement('position');
        });

        return back()->with('success', 'تم إلغاء تسجيلك من قائمة الانتظار.');
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

        DB::transaction(function () use ($event, $employee) {
            $event = Event::lockForUpdate()->findOrFail($event->id);

            $event->participants()->detach($employee->id);
            $event->decrement('participants_count');

            // Try to promote from waitlist
            $promoted = $this->promoteFromWaitlist($event);

            if (! $promoted && $event->status === 'waiting_business') {
                $event->update(['status' => 'open']);
            }
        });

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
     */
    public function destroy(Event $event): RedirectResponse
    {
        if (in_array($event->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'لا يمكن إلغاء فعالية ملغاة أو منتهية.');
        }

        // Refund community contribution
        $contribution = (float) $event->community_contribution;
        if ($contribution > 0 && $event->community) {
            $event->community->increment('balance', $contribution);
        }

        // Notify waitlisted members that the event is cancelled
        $waitlistedIds = $event->waitlistEntries()->pluck('employees.id');
        foreach ($waitlistedIds as $employeeId) {
            Notification::create([
                'notifiable_type' => \App\Models\Employee::class,
                'notifiable_id' => $employeeId,
                'type' => 'warning',
                'title' => 'تم إلغاء الفعالية',
                'body' => 'تم إلغاء الفعالية التي كنت في قائمة انتظارها.',
                'data' => ['event_id' => $event->id],
            ]);
        }

        $event->update(['status' => 'cancelled']);

        return redirect()->route('employee.home')
            ->with('success', 'تم إلغاء الفعالية.');
    }

    /**
     * Promote the next person from the waiting list to a joined participant.
     *
     * Returns true if someone was promoted, false otherwise.
     */
    private function promoteFromWaitlist(Event $event): bool
    {
        $next = $event->waitlistEntries()->first();

        if (! $next) {
            return false;
        }

        $promotedPosition = $next->pivot->position;

        // Update status from waitlisted to joined
        $event->participants()->updateExistingPivot($next->id, [
            'status' => 'joined',
            'joined_at' => now(),
            'position' => null,
        ]);

        $event->increment('participants_count');

        // Reorder remaining waitlist positions
        DB::table('event_participants')
            ->where('event_id', $event->id)
            ->where('status', 'waitlisted')
            ->where('position', '>', $promotedPosition)
            ->decrement('position');

        // Notify the promoted employee
        Notification::create([
            'notifiable_type' => \App\Models\Employee::class,
            'notifiable_id' => $next->id,
            'type' => 'success',
            'title' => 'تم ترقيتك من قائمة الانتظار',
            'body' => "تم تأكيد مكانك في الفعالية! أحد اللاعبين غادر وأنت الآن منضم.",
            'data' => ['event_id' => $event->id],
        ]);

        $this->challengeService->incrementProgress($next, 'events_count');

        return true;
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

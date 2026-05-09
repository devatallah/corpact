<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEventRequest;
use App\Models\Club;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\Notification;
use App\Services\Company\CompanyEventService;
use App\Services\Employee\EventCreationService;
use App\Services\Employee\EventDetailService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private EventCreationService $eventCreationService,
        private EventDetailService $eventDetailService,
        private CompanyEventService $companyEventService,
    ) {}

    /**
     * Show the event creation form.
     */
    public function create(): Response
    {
        $employee = auth('employee')->user();

        $communities = $employee->communities()
            ->with('sport')
            ->withCount('members')
            ->get();

        $clubs = Club::query()
            ->with(['courts.pricings'])
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('employee/events/create', [
            'communities' => $communities,
            'clubs' => $clubs,
        ]);
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

        return Inertia::render('employee/events/show', [
            'event' => $detail['event'],
            'payment' => $detail['payment_breakdown'],
            'isJoined' => $isJoined,
            'canManageAlternatives' => $canManageAlternatives,
            'isCreator' => $event->created_by === $employee->id,
        ]);
    }

    /**
     * Join an event.
     */
    public function join(Event $event): RedirectResponse
    {
        if ($event->status !== 'open') {
            return back()->with('error', 'لا يمكن الانضمام إلا للفعاليات المفتوحة.');
        }

        if ($event->participants_count >= $event->capacity) {
            return back()->with('error', 'الفعالية مكتملة العدد.');
        }

        $employee = auth('employee')->user();

        $alreadyJoined = $event->participants()
            ->where('employee_id', $employee->id)
            ->wherePivot('status', 'joined')
            ->exists();

        if ($alreadyJoined) {
            return back()->with('error', 'أنت منضم بالفعل.');
        }

        $event->participants()->attach($employee->id, [
            'status' => 'joined',
            'joined_at' => now(),
        ]);

        $event->increment('participants_count');
        $event->refresh();

        // Auto-transition to waiting_club when capacity is full
        if ($event->participants_count >= $event->capacity) {
            $event->update(['status' => 'waiting_club']);

            // Notify club
            Notification::create([
                'notifiable_type' => \App\Models\Club::class,
                'notifiable_id' => $event->club_id,
                'type' => 'info',
                'title' => 'طلب حجز جديد',
                'body' => "طلب حجز جديد للفعالية #{$event->id} — {$event->courts_count} ملعب بتاريخ {$event->event_date->format('Y-m-d')}",
                'data' => ['event_id' => $event->id],
            ]);
        }

        return back()->with('success', 'تم الانضمام للفعالية.');
    }

    /**
     * Leave an event.
     */
    public function leave(Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'waiting_club'])) {
            return back()->with('error', 'لا يمكن مغادرة الفعالية في هذه الحالة.');
        }

        $employee = auth('employee')->user();

        $event->participants()->detach($employee->id);
        $event->decrement('participants_count');

        // If was waiting_club and someone left, go back to open
        if ($event->status === 'waiting_club') {
            $event->update(['status' => 'open']);
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

        if (! in_array($event->status, ['open', 'waiting_club', 'alternative_proposed'])) {
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

        if ($event->status === 'waiting_club') {
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

        $event->update(['status' => 'cancelled']);

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

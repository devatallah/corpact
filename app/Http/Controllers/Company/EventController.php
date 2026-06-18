<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\IndexEventRequest;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Notification;
use App\Services\Company\CompanyEventService;
use App\Services\Employee\EventCreationService;
use App\Services\Employee\ChallengeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private CompanyEventService $eventService,
        private EventCreationService $eventCreationService,
        private ChallengeService $challengeService,
    ) {}

    /**
     * List events for the authenticated company.
     */
    public function index(IndexEventRequest $request): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $filters = $request->validated();

        $events = $this->eventService->listForCompany($company, $filters);

        $totalEvents = $events->total();
        $activeEvents = Event::whereHas('community', fn ($q) => $q->where('company_id', $company->id))
            ->whereIn('status', ['open', 'waiting_business', 'confirmed'])
            ->count();

        return Inertia::render('company/events/index', [
            'company' => $company,
            'events' => $events,
            'filters' => $filters,
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
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $event->load(['community', 'business', 'category', 'creator', 'participants', 'alternatives', 'parentEvent']);

        // Get all employees from the event's community
        $communityMembers = $event->community
            ? $event->community->members()->select('employees.id', 'employees.name', 'employees.email')->orderBy('name')->get()
            : collect();

        // Get IDs of currently joined participants
        $joinedIds = $event->participants
            ->filter(fn ($p) => $p->pivot->status === 'joined')
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

        return Inertia::render('company/events/show', [
            'company' => $company,
            'event' => $event,
            'communityMembers' => $communityMembers,
            'joinedIds' => $joinedIds,
            'unreadNotifications' => $unreadNotifications,
            'seriesEvents' => $seriesEvents,
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event): RedirectResponse
    {
        Gate::authorize('delete', $event);

        $event->delete();

        return redirect()->route('company.events.index')
            ->with('success', 'تم حذف الفعالية بنجاح.');
    }

    /**
     * Cancel the specified event.
     */
    public function cancel(Request $request, Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'waiting_business', 'alternative_proposed'])) {
            return back()->with('error', 'يمكن إلغاء الفعالية فقط إذا كانت مفتوحة أو بانتظار النادي أو بديل مقترح.');
        }

        // Only refund community contribution if budget was already deducted
        // (budget is deducted only after provider approval)
        if ($event->budget_deducted_at) {
            $contribution = (float) $event->community_contribution;
            if ($contribution > 0 && $event->community) {
                $event->community->increment('balance', $contribution);
            }
        }

        // Notify waitlisted members that the event is cancelled
        $waitlistedIds = $event->waitlistEntries()->pluck('employees.id');
        foreach ($waitlistedIds as $employeeId) {
            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $employeeId,
                'type' => 'warning',
                'title' => 'تم إلغاء الفعالية',
                'body' => 'تم إلغاء الفعالية التي كنت في قائمة انتظارها.',
                'data' => ['event_id' => $event->id],
            ]);
        }

        $event->update(['status' => 'cancelled']);

        // Cancel entire series if requested
        if ($request->boolean('cancel_series') && $event->isRecurringSeries()) {
            $this->eventCreationService->cancelSeries($event);
            return back()->with('success', 'تم إلغاء سلسلة الفعاليات بالكامل.');
        }

        return back()->with('success', 'تم إلغاء الفعالية بنجاح.');
    }

    /**
     * Add an employee to the event.
     */
    public function addMember(Request $request, Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'waiting_business', 'alternative_proposed'])) {
            return back()->with('error', 'لا يمكن تعديل المشاركين بعد تأكيد الفعالية.');
        }

        $request->validate(['employee_id' => ['required', 'integer', 'exists:employees,id']]);

        $employeeId = $request->input('employee_id');

        $alreadyJoined = $event->participants()
            ->where('employee_id', $employeeId)
            ->wherePivot('status', 'joined')
            ->exists();

        if ($alreadyJoined) {
            return back()->with('error', 'الموظف منضم بالفعل.');
        }

        if ($event->participants_count >= $event->capacity) {
            return back()->with('error', 'الفعالية مكتملة العدد.');
        }

        $event->participants()->syncWithoutDetaching([
            $employeeId => ['status' => 'joined', 'joined_at' => now()],
        ]);

        $event->increment('participants_count');
        $event->refresh();

        // Auto-transition to waiting_business when capacity is full
        if ($event->status === 'open' && $event->participants_count >= $event->capacity) {
            $event->update(['status' => 'waiting_business']);

            \App\Models\Notification::create([
                'notifiable_type' => \App\Models\Business::class,
                'notifiable_id' => $event->business_id,
                'type' => 'info',
                'title' => 'طلب حجز جديد',
                'body' => "طلب حجز جديد للفعالية #{$event->id} — {$event->venues_count} ملعب بتاريخ {$event->event_date->format('Y-m-d')}",
                'data' => ['event_id' => $event->id],
            ]);
        }

        return back()->with('success', 'تمت إضافة الموظف للفعالية.');
    }

    /**
     * Remove an employee from the event.
     */
    public function removeMember(Request $request, Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'waiting_business', 'alternative_proposed'])) {
            return back()->with('error', 'لا يمكن تعديل المشاركين بعد تأكيد الفعالية.');
        }

        $request->validate(['employee_id' => ['required', 'integer', 'exists:employees,id']]);

        $employeeId = $request->input('employee_id');

        $isJoined = $event->participants()
            ->where('employee_id', $employeeId)
            ->wherePivot('status', 'joined')
            ->exists();

        if (! $isJoined) {
            return back()->with('error', 'الموظف غير منضم.');
        }

        DB::transaction(function () use ($event, $employeeId) {
            $event = Event::lockForUpdate()->findOrFail($event->id);

            $event->participants()->detach($employeeId);
            $event->decrement('participants_count');

            // Try to promote from waitlist
            $promoted = $this->promoteFromWaitlist($event);

            if (! $promoted && $event->status === 'waiting_business') {
                $event->update(['status' => 'open']);
            }
        });

        return back()->with('success', 'تمت إزالة الموظف من الفعالية.');
    }

    /**
     * Promote the next person from the waiting list to a joined participant.
     */
    private function promoteFromWaitlist(Event $event): bool
    {
        $next = $event->waitlistEntries()->first();

        if (! $next) {
            return false;
        }

        $promotedPosition = $next->pivot->position;

        $event->participants()->updateExistingPivot($next->id, [
            'status' => 'joined',
            'joined_at' => now(),
            'position' => null,
        ]);

        $event->increment('participants_count');

        DB::table('event_participants')
            ->where('event_id', $event->id)
            ->where('status', 'waitlisted')
            ->where('position', '>', $promotedPosition)
            ->decrement('position');

        Notification::create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $next->id,
            'type' => 'success',
            'title' => 'تم ترقيتك من قائمة الانتظار',
            'body' => 'تم تأكيد مكانك في الفعالية! أحد اللاعبين غادر وأنت الآن منضم.',
            'data' => ['event_id' => $event->id],
        ]);

        $this->challengeService->incrementProgress($next, 'events_count');

        return true;
    }

}

<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\IndexEventRequest;
use App\Models\Employee;
use App\Models\Event;
use App\Services\Company\CompanyEventService;
use App\Services\RefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private CompanyEventService $eventService,
        private RefundService $refundService,
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

        $event->load(['community', 'business', 'category', 'creator', 'participants', 'alternatives']);

        // Get all employees from the event's community
        $communityMembers = $event->community
            ? $event->community->members()->select('employees.id', 'employees.name', 'employees.email')->orderBy('name')->get()
            : collect();

        // Get IDs of currently joined participants
        $joinedIds = $event->participants
            ->filter(fn ($p) => $p->pivot->status === 'joined')
            ->pluck('id')
            ->all();

        $canCancel = ! in_array($event->status, ['cancelled', 'completed', 'rejected']);
        $refundPreview = $canCancel ? $this->refundService->getRefundPreview($event) : null;

        return Inertia::render('company/events/show', [
            'company' => $company,
            'event' => $event,
            'communityMembers' => $communityMembers,
            'joinedIds' => $joinedIds,
            'unreadNotifications' => $unreadNotifications,
            'refundPreview' => $refundPreview,
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
     * Cancel the specified event with refund policy applied.
     */
    public function cancel(Event $event): RedirectResponse
    {
        if (! in_array($event->status, ['open', 'waiting_business', 'alternative_proposed', 'confirmed'])) {
            return back()->with('error', 'يمكن إلغاء الفعالية فقط إذا كانت مفتوحة أو بانتظار النادي أو بديل مقترح أو مؤكدة.');
        }

        $refundAmount = $this->refundService->applyRefund($event);

        $event->update(['status' => 'cancelled']);

        $message = $refundAmount > 0
            ? "تم إلغاء الفعالية. تم استرداد {$refundAmount} ريال إلى رصيد المجتمع."
            : 'تم إلغاء الفعالية. لا يوجد استرداد بسبب قرب موعد الفعالية.';

        return back()->with('success', $message);
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

        $event->participants()->detach($employeeId);
        $event->decrement('participants_count');

        // If was waiting_business and someone was removed, go back to open
        if ($event->status === 'waiting_business') {
            $event->update(['status' => 'open']);
        }

        return back()->with('success', 'تمت إزالة الموظف من الفعالية.');
    }

}

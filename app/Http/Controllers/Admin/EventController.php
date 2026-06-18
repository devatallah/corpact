<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexEventRequest;
use App\Models\Event;
use App\Services\Admin\AdminEventService;
use App\Services\Employee\EventCreationService;
use App\Services\RefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private AdminEventService $eventService,
        private EventCreationService $eventCreationService,
        private RefundService $refundService,
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
            'filters' => $filters,
        ]);
    }

    /**
     * Show event details with member management.
     */
    public function show(Event $event): Response
    {
        $event->load(['community', 'business', 'category', 'creator', 'participants', 'company', 'parentEvent']);

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
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event): RedirectResponse
    {
        Gate::authorize('delete', $event);

        $event->delete();

        return redirect()->route('admin.events.index')
            ->with('success', 'تم حذف الفعالية بنجاح.');
    }

    /**
     * Cancel the specified event with refund policy applied.
     */
    public function cancel(Request $request, Event $event): RedirectResponse
    {
        if (in_array($event->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'لا يمكن إلغاء فعالية ملغاة أو منتهية.');
        }

        Gate::authorize('cancel', $event);

        // Apply refund via refund service (handles percentage calculation)
        // Only processes refund if budget was already deducted
        $refundAmount = $event->budget_deducted_at
            ? $this->refundService->applyRefund($event)
            : 0;

        $event->update(['status' => 'cancelled']);

        // Cancel entire series if requested
        if ($request->boolean('cancel_series') && $event->isRecurringSeries()) {
            $this->eventCreationService->cancelSeries($event);
            return back()->with('success', 'تم إلغاء سلسلة الفعاليات بالكامل.');
        }

        $message = $refundAmount > 0
            ? "تم إلغاء الفعالية. تم استرداد {$refundAmount} ريال إلى رصيد المجتمع."
            : 'تم إلغاء الفعالية بنجاح.';

        return back()->with('success', $message);
    }

}

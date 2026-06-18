<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexEventRequest;
use App\Models\Event;
use App\Services\Admin\AdminEventService;
use App\Services\RefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        private AdminEventService $eventService,
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
        $event->load(['community', 'business', 'category', 'creator', 'participants', 'company']);

        return Inertia::render('admin/events/show', [
            'event' => $event,
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
    public function cancel(Event $event): RedirectResponse
    {
        if (in_array($event->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'لا يمكن إلغاء فعالية ملغاة أو منتهية.');
        }

        Gate::authorize('cancel', $event);

        $refundAmount = $this->refundService->applyRefund($event);

        $event->update(['status' => 'cancelled']);

        $message = $refundAmount > 0
            ? "تم إلغاء الفعالية. تم استرداد {$refundAmount} ريال إلى رصيد المجتمع."
            : 'تم إلغاء الفعالية. لا يوجد استرداد بسبب قرب موعد الفعالية.';

        return back()->with('success', $message);
    }

}

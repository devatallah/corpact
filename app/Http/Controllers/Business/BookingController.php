<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\IndexBookingRequest;
use App\Http\Requests\Business\ProposeAlternativeRequest;
use App\Http\Requests\Business\RejectBookingRequest;
use App\Models\Event;
use App\Services\Business\BookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
    ) {}

    /**
     * List booking requests for the authenticated business.
     */
    public function index(IndexBookingRequest $request): Response
    {
        $business = auth('business')->user()->resolvedBusiness();

        $filters = $request->validated();

        $events = $this->bookingService->listForbusiness($business, $filters);

        $pendingCount = $business->events()->where('status', 'waiting_business')->count();

        return Inertia::render('business/requests/index', [
            'business' => $business,
            'events' => $events,
            'filters' => $filters,
            'pendingCount' => $pendingCount,
        ]);
    }

    /**
     * Approve a booking request.
     */
    public function approve(Event $event): RedirectResponse
    {
        Gate::authorize('approve', $event);

        $business = auth('business')->user()->resolvedBusiness();
        $this->bookingService->approve($business, $event);

        return back()->with('success', 'تم قبول الحجز بنجاح.');
    }

    /**
     * Reject a booking request.
     */
    public function reject(RejectBookingRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('reject', $event);

        $business = auth('business')->user()->resolvedBusiness();

        $data = $request->validated();

        $this->bookingService->reject($business, $event, $data['reason']);

        return back()->with('success', 'تم رفض الحجز.');
    }

    /**
     * Propose an alternative for a booking request.
     */
    public function proposeAlternative(ProposeAlternativeRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('approve', $event);

        $business = auth('business')->user()->resolvedBusiness();

        $this->bookingService->proposeAlternative($business, $event, $request->validated());

        return back()->with('success', 'تم إرسال الوقت البديل.');
    }
}

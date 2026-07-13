<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\IndexBookingRequest;
use App\Http\Requests\Partner\ProposeAlternativeRequest;
use App\Http\Requests\Partner\RejectBookingRequest;
use App\Models\Event;
use App\Services\Partner\BookingService;
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
     * List booking requests for the authenticated partner.
     */
    public function index(IndexBookingRequest $request): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $filters = $request->validated();

        $events = $this->bookingService->listForpartner($partner, $filters);

        $pendingCount = $partner->events()->where('status', 'waiting_partner')->count();

        return Inertia::render('partner/requests/index', [
            'partner' => $partner,
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

        $partner = auth('partner')->user()->resolvedPartner();
        $this->bookingService->approve($partner, $event);

        return back()->with('success', 'تم قبول الحجز بنجاح.');
    }

    /**
     * Reject a booking request.
     */
    public function reject(RejectBookingRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('reject', $event);

        $partner = auth('partner')->user()->resolvedPartner();

        $data = $request->validated();

        $this->bookingService->reject($partner, $event, $data['reason']);

        return back()->with('success', 'تم رفض الحجز.');
    }

    /**
     * Propose an alternative for a booking request.
     */
    public function proposeAlternative(ProposeAlternativeRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('approve', $event);

        $partner = auth('partner')->user()->resolvedPartner();

        $this->bookingService->proposeAlternative($partner, $event, $request->validated());

        return back()->with('success', 'تم إرسال الوقت البديل.');
    }
}

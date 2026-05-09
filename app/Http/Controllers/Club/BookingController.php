<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Http\Requests\Club\IndexBookingRequest;
use App\Http\Requests\Club\ProposeAlternativeRequest;
use App\Http\Requests\Club\RejectBookingRequest;
use App\Models\Event;
use App\Services\Club\BookingService;
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
     * List booking requests for the authenticated club.
     */
    public function index(IndexBookingRequest $request): Response
    {
        $club = auth('club')->user();

        $filters = $request->validated();

        $events = $this->bookingService->listForClub($club, $filters);

        $pendingCount = $club->events()->where('status', 'waiting_club')->count();

        return Inertia::render('club/requests/index', [
            'club' => $club,
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

        $club = auth('club')->user();
        $this->bookingService->approve($club, $event);

        return back()->with('success', 'تم قبول الحجز بنجاح.');
    }

    /**
     * Reject a booking request.
     */
    public function reject(RejectBookingRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('reject', $event);

        $club = auth('club')->user();

        $data = $request->validated();

        $this->bookingService->reject($club, $event, $data['reason']);

        return back()->with('success', 'تم رفض الحجز.');
    }

    /**
     * Propose an alternative for a booking request.
     */
    public function proposeAlternative(ProposeAlternativeRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('approve', $event);

        $club = auth('club')->user();

        $this->bookingService->proposeAlternative($club, $event, $request->validated());

        return back()->with('success', 'تم إرسال الوقت البديل.');
    }
}

<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\IndexBookingRequest;
use App\Http\Requests\Partner\ProposeAlternativeRequest;
use App\Http\Requests\Partner\RejectBookingRequest;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Services\Partner\BookingService;
use App\Services\Provider\ProviderRequestService;
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

        $pendingCount = $partner->events()->where('status', 'pending_provider')->count();

        return Inertia::render('partner/requests/index', [
            'partner' => $partner,
            'events' => $events,
            'filters' => $filters,
            'pendingCount' => $pendingCount,
        ]);
    }

    /**
     * Approve a booking request.
     *
     * A9: حين يوجد طلب مزوّد مفتوح للفعالية يمر القرار عبر قناة الطلبات
     * (أول رد يثبّت + حجز الوحدة بقفل + أثر الموثوقية)؛ وإلا فالمسار القديم.
     */
    public function approve(Event $event): RedirectResponse
    {
        Gate::authorize('approve', $event);

        $open = $this->openProviderRequest($event);

        if ($open !== null) {
            app(ProviderRequestService::class)->accept(auth('partner')->user(), $open);
        } else {
            $partner = auth('partner')->user()->resolvedPartner();
            $this->bookingService->approve($partner, $event);
        }

        return back()->with('success', 'تم قبول الطلب بنجاح.');
    }

    /**
     * Reject a booking request.
     */
    public function reject(RejectBookingRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('reject', $event);

        $data = $request->validated();

        $open = $this->openProviderRequest($event);

        if ($open !== null) {
            app(ProviderRequestService::class)->reject(auth('partner')->user(), $open, $data['reason']);
        } else {
            $partner = auth('partner')->user()->resolvedPartner();
            $this->bookingService->reject($partner, $event, $data['reason']);
        }

        return back()->with('success', 'تم رفض الطلب.');
    }

    /**
     * Propose an alternative for a booking request.
     */
    public function proposeAlternative(ProposeAlternativeRequest $request, Event $event): RedirectResponse
    {
        Gate::authorize('approve', $event);

        $open = $this->openProviderRequest($event);

        if ($open !== null) {
            app(ProviderRequestService::class)->proposeAlternative(auth('partner')->user(), $open, $request->validated());
        } else {
            $partner = auth('partner')->user()->resolvedPartner();
            $this->bookingService->proposeAlternative($partner, $event, $request->validated());
        }

        return back()->with('success', 'تم إرسال الوقت البديل.');
    }

    /**
     * الطلب المفتوح (pending) لهذه الفعالية لدى المزوّد الحالي إن وُجد.
     */
    private function openProviderRequest(Event $event): ?EventProviderRequest
    {
        return EventProviderRequest::query()
            ->where('event_id', $event->id)
            ->where('partner_id', auth('partner')->user()->resolvedPartnerId())
            ->pending()
            ->first();
    }
}

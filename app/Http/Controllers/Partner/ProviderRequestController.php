<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Services\Provider\ProviderRequestService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * قائمة الطلبات وصفحة القرار — القناة المعتمدة الوحيدة للقبول والرفض
 * (H §11). ما يراه المزوّد: اسم المجتمع والشركة، عدد المشاركين، الفتحة
 * والوحدة، واسم وجوال منشئ الفعالية فقط — لا أسماء المشاركين إطلاقاً.
 */
class ProviderRequestController extends Controller
{
    public function __construct(private ProviderRequestService $requests) {}

    public function queue(Request $request): Response
    {
        $partner = $this->provider();

        $items = EventProviderRequest::query()
            ->where('partner_id', $partner->id)
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->with(['event.community', 'event.company', 'unit'])
            ->orderByRaw("case when status = 'pending' then 0 else 1 end")
            ->orderByDesc('sent_at')
            ->paginate(20)
            ->through(fn (EventProviderRequest $item) => $this->presentForProvider($item));

        return Inertia::render('partner/requests/queue', [
            'requests' => $items,
            'filters' => ['status' => $request->query('status')],
            'pendingCount' => EventProviderRequest::query()
                ->where('partner_id', $partner->id)
                ->pending()
                ->count(),
        ]);
    }

    public function decision(EventProviderRequest $providerRequest): Response
    {
        $this->ensureOwned($providerRequest);

        return Inertia::render('partner/requests/decision', [
            'request' => $this->presentForProvider($providerRequest->load(['event.community', 'event.company', 'event.creator', 'unit'])),
            'can_decide' => $providerRequest->isPending(),
        ]);
    }

    /**
     * فتح الرابط الموقّع أحادي الاستخدام (72 ساعة) — الرابط مؤشر لصفحة
     * القرار لا تجاوز للمصادقة: الدخول بحساب اللوحة مطلوب (middleware).
     */
    public function openLink(Request $request, string $token): RedirectResponse
    {
        $account = auth('partner')->user();

        $result = $this->requests->openSignedLink($token, $account);

        return match ($result['state']) {
            'used' => redirect()
                ->route('partner.provider-requests.decision', $result['request'])
                ->with('warning', 'هذا الرابط استُخدم من قبل — صفحة القرار متاحة من لوحتك.'),
            'expired_link' => redirect()
                ->route('partner.provider-requests.decision', $result['request'])
                ->with('warning', 'انتهت صلاحية الرابط (72 ساعة) — صفحة القرار متاحة من لوحتك.'),
            default => redirect()->route('partner.provider-requests.decision', $result['request']),
        };
    }

    public function accept(EventProviderRequest $providerRequest): RedirectResponse
    {
        $this->requests->accept(auth('partner')->user(), $providerRequest);

        return back()->with('success', 'قُبل الطلب وحُجزت الوحدة في تقويم المنصة.');
    }

    public function reject(Request $request, EventProviderRequest $providerRequest): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ], [
            'reason.required' => 'سبب الرفض مطلوب.',
        ]);

        $this->requests->reject(auth('partner')->user(), $providerRequest, $data['reason']);

        return back()->with('success', 'رُفض الطلب.');
    }

    public function proposeAlternative(Request $request, EventProviderRequest $providerRequest): RedirectResponse
    {
        $data = $request->validate([
            'proposed_date' => ['required', 'date', 'after_or_equal:today'],
            'proposed_start_time' => ['required', 'date_format:H:i'],
            'proposed_venues_count' => ['nullable', 'integer', 'min:1'],
            'proposed_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $this->requests->proposeAlternative(auth('partner')->user(), $providerRequest, $data);

        return back()->with('success', 'أُرسل اقتراح الوقت البديل لمنشئ الفعالية.');
    }

    /**
     * إلغاء بعد القبول — الأشد أثراً على الموثوقية (−15) وتُطبَّق سياسة
     * إلغاء المزوّد.
     */
    public function cancel(Request $request, EventProviderRequest $providerRequest): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'stale_availability' => ['nullable', 'boolean'],
        ], [
            'reason.required' => 'سبب الإلغاء مطلوب.',
        ]);

        $this->requests->cancelAccepted(
            auth('partner')->user(),
            $providerRequest,
            $data['reason'],
            (bool) ($data['stale_availability'] ?? false),
        );

        return back()->with('success', 'أُلغي الحجز — أُعيدت مساهمة المجتمع كاملة وانعكس الأثر على مؤشر الموثوقية.');
    }

    private function provider(): Partner
    {
        return auth('partner')->user()->resolvedPartner();
    }

    private function ensureOwned(EventProviderRequest $request): void
    {
        if ($request->partner_id !== $this->provider()->id) {
            throw (new ModelNotFoundException)->setModel(EventProviderRequest::class, [$request->id]);
        }
    }

    /**
     * حمولة صفحة المزوّد — خصوصية H §11: عدد المشاركين لا أسماؤهم، ومنشئ
     * الفعالية (اسم + جوال) كجهة الاتصال الوحيدة.
     *
     * @return array<string, mixed>
     */
    private function presentForProvider(EventProviderRequest $item): array
    {
        $event = $item->event;

        return [
            'id' => $item->id,
            'status' => $item->status,
            'requested_date' => $item->requested_date->format('Y-m-d'),
            'start_time' => substr((string) $item->start_time, 0, 5),
            'duration_minutes' => $item->duration_minutes,
            'quantity' => $item->quantity,
            'pricing_type' => $item->pricing_type,
            'frozen_participants_count' => $item->frozen_participants_count,
            'total_amount' => $item->total_amount,
            'sent_at' => $item->sent_at?->toIso8601String(),
            'deadline_at' => $item->deadline_at?->toIso8601String(),
            'responded_at' => $item->responded_at?->toIso8601String(),
            'late_response' => $item->late_response,
            'rejection_reason' => $item->rejection_reason,
            'cancellation_reason' => $item->cancellation_reason,
            'unit' => $item->unit?->only(['id', 'name', 'pricing_type']),
            'event' => $event === null ? null : [
                'id' => $event->id,
                'community_name' => $event->community?->name,
                'company_name' => $event->company?->name,
                'participants_count' => (int) $event->participants_count,
                'event_date' => $event->event_date?->format('Y-m-d'),
                'start_time' => substr((string) $event->start_time, 0, 5),
                'duration_minutes' => $event->duration_minutes,
                'status' => $event->status,
                // جهة الاتصال الوحيدة: منشئ الفعالية
                'creator_name' => $event->creator?->name,
                'creator_phone' => $event->creator?->phone,
            ],
        ];
    }
}

<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CommunityRequest;
use App\Services\CommunityRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityRequestController extends Controller
{
    public function __construct(
        private CommunityRequestService $communityRequestService,
    ) {}

    /**
     * List all community requests for the company.
     */
    public function index(Request $request): Response
    {
        $company = auth('company')->user();

        // H §18 — بحث + فلترة + ترتيب + ترقيم. الفلترة انتقلت إلى الخادم لأن
        // تصفية الصفحة الحالية وحدها بعد الترقيم تعطي نتيجة كاذبة. قيمة
        // `sort` مفتاح من قائمة بيضاء في `ListSort` لا اسم عمود.
        $filters = $request->validate([
            'status' => ['sometimes', 'nullable', 'string', 'in:pending,approved,rejected'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ], [
            'status.in' => 'حالة الطلب غير صالحة.',
            'search.max' => 'نص البحث يجب ألا يتجاوز 255 حرفاً.',
        ]);

        $requests = $this->communityRequestService->listForCompany($company, $filters);

        $pendingCount = CommunityRequest::where('company_id', $company->id)
            ->where('status', 'pending')
            ->count();

        return Inertia::render('company/community-requests/index', [
            'requests' => $requests,
            'filters' => (object) $filters,
            'sort' => CommunityRequestService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'pendingCommunityRequests' => $pendingCount,
        ]);
    }

    /**
     * Approve a community request.
     */
    public function approve(CommunityRequest $communityRequest): RedirectResponse
    {
        $company = auth('company')->user();

        $this->communityRequestService->approve($company, $communityRequest);

        return back()->with('success', 'تمت الموافقة على الطلب وتم إنشاء المجتمع بنجاح.');
    }

    /**
     * Reject a community request.
     */
    public function reject(Request $request, CommunityRequest $communityRequest): RedirectResponse
    {
        $company = auth('company')->user();

        $data = $request->validate([
            'rejection_reason' => ['sometimes', 'string', 'max:1000'],
        ], [
            'rejection_reason.max' => 'سبب الرفض يجب ألا يتجاوز 1000 حرف.',
        ]);

        $this->communityRequestService->reject($company, $communityRequest, $data['rejection_reason'] ?? null);

        return back()->with('success', 'تم رفض الطلب.');
    }
}

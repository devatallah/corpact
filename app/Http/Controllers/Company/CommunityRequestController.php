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
    public function index(): Response
    {
        $company = auth('company')->user();

        $requests = $this->communityRequestService->listForCompany($company);

        $pendingCount = CommunityRequest::where('company_id', $company->id)
            ->where('status', 'pending')
            ->count();

        return Inertia::render('company/community-requests/index', [
            'requests' => $requests,
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

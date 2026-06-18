<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreCommunityRequestRequest;
use App\Services\CommunityRequestService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CommunityRequestController extends Controller
{
    public function __construct(
        private CommunityRequestService $communityRequestService,
    ) {}

    /**
     * Show the community request form and list of employee's requests.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $requests = $this->communityRequestService->listForEmployee($employee);

        return Inertia::render('employee/community-requests/index', [
            'requests' => $requests,
            'categories' => \App\Models\Category::whereNull('parent_id')
                ->with('children:id,parent_id,name,icon')
                ->select('id', 'parent_id', 'name', 'icon')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Store a new community creation request.
     */
    public function store(StoreCommunityRequestRequest $request): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validated();

        $this->communityRequestService->submit($employee, $data);

        return back()->with('success', 'تم إرسال طلب إنشاء المجتمع بنجاح.');
    }
}

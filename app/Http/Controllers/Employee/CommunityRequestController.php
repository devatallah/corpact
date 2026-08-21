<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreCommunityRequestRequest;
use App\Models\Category;
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
     * Show the community request form and list of employee's requests.
     */
    public function index(Request $request): Response
    {
        $employee = auth('employee')->user();

        // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort` لا اسم
        // عمود؛ التحقق هنا يمنع الحشو فقط.
        $filters = $request->validate([
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $requests = $this->communityRequestService->listForEmployee($employee, $filters);

        return Inertia::render('employee/community-requests/index', [
            'requests' => $requests,
            // العدّاد على مستوى القائمة كلها لا الصفحة الحالية.
            'pendingCount' => CommunityRequest::query()
                ->where('employee_id', $employee->id)
                ->where('status', 'pending')
                ->count(),
            'sort' => CommunityRequestService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'categories' => Category::whereNull('parent_id')
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

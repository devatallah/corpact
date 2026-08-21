<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Services\Employee\ExploreService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __construct(
        private ExploreService $exploreService,
    ) {}

    /**
     * List available communities and partners to explore.
     */
    public function index(Request $request): Response
    {
        $employee = auth('employee')->user();

        // H §18 — بحث + ترتيب + ترقيم. قيمة `sort` مفتاح من قائمة بيضاء في
        // `ListSort` لا اسم عمود؛ التحقق هنا يمنع الحشو فقط.
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        return Inertia::render('employee/explore/index', [
            'communities' => $this->exploreService->availableCommunities($employee, $filters),
            'filters' => $filters,
            'sort' => ExploreService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    /**
     * Show details for a specific partner.
     */
    public function show(Partner $partner): Response
    {
        return Inertia::render('employee/explore/show', [
            'partner' => $partner->load(['venues', 'categories']),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexBusinessRequest;
use App\Http\Requests\Admin\StoreBusinessRequest;
use App\Http\Requests\Admin\UpdateBusinessRequest;
use App\Models\Business;
use App\Services\Admin\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(
        private BusinessService $businessService,
    ) {}

    /**
     * List businesss with optional filters.
     */
    public function index(IndexBusinessRequest $request): Response
    {
        $filters = $request->validated();

        $businesss = $this->businessService->list($filters);
        $stats = $this->businessService->dashboardStats();

        return Inertia::render('admin/businesses/index', [
            'businesses' => $businesss,
            'stats' => $stats,
            'filters' => $filters,
            'categories' => \App\Models\Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new business.
     */
    public function create(): Response
    {
        return Inertia::render('admin/businesses/create');
    }

    /**
     * Store a newly created business.
     */
    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        Gate::authorize('create', Business::class);

        $data = $request->validated();
        $data['status'] = 'active';
        $categoryIds = $data['category_ids'] ?? [];
        unset($data['category_ids']);

        $business = Business::create($data);
        $business->categories()->sync($categoryIds);

        return redirect()->route('admin.businesses.index')
            ->with('success', 'تم إنشاء المنشأة بنجاح.');
    }

    /**
     * Show the form for editing the specified business.
     */
    public function edit(Business $business): Response
    {
        return Inertia::render('admin/businesses/edit', [
            'business' => $business,
        ]);
    }

    /**
     * Update the specified business.
     */
    public function update(UpdateBusinessRequest $request, Business $business): RedirectResponse
    {
        Gate::authorize('update', $business);

        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $categoryIds = $data['category_ids'] ?? null;
        unset($data['category_ids']);

        $business->update($data);

        if ($categoryIds !== null) {
            $business->categories()->sync($categoryIds);
        }

        return back()->with('success', 'تم تحديث المنشأة بنجاح.');
    }

    /**
     * Approve a pending business.
     */
    public function approve(Request $request, Business $business): RedirectResponse
    {
        $validated = $request->validate([
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ], [
            'commission_rate.required' => 'نسبة العمولة مطلوبة.',
            'commission_rate.numeric' => 'نسبة العمولة يجب أن تكون رقما.',
            'commission_rate.min' => 'نسبة العمولة يجب أن تكون 0 على الأقل.',
            'commission_rate.max' => 'نسبة العمولة يجب ألا تتجاوز 100.',
        ]);

        $this->businessService->approve($business, (float) $validated['commission_rate']);

        return back()->with('success', 'تمت الموافقة على المنشأة بنجاح.');
    }

    /**
     * Reject a pending business.
     */
    public function reject(Business $business): RedirectResponse
    {
        $this->businessService->reject($business);

        return back()->with('success', 'تم رفض طلب المنشأة.');
    }

    /**
     * Send a password reset link to the business.
     */
    public function sendResetPassword(Business $business): RedirectResponse
    {
        $status = Password::broker('businesses')->sendResetLink(
            ['email' => $business->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.')
            : back()->with('error', 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    }

    /**
     * Remove the specified business.
     */
    public function destroy(Business $business): RedirectResponse
    {
        Gate::authorize('delete', $business);

        $business->delete();

        return redirect()->route('admin.businesses.index')
            ->with('success', 'تم حذف المنشأة بنجاح.');
    }
}

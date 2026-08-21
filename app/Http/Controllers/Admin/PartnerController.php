<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexPartnerRequest;
use App\Http\Requests\Admin\StorePartnerRequest;
use App\Http\Requests\Admin\UpdatePartnerRequest;
use App\Models\Category;
use App\Models\Partner;
use App\Services\Admin\PartnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function __construct(
        private PartnerService $partnerService,
    ) {}

    /**
     * List partners with optional filters.
     */
    public function index(IndexPartnerRequest $request): Response
    {
        $filters = $request->validated();

        $partners = $this->partnerService->list($filters);
        $stats = $this->partnerService->dashboardStats();

        return Inertia::render('admin/partners/index', [
            'partners' => $partners,
            'stats' => $stats,
            'filters' => $filters,
            'sort' => PartnerService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'categories' => Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new partner.
     */
    public function create(): Response
    {
        return Inertia::render('admin/partners/create');
    }

    /**
     * Store a newly created partner.
     */
    public function store(StorePartnerRequest $request): RedirectResponse
    {
        Gate::authorize('create', Partner::class);

        $data = $request->validated();
        $data['status'] = 'active';
        $categoryIds = $data['category_ids'] ?? [];
        unset($data['category_ids']);

        $partner = Partner::create($data);
        $partner->categories()->sync($categoryIds);

        return redirect()->route('admin.partners.index')
            ->with('success', 'تم إنشاء الشريك بنجاح.');
    }

    /**
     * Show the form for editing the specified partner.
     */
    public function edit(Partner $partner): Response
    {
        return Inertia::render('admin/partners/edit', [
            'partner' => $partner,
        ]);
    }

    /**
     * Update the specified partner.
     */
    public function update(UpdatePartnerRequest $request, Partner $partner): RedirectResponse
    {
        Gate::authorize('update', $partner);

        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $categoryIds = $data['category_ids'] ?? null;
        unset($data['category_ids']);

        $partner->update($data);

        if ($categoryIds !== null) {
            $partner->categories()->sync($categoryIds);
        }

        return back()->with('success', 'تم تحديث الشريك بنجاح.');
    }

    /**
     * Approve a pending partner.
     */
    public function approve(Request $request, Partner $partner): RedirectResponse
    {
        $validated = $request->validate([
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ], [
            'commission_rate.required' => 'نسبة العمولة مطلوبة.',
            'commission_rate.numeric' => 'نسبة العمولة يجب أن تكون رقما.',
            'commission_rate.min' => 'نسبة العمولة يجب أن تكون 0 على الأقل.',
            'commission_rate.max' => 'نسبة العمولة يجب ألا تتجاوز 100.',
        ]);

        $this->partnerService->approve($partner, (float) $validated['commission_rate']);

        return back()->with('success', 'تمت الموافقة على الشريك بنجاح.');
    }

    /**
     * Reject a pending partner.
     */
    public function reject(Partner $partner): RedirectResponse
    {
        $this->partnerService->reject($partner);

        return back()->with('success', 'تم رفض طلب الشريك.');
    }

    /**
     * Send a password reset link to the partner.
     */
    public function sendResetPassword(Partner $partner): RedirectResponse
    {
        $status = Password::broker('partners')->sendResetLink(
            ['email' => $partner->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.')
            : back()->with('error', 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    }

    /**
     * Remove the specified partner.
     */
    public function destroy(Partner $partner): RedirectResponse
    {
        Gate::authorize('delete', $partner);

        $partner->delete();

        return redirect()->route('admin.partners.index')
            ->with('success', 'تم حذف الشريك بنجاح.');
    }
}

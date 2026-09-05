<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\StoreDiscountRequest;
use App\Http\Requests\Partner\UpdateDiscountRequest;
use App\Models\Discount;
use App\Services\Partner\DiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A17 — لوحة تخفيضات المزوّد.
 */
class DiscountController extends Controller
{
    public function __construct(
        private DiscountService $discounts,
    ) {}

    /**
     * H §18 — بحث + تصفية + ترتيب + ترقيم 20.
     */
    public function index(Request $request): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'in:active,expired'],
            'company_id' => ['sometimes', 'nullable', 'integer', 'exists:companies,id'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        return Inertia::render('partner/discounts/index', [
            'partner' => $partner,
            'discounts' => $this->discounts->listForPartner($partner, $filters),
            'filters' => (object) $filters,
            'sort' => DiscountService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'companies' => $this->discounts->companies(),
        ]);
    }

    /**
     * مجتمعات شركة — يملأ المنتقي الثاني في نموذج الإنشاء.
     */
    public function communities(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
        ]);

        return response()->json([
            'communities' => $this->discounts->communitiesFor((int) $data['company_id']),
        ]);
    }

    public function store(StoreDiscountRequest $request): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $this->discounts->create($partner, $request->validated());

        return back()->with('success', 'أُضيف التخفيض — يظهر لمنشئ الفعالية في ذلك المجتمع.');
    }

    public function update(UpdateDiscountRequest $request, Discount $discount): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $this->discounts->update($partner, $discount, $request->validated());

        return back()->with('success', 'عُدّل التخفيض — لا أثر على فعاليات أُنشئت قبل الآن.');
    }

    public function destroy(Discount $discount): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $this->discounts->delete($partner, $discount);

        return back()->with('success', 'حُذف التخفيض.');
    }
}

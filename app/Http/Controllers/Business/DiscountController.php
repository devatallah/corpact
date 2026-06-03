<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\StoreDiscountRequest;
use App\Http\Requests\Business\UpdateDiscountRequest;
use App\Models\Discount;
use App\Services\Business\DiscountService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function __construct(
        private DiscountService $discountService,
    ) {}

    /**
     * List discounts for the authenticated business.
     */
    public function index(): Response
    {
        $business = auth('business')->user();

        return Inertia::render('business/discounts/index', [
            'discounts' => $this->discountService->listForbusiness($business),
            'companies' => $this->discountService->getCompanies(),
        ]);
    }

    /**
     * Get communities for a company (JSON endpoint for dynamic select).
     */
    public function communities(int $companyId): \Illuminate\Http\JsonResponse
    {
        return response()->json(
            $this->discountService->getCommunitiesForCompany($companyId)
        );
    }

    /**
     * Store a new discount.
     */
    public function store(StoreDiscountRequest $request): RedirectResponse
    {
        $business = auth('business')->user();

        $this->discountService->create($business, $request->validated());

        return redirect()->route('business.discounts.index')
            ->with('success', 'تم إنشاء الخصم بنجاح.');
    }

    /**
     * Update the specified discount.
     */
    public function update(UpdateDiscountRequest $request, Discount $discount): RedirectResponse
    {
        $business = auth('business')->user();

        $this->discountService->update($business, $discount, $request->validated());

        return back()->with('success', 'تم تحديث الخصم بنجاح.');
    }

    /**
     * Remove the specified discount.
     */
    public function destroy(Discount $discount): RedirectResponse
    {
        $business = auth('business')->user();

        $this->discountService->delete($business, $discount);

        return redirect()->route('business.discounts.index')
            ->with('success', 'تم حذف الخصم بنجاح.');
    }
}

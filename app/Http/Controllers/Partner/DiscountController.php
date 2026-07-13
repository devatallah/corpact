<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\StoreDiscountRequest;
use App\Http\Requests\Partner\UpdateDiscountRequest;
use App\Models\Discount;
use App\Services\Partner\DiscountService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function __construct(
        private DiscountService $discountService,
    ) {}

    /**
     * List discounts for the authenticated partner.
     */
    public function index(): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();

        return Inertia::render('partner/discounts/index', [
            'discounts' => $this->discountService->listForpartner($partner),
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
        $partner = auth('partner')->user()->resolvedPartner();

        $this->discountService->create($partner, $request->validated());

        return redirect()->route('partner.discounts.index')
            ->with('success', 'تم إنشاء الخصم بنجاح.');
    }

    /**
     * Update the specified discount.
     */
    public function update(UpdateDiscountRequest $request, Discount $discount): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $this->discountService->update($partner, $discount, $request->validated());

        return back()->with('success', 'تم تحديث الخصم بنجاح.');
    }

    /**
     * Remove the specified discount.
     */
    public function destroy(Discount $discount): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $this->discountService->delete($partner, $discount);

        return redirect()->route('partner.discounts.index')
            ->with('success', 'تم حذف الخصم بنجاح.');
    }
}

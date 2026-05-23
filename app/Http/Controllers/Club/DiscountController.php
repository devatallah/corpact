<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Http\Requests\Club\StoreDiscountRequest;
use App\Http\Requests\Club\UpdateDiscountRequest;
use App\Models\Discount;
use App\Services\Club\DiscountService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function __construct(
        private DiscountService $discountService,
    ) {}

    /**
     * List discounts for the authenticated club.
     */
    public function index(): Response
    {
        $club = auth('club')->user();

        return Inertia::render('club/discounts/index', [
            'discounts' => $this->discountService->listForClub($club),
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
        $club = auth('club')->user();

        $this->discountService->create($club, $request->validated());

        return redirect()->route('club.discounts.index')
            ->with('success', 'تم إنشاء الخصم بنجاح.');
    }

    /**
     * Update the specified discount.
     */
    public function update(UpdateDiscountRequest $request, Discount $discount): RedirectResponse
    {
        $club = auth('club')->user();

        $this->discountService->update($club, $discount, $request->validated());

        return back()->with('success', 'تم تحديث الخصم بنجاح.');
    }

    /**
     * Remove the specified discount.
     */
    public function destroy(Discount $discount): RedirectResponse
    {
        $club = auth('club')->user();

        $this->discountService->delete($club, $discount);

        return redirect()->route('club.discounts.index')
            ->with('success', 'تم حذف الخصم بنجاح.');
    }
}

<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\StoreVenueRequest;
use App\Http\Requests\Business\UpdateVenueRequest;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Business\VenueService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    public function __construct(
        private VenueService $venueService,
    ) {}

    /**
     * List venues for the authenticated business.
     */
    public function index(): Response
    {
        $business = auth('business')->user();

        return Inertia::render('business/venues/index', [
            'business' => $business,
            'venues' => $this->venueService->listForbusiness($business),
            'categories' => \App\Models\Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new venue.
     */
    public function create(): Response
    {
        return Inertia::render('business/venues/create', [
            'categories' => \App\Models\Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new venue.
     */
    public function store(StoreVenueRequest $request): RedirectResponse
    {
        Gate::authorize('create', Venue::class);

        $business = auth('business')->user();

        $data = $request->validated();

        $this->venueService->create($business, $data);

        return redirect()->route('business.venues.index')
            ->with('success', 'تم إنشاء الملعب بنجاح.');
    }

    /**
     * Show the form for editing the specified venue.
     */
    public function edit(Venue $venue): Response
    {
        return Inertia::render('business/venues/edit', [
            'venue' => $venue->load(['category.parent', 'pricings']),
            'categories' => \App\Models\Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified venue.
     */
    public function update(UpdateVenueRequest $request, Venue $venue): RedirectResponse
    {
        Gate::authorize('update', $venue);

        $business = auth('business')->user();
        $data = $request->validated();

        $this->venueService->update($business, $venue, $data);

        return back()->with('success', 'تم تحديث الملعب بنجاح.');
    }

    /**
     * Remove the specified venue.
     */
    public function destroy(Venue $venue): RedirectResponse
    {
        Gate::authorize('delete', $venue);

        $business = auth('business')->user();

        $this->venueService->delete($business, $venue);

        return redirect()->route('business.venues.index')
            ->with('success', 'تم حذف الملعب بنجاح.');
    }

    /**
     * Add a pricing to a venue.
     */
    public function storePricing(Request $request, Venue $venue): RedirectResponse
    {
        $business = auth('business')->user();

        $data = $request->validate([
            'duration_minutes' => ['required', 'integer', 'in:60,90,120'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_peak' => ['sometimes'],
            'label' => ['nullable', 'string', 'max:255'],
            'start_time' => ['nullable'],
            'end_time' => ['nullable'],
            'days' => ['nullable', 'array'],
            'days.*' => ['integer', 'min:0', 'max:6'],
        ]);

        $this->venueService->addPricing($business, $venue, $data);

        return back()->with('success', 'تم إضافة السعر بنجاح.');
    }

    /**
     * Update a pricing.
     */
    public function updatePricing(Request $request, Venue $venue, VenuePricing $pricing): RedirectResponse
    {
        $business = auth('business')->user();

        $data = $request->validate([
            'duration_minutes' => ['required', 'integer', 'in:60,90,120'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_peak' => ['sometimes'],
            'label' => ['nullable', 'string', 'max:255'],
            'start_time' => ['nullable'],
            'end_time' => ['nullable'],
            'days' => ['nullable', 'array'],
            'days.*' => ['integer', 'min:0', 'max:6'],
        ]);

        $this->venueService->updatePricing($business, $venue, $pricing, $data);

        return back()->with('success', 'تم تحديث السعر بنجاح.');
    }

    /**
     * Toggle a pricing active/inactive.
     */
    public function togglePricing(Venue $venue, VenuePricing $pricing): RedirectResponse
    {
        $business = auth('business')->user();
        $this->venueService->ensureOwnership($business, $venue, $pricing);

        $newStatus = $pricing->status === 'active' ? 'inactive' : 'active';
        $pricing->update(['status' => $newStatus]);

        // Auto-manage venue status based on active pricings
        $hasActivePricings = $venue->pricings()->where('status', 'active')->exists();
        $venue->update(['status' => $hasActivePricings ? 'active' : 'closed']);

        return back()->with('success', $newStatus === 'active' ? 'تم تفعيل السعر.' : 'تم تعطيل السعر.');
    }

    /**
     * Delete a pricing.
     */
    public function destroyPricing(Venue $venue, VenuePricing $pricing): RedirectResponse
    {
        $business = auth('business')->user();

        $this->venueService->deletePricing($business, $venue, $pricing);

        return back()->with('success', 'تم حذف السعر بنجاح.');
    }
}

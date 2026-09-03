<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\StoreVenueRequest;
use App\Http\Requests\Partner\UpdateVenueRequest;
use App\Models\Category;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Partner\VenueService;
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
     * List venues for the authenticated partner.
     *
     * H §18 — بحث + ترتيب + ترقيم 20. الاستعلام يبقى في الخدمة كبقية
     * البوابة؛ قيمة `sort` مفتاح من قائمة بيضاء في `ListSort` لا اسم عمود،
     * والتحقق هنا يمنع الحشو فقط.
     */
    public function index(Request $request): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        return Inertia::render('partner/venues/index', [
            'partner' => $partner,
            'venues' => $this->venueService->listForpartner($partner, $filters),
            'filters' => (object) $filters,
            'sort' => VenueService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'categories' => Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new venue.
     */
    public function create(): Response
    {
        return Inertia::render('partner/venues/create', [
            'categories' => Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new venue.
     */
    public function store(StoreVenueRequest $request): RedirectResponse
    {
        Gate::authorize('create', Venue::class);

        $partner = auth('partner')->user()->resolvedPartner();

        $data = $request->validated();

        $this->venueService->create($partner, $data);

        return redirect()->route('partner.venues.index')
            ->with('success', 'تم إنشاء الملعب بنجاح.');
    }

    /**
     * Show the form for editing the specified venue.
     */
    public function edit(Venue $venue): Response
    {
        return Inertia::render('partner/venues/edit', [
            'venue' => $venue->load(['category.parent', 'pricings']),
            'categories' => Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified venue.
     */
    public function update(UpdateVenueRequest $request, Venue $venue): RedirectResponse
    {
        Gate::authorize('update', $venue);

        $partner = auth('partner')->user()->resolvedPartner();
        $data = $request->validated();

        $this->venueService->update($partner, $venue, $data);

        return back()->with('success', 'تم تحديث الملعب بنجاح.');
    }

    /**
     * Remove the specified venue.
     */
    public function destroy(Venue $venue): RedirectResponse
    {
        Gate::authorize('delete', $venue);

        $partner = auth('partner')->user()->resolvedPartner();

        $this->venueService->delete($partner, $venue);

        return redirect()->route('partner.venues.index')
            ->with('success', 'تم حذف الملعب بنجاح.');
    }

    /**
     * Add a pricing to a venue.
     */
    public function storePricing(Request $request, Venue $venue): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

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

        $this->venueService->addPricing($partner, $venue, $data);

        return back()->with('success', 'تم إضافة السعر بنجاح.');
    }

    /**
     * Update a pricing.
     */
    public function updatePricing(Request $request, Venue $venue, VenuePricing $pricing): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();

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

        $this->venueService->updatePricing($partner, $venue, $pricing, $data);

        return back()->with('success', 'تم تحديث السعر بنجاح.');
    }

    /**
     * Toggle a pricing active/inactive.
     */
    public function togglePricing(Venue $venue, VenuePricing $pricing): RedirectResponse
    {
        $partner = auth('partner')->user()->resolvedPartner();
        $this->venueService->ensureOwnership($partner, $venue, $pricing);

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
        $partner = auth('partner')->user()->resolvedPartner();

        $this->venueService->deletePricing($partner, $venue, $pricing);

        return back()->with('success', 'تم حذف السعر بنجاح.');
    }
}

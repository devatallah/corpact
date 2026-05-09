<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Http\Requests\Club\StoreCourtRequest;
use App\Http\Requests\Club\UpdateCourtRequest;
use App\Models\Court;
use App\Services\Club\CourtService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CourtController extends Controller
{
    public function __construct(
        private CourtService $courtService,
    ) {}

    /**
     * List courts for the authenticated club.
     */
    public function index(): Response
    {
        $club = auth('club')->user();

        return Inertia::render('club/courts/index', [
            'club' => $club,
            'courts' => $this->courtService->listForClub($club),
            'sports' => \App\Models\Sport::orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new court.
     */
    public function create(): Response
    {
        return Inertia::render('club/courts/create', [
            'sports' => \App\Models\Sport::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new court.
     */
    public function store(StoreCourtRequest $request): RedirectResponse
    {
        Gate::authorize('create', Court::class);

        $club = auth('club')->user();

        $data = $request->validated();

        $this->courtService->create($club, $data);

        return redirect()->route('club.courts.index')
            ->with('success', 'تم إنشاء الملعب بنجاح.');
    }

    /**
     * Show the form for editing the specified court.
     */
    public function edit(Court $court): Response
    {
        return Inertia::render('club/courts/edit', [
            'court' => $court->load(['sport', 'pricings']),
            'sports' => \App\Models\Sport::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified court.
     */
    public function update(UpdateCourtRequest $request, Court $court): RedirectResponse
    {
        Gate::authorize('update', $court);

        $club = auth('club')->user();
        $data = $request->validated();

        $this->courtService->update($club, $court, $data);

        return back()->with('success', 'تم تحديث الملعب بنجاح.');
    }

    /**
     * Remove the specified court.
     */
    public function destroy(Court $court): RedirectResponse
    {
        Gate::authorize('delete', $court);

        $club = auth('club')->user();

        $this->courtService->delete($club, $court);

        return redirect()->route('club.courts.index')
            ->with('success', 'تم حذف الملعب بنجاح.');
    }
}

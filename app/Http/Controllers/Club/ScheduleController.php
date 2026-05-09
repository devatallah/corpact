<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Http\Requests\Club\IndexScheduleRequest;
use App\Http\Requests\Club\StoreScheduleRequest;
use App\Http\Requests\Club\UpdateScheduleRequest;
use App\Models\Slot;
use App\Services\Club\ScheduleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function __construct(
        private ScheduleService $scheduleService,
    ) {}

    /**
     * Show the schedule calendar view.
     */
    public function index(IndexScheduleRequest $request): Response
    {
        $club = auth('club')->user();

        $validated = $request->validated();

        $date = $validated['date'] ?? now()->toDateString();

        $schedule = $this->scheduleService->getScheduleGrid($club, $date);

        return Inertia::render('club/schedule/index', [
            'club' => $club,
            'schedule' => $schedule,
            'date' => $date,
        ]);
    }

    /**
     * Store a new schedule slot.
     */
    public function store(StoreScheduleRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Slot::create($data);

        return back()->with('success', 'تم إنشاء الفترة الزمنية بنجاح.');
    }

    /**
     * Update the specified schedule slot.
     */
    public function update(UpdateScheduleRequest $request, Slot $slot): RedirectResponse
    {
        $data = $request->validated();

        $slot->update($data);

        return back()->with('success', 'تم تحديث الفترة الزمنية بنجاح.');
    }

    /**
     * Remove the specified schedule slot.
     */
    public function destroy(Slot $slot): RedirectResponse
    {
        $slot->delete();

        return back()->with('success', 'تم حذف الفترة الزمنية بنجاح.');
    }
}

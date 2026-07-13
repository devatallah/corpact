<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\IndexScheduleRequest;
use App\Http\Requests\Partner\StoreScheduleRequest;
use App\Http\Requests\Partner\UpdateScheduleRequest;
use App\Models\Slot;
use App\Services\Partner\ScheduleService;
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
        $partner = auth('partner')->user()->resolvedPartner();

        $validated = $request->validated();

        $date = $validated['date'] ?? now()->toDateString();

        $schedule = $this->scheduleService->getScheduleGrid($partner, $date);

        return Inertia::render('partner/schedule/index', [
            'partner' => $partner,
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

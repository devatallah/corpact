<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Services\Employee\HomeService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private HomeService $homeService,
    ) {}

    /**
     * Show the employee home page.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $events = $this->homeService->upcomingEvents($employee);

        $joinedEventIds = $employee->events()
            ->whereIn('events.id', $events->pluck('id'))
            ->wherePivot('status', 'joined')
            ->pluck('events.id')
            ->all();

        return Inertia::render('employee/home', [
            'employee' => $employee,
            'communities' => $this->homeService->myCommunities($employee),
            'events' => $events,
            'joinedEventIds' => $joinedEventIds,
        ]);
    }
}

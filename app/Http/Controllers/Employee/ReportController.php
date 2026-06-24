<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Services\Employee\EmployeeReportService;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private EmployeeReportService $reportService,
    ) {}

    public function index(): Response
    {
        $employee = auth('employee')->user();
        $filter = request('category');

        return Inertia::render('employee/reports/index', [
            'employee' => $employee,
            'activityLog' => $this->reportService->activityLog($employee, $filter),
            'myStats' => $this->reportService->myStats($employee),
            'budget' => $this->reportService->budget($employee),
            'categories' => $this->reportService->availableCategories($employee),
            'currentFilter' => $filter,
        ]);
    }
}

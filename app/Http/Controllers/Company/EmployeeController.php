<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\IndexEmployeeRequest;
use App\Http\Requests\Company\StoreEmployeeRequest;
use App\Http\Requests\Company\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Services\Company\CompanyEmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function __construct(
        private CompanyEmployeeService $employeeService,
    ) {}

    /**
     * List employees for the authenticated company.
     */
    public function index(IndexEmployeeRequest $request): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $filters = $request->validated();

        $employees = $this->employeeService->list($company, $filters);
        $employees->load('communities.sport');
        $employees->loadCount('events');

        $activeCount = Employee::where('company_id', $company->id)->where('status', 'active')->count();
        $totalCount = Employee::where('company_id', $company->id)->count();

        return Inertia::render('company/employees/index', [
            'company' => $company,
            'employees' => $employees,
            'filters' => $filters,
            'activeCount' => $activeCount,
            'totalCount' => $totalCount,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Show the form for inviting a new employee.
     */
    public function create(): Response
    {
        return Inertia::render('company/employees/create');
    }

    /**
     * Send an invitation to an employee.
     */
    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        Gate::authorize('create', Employee::class);

        $company = auth('company')->user();

        $data = $request->validated();

        $hrEmployee = \App\Models\Employee::where('email', $company->email)
            ->where('company_id', $company->id)
            ->first();

        $this->employeeService->invite($company, $hrEmployee, $data['email']);

        return redirect()->route('company.employees.index')
            ->with('success', 'تم إرسال الدعوة بنجاح.');
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function edit(Employee $employee): Response
    {
        return Inertia::render('company/employees/edit', [
            'employee' => $employee,
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        Gate::authorize('update', $employee);

        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $employee->update($data);

        return back()->with('success', 'تم تحديث الموظف بنجاح.');
    }

    /**
     * Search employees by name for autocomplete.
     */
    public function search(Request $request): JsonResponse
    {
        $company = auth('company')->user();
        $query = $request->input('q', '');

        $employees = Employee::where('company_id', $company->id)
            ->active()
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json($employees);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        Gate::authorize('delete', $employee);

        $employee->delete();

        return redirect()->route('company.employees.index')
            ->with('success', 'تم إزالة الموظف بنجاح.');
    }
}

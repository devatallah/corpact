<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexEmployeeRequest;
use App\Http\Requests\Admin\StoreEmployeeRequest;
use App\Http\Requests\Admin\UpdateEmployeeRequest;
use App\Models\Company;
use App\Models\Employee;
use App\Services\Admin\AdminEmployeeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function __construct(
        private AdminEmployeeService $employeeService,
    ) {}

    /**
     * List all employees across companies.
     */
    public function index(IndexEmployeeRequest $request): Response
    {
        $filters = $request->validated();

        $employees = $this->employeeService->list($filters);
        $totalEmployees = Employee::count();
        $companies = Company::active()->orderBy('name')->get(['id', 'name']);

        $departments = \App\Models\Department::orderBy('name')->get(['id', 'name', 'company_id']);

        return Inertia::render('admin/employees/index', [
            'employees' => $employees,
            'totalEmployees' => $totalEmployees,
            'companies' => $companies,
            'departments' => $departments,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function create(): Response
    {
        $companies = Company::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/employees/create', [
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        Gate::authorize('create', Employee::class);

        $data = $request->validated();

        Employee::create($data);

        return redirect()->route('admin.employees.index')
            ->with('success', 'تم إنشاء الموظف بنجاح.');
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function edit(Employee $employee): Response
    {
        $companies = Company::active()->orderBy('name')->get(['id', 'name']);

        $departments = \App\Models\Department::orderBy('company_id')->orderBy('name')->get(['id', 'name', 'company_id']);

        return Inertia::render('admin/employees/edit', [
            'employee' => $employee->load(['company']),
            'companies' => $companies,
            'departments' => $departments,
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
     * Send a password reset link to the employee.
     */
    public function sendResetPassword(Employee $employee): RedirectResponse
    {
        $status = Password::broker('employees')->sendResetLink(
            ['email' => $employee->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.')
            : back()->with('error', 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        Gate::authorize('delete', $employee);

        $employee->delete();

        return redirect()->route('admin.employees.index')
            ->with('success', 'تم حذف الموظف بنجاح.');
    }
}

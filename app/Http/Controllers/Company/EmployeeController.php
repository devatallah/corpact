<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Enums\Role;
use App\Http\Requests\Company\IndexEmployeeRequest;
use App\Http\Requests\Company\StoreEmployeeRequest;
use App\Http\Requests\Company\UpdateEmployeeRequest;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\Notification;
use App\Models\RoleAssignment;
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
        $unreadNotifications = Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $filters = $request->validated();

        $employees = $this->employeeService->list($company, $filters);
        $employees->load(['communities.category', 'department']);
        $employees->loadCount('events');

        $activeCount = Employee::where('company_id', $company->id)->where('status', 'active')->count();
        $totalCount = Employee::where('company_id', $company->id)->count();

        // العدّاد بجانب اسم كل إدارة في المُنتقي — يوفّر فتح القائمة لمعرفة
        // أيّها فارغة.
        $departments = Department::where('company_id', $company->id)
            ->withCount('employees')
            ->orderBy('name')
            ->get(['id', 'name']);

        // الدعوة لا تُنشئ صف موظف — تُنشئ دعوة. من دُعي ولم يفعّل حسابه بعد
        // ليس في هذا الجدول إطلاقاً، فيبدو لمسؤول الحساب أن دعوته ضاعت.
        // الشاشة اسمها «الموظفون والدعوات» لأنها سجل واحد للاثنين معاً.
        $pendingInvitations = Invitation::query()
            ->where('company_id', $company->id)
            ->whereIn('status', ['pending', 'expired'])
            ->with('department:id,name')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'email', 'name', 'phone', 'employee_number', 'department_id', 'status', 'expires_at', 'send_count', 'last_sent_at']);

        // «قائد مجتمع» يغيّر ما يستطيع الموظف فعله، فيُعرض بجانب اسمه بدل أن
        // يُكتشف من صفحة المجتمع.
        $leaderEmployeeIds = RoleAssignment::query()
            ->where('role', Role::CommunityLeader->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
            ->whereIn('user_id', $employees->pluck('user_id')->filter())
            ->pluck('user_id')
            ->unique();

        $leaderIds = $employees
            ->filter(fn (Employee $employee) => $employee->user_id !== null && $leaderEmployeeIds->contains($employee->user_id))
            ->pluck('id')
            ->values();

        return Inertia::render('company/employees/index', [
            'company' => $company,
            'employees' => $employees,
            'departments' => $departments,
            'pendingInvitations' => $pendingInvitations,
            'leaderIds' => $leaderIds,
            'filters' => (object) $filters,
            'sort' => CompanyEmployeeService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
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

        $hrEmployee = Employee::where('email', $company->email)
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
        $company = auth('company')->user();
        $departments = Department::where('company_id', $company->id)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('company/employees/edit', [
            'employee' => $employee->load('department'),
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
     * Departure (H §5): deactivate — never delete. The observer cascade
     * revokes sessions, removes community leaderships (with AM alert) and
     * cancels unconfirmed participations; historical data stays intact and
     * the membership keeps its `left_at` stamp for the cycle invoice.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        Gate::authorize('delete', $employee);

        if ($employee->status !== 'inactive') {
            $employee->update(['status' => 'inactive']);
        }

        return redirect()->route('company.employees.index')
            ->with('success', 'تم تعطيل حساب الموظف وإنهاء جلساته. بياناته التاريخية باقية.');
    }
}

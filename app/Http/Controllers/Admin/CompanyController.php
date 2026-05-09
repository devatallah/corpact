<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexCompanyRequest;
use App\Http\Requests\Admin\StoreCompanyRequest;
use App\Http\Requests\Admin\UpdateCompanyRequest;
use App\Models\Company;
use App\Services\Admin\CompanyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyService $companyService,
    ) {}

    /**
     * List companies with optional filters.
     */
    public function index(IndexCompanyRequest $request): Response
    {
        $filters = $request->validated();

        $companies = $this->companyService->list($filters);
        $stats = $this->companyService->dashboardStats();

        return Inertia::render('admin/companies/index', [
            'companies' => $companies,
            'stats' => $stats,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new company.
     */
    public function create(): Response
    {
        return Inertia::render('admin/companies/create');
    }

    /**
     * Store a newly created company.
     */
    public function store(StoreCompanyRequest $request): RedirectResponse
    {
        Gate::authorize('create', Company::class);

        $data = $request->validated();
        $rawPassword = $data['password'];
        $data['password'] = bcrypt($rawPassword);

        $company = Company::create($data);
        $this->companyService->approve($company);

        \App\Models\Employee::create([
            'name' => $data['hr_name'] ?? $data['name'],
            'email' => $data['email'],
            'password' => $rawPassword,
            'company_id' => $company->id,
            'department' => 'الموارد البشرية',
            'status' => 'active',
        ]);

        return redirect()->route('admin.companies.index')
            ->with('success', 'تم إنشاء الشركة بنجاح.');
    }

    /**
     * Show the form for editing the specified company.
     */
    public function edit(Company $company): Response
    {
        return Inertia::render('admin/companies/edit', [
            'company' => $company,
        ]);
    }

    /**
     * Update the specified company.
     */
    public function update(UpdateCompanyRequest $request, Company $company): RedirectResponse
    {
        Gate::authorize('update', $company);

        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $company->update($data);

        return back()->with('success', 'تم تحديث الشركة بنجاح.');
    }

    /**
     * Approve a pending company.
     */
    public function approve(Company $company): RedirectResponse
    {
        $this->companyService->approve($company);

        return back()->with('success', 'تمت الموافقة على الشركة بنجاح.');
    }

    /**
     * Reject a pending company.
     */
    public function reject(Company $company): RedirectResponse
    {
        $this->companyService->reject($company);

        return back()->with('success', 'تم رفض طلب الشركة.');
    }

    /**
     * Send a password reset link to the company.
     */
    public function sendResetPassword(Company $company): RedirectResponse
    {
        $status = Password::broker('companies')->sendResetLink(
            ['email' => $company->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.')
            : back()->with('error', 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    }

    /**
     * Remove the specified company.
     */
    public function destroy(Company $company): RedirectResponse
    {
        Gate::authorize('delete', $company);

        $company->delete();

        return redirect()->route('admin.companies.index')
            ->with('success', 'تم حذف الشركة بنجاح.');
    }
}

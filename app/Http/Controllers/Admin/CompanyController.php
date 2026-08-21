<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexCompanyRequest;
use App\Http\Requests\Admin\StoreCompanyRequest;
use App\Http\Requests\Admin\UpdateCompanyRequest;
use App\Models\Company;
use App\Models\Employee;
use App\Models\StoredFile;
use App\Services\Admin\CompanyService;
use App\Support\Money;
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

        Employee::create([
            'name' => $data['contact_name'] ?? $data['name'],
            'email' => $data['email'],
            'password' => $rawPassword,
            'company_id' => $company->id,
            'department' => 'الإدارة',
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
            // A15 — H §16 «الشركات والعقود»: قيم العقد والرقم الضريبي والسجل
            // التجاري + نسخ ملف العقد (لا يُحذف منها شيء أبداً — H §19).
            'contract' => [
                'commercial_registration' => $company->commercial_registration,
                'vat_number' => $company->vat_number,
                'contract_fee_per_activated_employee' => $company->contract_fee_per_activated_employee !== null
                    ? Money::format((int) $company->contract_fee_per_activated_employee)
                    : '',
                'contract_monthly_minimum' => $company->contract_monthly_minimum !== null
                    ? Money::format((int) $company->contract_monthly_minimum)
                    : '',
                'contract_coordinator_service' => (bool) $company->contract_coordinator_service,
            ],
            'contractFiles' => StoredFile::query()
                ->where('fileable_type', $company->getMorphClass())
                ->where('fileable_id', $company->id)
                ->ofCategory(FileCategory::Contract)
                ->orderByDesc('version')
                ->get()
                ->map(fn (StoredFile $file) => [
                    'id' => $file->id,
                    'original_name' => $file->original_name,
                    'version' => $file->version,
                    'is_current' => $file->is_current,
                    'size' => $file->sizeLabel(),
                    'created_at' => $file->created_at?->toIso8601String(),
                ])
                ->all(),
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

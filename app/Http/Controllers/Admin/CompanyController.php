<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileCategory;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexCompanyRequest;
use App\Http\Requests\Admin\StoreCompanyRequest;
use App\Http\Requests\Admin\UpdateCompanyRequest;
use App\Models\Company;
use App\Models\Employee;
use App\Models\RoleAssignment;
use App\Models\StoredFile;
use App\Models\User;
use App\Services\Admin\CompanyService;
use App\Services\Identity\IdentityResolver;
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

        // مسؤولو الحساب لكل شركة — العقد بلا من يديره على الأرض نصف صورة.
        $accountManagers = RoleAssignment::query()
            ->where('role', Role::AccountManager->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMPANY)
            ->whereIn('scope_id', $companies->pluck('id'))
            ->get(['scope_id', 'user_id']);

        $users = User::whereIn('id', $accountManagers->pluck('user_id')->unique())->get(['id', 'name', 'phone', 'email']);

        $managersByCompany = $accountManagers
            ->groupBy('scope_id')
            ->map(fn ($rows) => $rows
                ->map(fn ($row) => $users->firstWhere('id', $row->user_id))
                ->filter()
                ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name, 'phone' => $user->phone, 'email' => $user->email])
                ->values());

        /*
         * بنود العقد هللات في العمود (H §12) — وكانت القائمة تطبعها كما هي
         * تحت وسم «ر.س»، فيقرأ الأدمن 30000 ر.س للموظف الواحد بدل 300.00.
         * صفحة التعديل كانت تنسّقها منذ البداية؛ القائمة وحدها هي التي كذبت.
         */
        $companies->getCollection()->transform(function (Company $company) {
            $company->setAttribute(
                'contract_fee_display',
                $company->contract_fee_per_activated_employee === null
                    ? null
                    : Money::format((int) $company->contract_fee_per_activated_employee),
            );
            $company->setAttribute(
                'contract_minimum_display',
                $company->contract_monthly_minimum === null
                    ? null
                    : Money::format((int) $company->contract_monthly_minimum),
            );

            return $company;
        });

        return Inertia::render('admin/companies/index', [
            'companies' => $companies,
            'accountManagers' => $managersByCompany,
            // وكيل الدعم المتابع لكل شركة — يُقرأ من القائمة لا من فتح كل ملف.
            'supportAgentNames' => User::query()
                ->whereIn('id', $companies->pluck('support_agent_user_id')->filter()->unique())
                ->pluck('name', 'id'),
            'stats' => $stats,
            'filters' => (object) $filters,
            'sort' => CompanyService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    /**
     * Show the form for creating a new company.
     */
    /**
     * وكلاء الدعم الذين يصلحون للإسناد.
     *
     * دور بنطاق المنصة لا نطاق شركة: الإسناد نفسه لا يمنح شيئاً، فمن يُسنَد
     * يجب أن يكون وكيل دعم أصلاً. الترتيب بالاسم لأن القائمة تُقرأ لا تُبحث.
     *
     * @return list<array{id: int, name: string, email: string|null, companies: int}>
     */
    private function assignableSupportAgents(): array
    {
        $ids = RoleAssignment::query()
            ->where('role', Role::SupportAgent->value)
            ->where('scope_type', RoleAssignment::SCOPE_PLATFORM)
            ->pluck('user_id')
            ->unique();

        $loads = Company::query()
            ->whereIn('support_agent_user_id', $ids)
            ->selectRaw('support_agent_user_id, count(*) as total')
            ->groupBy('support_agent_user_id')
            ->pluck('total', 'support_agent_user_id');

        return User::query()
            ->whereIn('id', $ids)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                // عدد الشركات التي يتابعها بالفعل — الإسناد بلا حِمل الوكيل
                // الحالي يوزّع الشركات على واحد ويترك البقية فارغين.
                'companies' => (int) ($loads[$user->id] ?? 0),
            ])
            ->values()
            ->all();
    }

    public function create(): Response
    {
        return Inertia::render('admin/companies/create', [
            'supportAgents' => $this->assignableSupportAgents(),
        ]);
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

        // Same vouched-for binding as update(): the observer that created the
        // account-manager identity may not write the login phone, because it
        // also runs for the public company registration.
        app(IdentityResolver::class)->linkCompanyAccountManager($company, bindPhone: true);

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
            'supportAgents' => $this->assignableSupportAgents(),
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

        // `contact_phone` is optional at creation (StoreCompanyRequest), so an
        // account manager can exist without a login credential. A platform
        // admin filling the number in later is the vouched-for binding path —
        // identity resolution itself never writes the credential (see
        // IdentityResolver::bindPhone).
        if ($company->wasChanged('contact_phone')) {
            app(IdentityResolver::class)->linkCompanyAccountManager($company, bindPhone: true);
        }

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

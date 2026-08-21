<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Role;
use App\Http\Controllers\Auth\Concerns\HandlesOtpLogin;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\RoleAssignment;
use App\Services\Auth\OtpLoginService;
use App\Services\Auth\PortalLoginService;
use App\Services\Identity\IdentityResolver;
use App\Services\Otp\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CompanyAuthController extends Controller
{
    use HandlesOtpLogin;

    public function __construct(
        protected OtpService $otpService,
        protected OtpLoginService $otpLogin,
        protected PortalLoginService $portalLogin,
    ) {}

    protected function guardName(): string
    {
        return 'company';
    }

    protected function guardLabel(): string
    {
        return 'مسؤول الحساب';
    }

    protected function portalTag(): string
    {
        return 'COMPANY';
    }

    protected function homeRoute(): string
    {
        return 'company.dash';
    }

    /**
     * The company guard's profile row is the Company itself; resolve the
     * acting account manager through the role assignment.
     */
    protected function fallbackSessionUserId(): ?int
    {
        $company = auth('company')->user();

        if ($company === null) {
            return null;
        }

        return RoleAssignment::query()
            ->where('role', Role::AccountManager->value)
            ->forScope(RoleAssignment::SCOPE_COMPANY, $company->id)
            ->value('user_id');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:companies,email'],
            'sector' => ['required', 'string', 'max:255'],
            'employee_count_range' => ['required', 'string', 'max:255'],
            'domain' => ['required', 'string', 'max:255', 'unique:companies,domain'],
            'city' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_title' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Company::create([
            ...$validated,
            'status' => 'pending',
        ]);

        return redirect('/companies#register')
            ->with('success', 'تم إرسال طلب التسجيل بنجاح.');
    }

    public function showActivateForm(string $token): Response|RedirectResponse
    {
        $company = Company::where('activation_token', $token)->first();

        if (! $company || ($company->activation_token_expires_at && $company->activation_token_expires_at->isPast())) {
            return redirect()->route('company.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        return Inertia::render('auth/activate-company', [
            'token' => $token,
            'companyName' => $company->name,
            'email' => $company->email,
        ]);
    }

    public function activate(Request $request, string $token): Response|RedirectResponse
    {
        $company = Company::where('activation_token', $token)->first();

        if (! $company || ($company->activation_token_expires_at && $company->activation_token_expires_at->isPast())) {
            return redirect()->route('company.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        $companyName = $company->name;

        $company->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
            'email_verified_at' => now(),
        ]);

        // Ensure the account manager identity exists, then open a stamped
        // portal session (30-day lifetime, epoch-bound).
        $user = app(IdentityResolver::class)->linkCompanyAccountManager($company);
        $this->portalLogin->login($request, 'company', $company, $user);

        return Inertia::render('auth/activate-company', [
            'token' => '',
            'companyName' => $companyName,
            'email' => $company->email,
            'activated' => true,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->portalLogin->logout($request, 'company');

        return redirect()->route('company.login');
    }
}

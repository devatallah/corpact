<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\Auth\CompanyAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CompanyAuthController extends Controller
{
    public function __construct(private CompanyAuthService $authService) {}

    public function showLoginForm(): Response
    {
        return Inertia::render('auth/login', [
            'guard' => 'company',
            'guardLabel' => 'الشركة',
            'portalTag' => 'COMPANY',
            'canRegister' => true,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::guard('company')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        if (Auth::guard('company')->user()->status !== 'active') {
            Auth::guard('company')->logout();
            throw ValidationException::withMessages([
                'email' => ['حساب الشركة غير مفعّل.'],
            ]);
        }

        $request->session()->regenerate();

        return redirect()->route('company.dash');
    }

    public function showRegisterForm(): Response
    {
        return Inertia::render('auth/register-company');
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
            'hr_name' => ['required', 'string', 'max:255'],
            'hr_title' => ['required', 'string', 'max:255'],
            'hr_phone' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Company::create([
            ...$validated,
            'status' => 'pending',
        ]);

        return redirect()->route('company.register')
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

        Auth::guard('company')->login($company);
        $request->session()->regenerate();

        return Inertia::render('auth/activate-company', [
            'token' => '',
            'companyName' => $companyName,
            'email' => $company->email,
            'activated' => true,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect()->route('company.login');
    }
}

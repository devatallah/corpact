<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Services\Auth\EmployeeAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EmployeeAuthController extends Controller
{
    public function __construct(private EmployeeAuthService $authService) {}

    public function showLoginForm(): RedirectResponse
    {
        return redirect('/employees?login=1');
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

        if (! Auth::guard('employee')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        $employee = Auth::guard('employee')->user();

        if ($employee->status === 'pending_verification') {
            Auth::guard('employee')->logout();
            throw ValidationException::withMessages([
                'email' => ['لم يتم تأكيد بريدك الإلكتروني بعد. يرجى التحقق من بريدك والضغط على رابط التأكيد.'],
            ]);
        }

        if ($employee->status !== 'active') {
            Auth::guard('employee')->logout();
            throw ValidationException::withMessages([
                'email' => ['حسابك غير مفعّل. يرجى التواصل مع إدارة الشركة.'],
            ]);
        }

        $request->session()->regenerate();

        return redirect()->route('employee.home');
    }

    public function showRegisterForm(): Response
    {
        return Inertia::render('auth/register-employee');
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
        ], [
            'name.required' => 'الاسم مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.unique' => 'البريد الإلكتروني مسجّل مسبقاً.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق.',
        ]);

        $domain = substr(strrchr($data['email'], '@'), 1);

        $company = Company::where('domain', $domain)
            ->where('status', 'active')
            ->first();

        if (! $company) {
            throw ValidationException::withMessages([
                'email' => ['نطاق بريدك الإلكتروني غير مرتبط بأي شركة مسجلة. تواصل مع شركتك للتسجيل في المنصة.'],
            ]);
        }

        $employee = Employee::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'] ?? null,
            'company_id' => $company->id,
            'status' => 'pending_verification',
        ]);

        $employee->sendEmailVerificationNotification();

        return redirect()->route('employee.login')
            ->with('status', 'تم إنشاء حسابك بنجاح. يرجى تأكيد بريدك الإلكتروني من خلال الرابط المرسل إليك.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect()->route('employee.login');
    }
}

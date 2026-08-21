<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\Concerns\HandlesOtpLogin;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Services\Auth\OtpLoginService;
use App\Services\Auth\PortalLoginService;
use App\Services\Otp\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmployeeAuthController extends Controller
{
    use HandlesOtpLogin;

    public function __construct(
        protected OtpService $otpService,
        protected OtpLoginService $otpLogin,
        protected PortalLoginService $portalLogin,
    ) {}

    protected function guardName(): string
    {
        return 'employee';
    }

    protected function guardLabel(): string
    {
        return 'الموظف';
    }

    protected function portalTag(): string
    {
        return 'EMPLOYEE';
    }

    protected function homeRoute(): string
    {
        return 'employee.home';
    }

    /**
     * Legacy self-registration by corporate email domain (pre-A4 flow —
     * invitation-based onboarding is brief A4's). Phone is now mandatory:
     * it is the login identity (H §4).
     */
    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            // `unique:users,email` closes the same cross-portal gap the two
            // other public register() methods had: this endpoint is public,
            // takes a caller-chosen phone, and its email would otherwise
            // resolve onto an existing global identity.
            'email' => ['required', 'email', 'max:255', 'unique:employees,email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['required', 'string', 'max:20'],
        ], [
            'name.required' => 'الاسم مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.unique' => 'البريد الإلكتروني مسجّل مسبقاً.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق.',
            'phone.required' => 'رقم الجوال مطلوب — تسجيل الدخول يتم برقم الجوال.',
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
            'phone' => $data['phone'],
            'company_id' => $company->id,
            'status' => 'pending_verification',
        ]);

        $employee->sendEmailVerificationNotification();

        return redirect()->route('employee.login')
            ->with('status', 'تم إنشاء حسابك بنجاح. يرجى تأكيد بريدك الإلكتروني من خلال الرابط المرسل إليك.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->portalLogin->logout($request, 'employee');

        return redirect()->route('employee.login');
    }
}

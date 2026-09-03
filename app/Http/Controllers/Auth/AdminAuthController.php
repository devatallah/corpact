<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit\SecurityEventService;
use App\Services\Auth\PortalLoginService;
use App\Services\Otp\OtpService;
use App\Support\Identity\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Teamat admin / finance admin login (H §4): email + password, THEN an OTP —
 * both factors mandatory («حساب واحد منهما يكفي للوصول إلى كل الأموال»).
 * Session lifetime 12 hours.
 */
class AdminAuthController extends Controller
{
    private const PENDING_KEY = 'admin_2fa';

    public function __construct(
        private OtpService $otpService,
        private PortalLoginService $portalLogin,
    ) {}

    public function showLoginForm(): Response
    {
        // The internal door has its own screen (teamat.ai.studio auth_internal);
        // auth/login stays the customer-facing one.
        return Inertia::render('auth/internal-login');
    }

    /**
     * First factor: email + password. No session is opened yet — the OTP
     * challenge (second factor) completes the login.
     *
     * @throws ValidationException
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::guard('admin')->validate($credentials)) {
            // A15 — H §19: «سجل أحداث أمنية منفصل (دخول فاشل …)». الحارس هنا
            // يستخدم validate() لا attempt()، فلا يقع حدث `Failed` الإطاري
            // ويُسجَّل الحدث صراحةً — وحساب أدمن واحد يكفي للوصول إلى كل الأموال.
            SecurityEventService::loginFailed($credentials['email'], 'admin');

            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        /** @var User $user */
        $user = User::query()->where('email', $credentials['email'])->firstOrFail();

        if ($user->status !== 'active' || $user->platformRole() === null) {
            throw ValidationException::withMessages([
                'email' => ['هذا الحساب غير مفعّل كأدمن للمنصة.'],
            ]);
        }

        if ($user->phone === null) {
            throw ValidationException::withMessages([
                'email' => ['لا يوجد رقم جوال مسجل لهذا الحساب لإرسال رمز التحقق. تواصل مع أدمن أعلى.'],
            ]);
        }

        $this->otpService->request($user->phone, 'admin_2fa', $user);

        $request->session()->put(self::PENDING_KEY, [
            'user_id' => $user->id,
            'created_at' => now()->getTimestamp(),
        ]);

        return redirect()->route('admin.otp');
    }

    /**
     * Second factor challenge page.
     */
    public function showOtpChallenge(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return redirect()->route('admin.login');
        }

        return Inertia::render('auth/admin-otp', [
            'maskedPhone' => $this->maskPhone($user->phone),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'digits:6'],
        ], [
            'code.required' => 'رمز التحقق مطلوب.',
            'code.digits' => 'الرمز مكوّن من ٦ أرقام.',
        ]);

        $user = $this->pendingUser($request);

        if ($user === null) {
            return redirect()->route('admin.login')
                ->with('error', 'انتهت صلاحية الجلسة. أعد تسجيل الدخول.');
        }

        $this->otpService->verify($user->phone, $data['code'], 'admin_2fa');

        $request->session()->forget(self::PENDING_KEY);
        $this->portalLogin->login($request, 'admin', $user, $user);

        return redirect()->route('admin.dash');
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return redirect()->route('admin.login');
        }

        $this->otpService->request($user->phone, 'admin_2fa', $user);

        return back()->with('status', 'otp-sent');
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->portalLogin->logout($request, 'admin');

        return redirect()->route('admin.login');
    }

    private function pendingUser(Request $request): ?User
    {
        $pending = $request->session()->get(self::PENDING_KEY);

        if (! is_array($pending)
            || ! isset($pending['user_id'], $pending['created_at'])
            || now()->getTimestamp() - (int) $pending['created_at'] > 600) {
            return null;
        }

        return User::query()->find($pending['user_id']);
    }

    private function maskPhone(?string $phone): ?string
    {
        $display = PhoneNumber::display($phone);

        if ($display === null || strlen($display) < 4) {
            return $display;
        }

        return str_repeat('•', max(strlen($display) - 4, 0)).substr($display, -4);
    }
}

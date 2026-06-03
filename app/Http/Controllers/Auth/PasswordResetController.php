<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    private const GUARDS = [
        'admin' => [
            'broker' => 'admins',
            'login_route' => 'admin.login',
            'label' => 'المشرف',
        ],
        'employee' => [
            'broker' => 'employees',
            'login_route' => 'employee.login',
            'label' => 'الموظف',
        ],
        'business' => [
            'broker' => 'businesses',
            'login_route' => 'business.login',
            'label' => 'النادي',
        ],
        'company' => [
            'broker' => 'companies',
            'login_route' => 'company.login',
            'label' => 'الشركة',
        ],
    ];

    public function showForgotForm(string $guard): Response
    {
        $config = self::GUARDS[$guard];

        return Inertia::render('auth/forgot-password', [
            'guard' => $guard,
            'guardLabel' => $config['label'],
        ]);
    }

    public function sendResetLink(Request $request, string $guard): RedirectResponse
    {
        $config = self::GUARDS[$guard];

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::broker($config['broker'])->sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.')
            : back()->withErrors(['email' => 'لم نتمكن من العثور على حساب بهذا البريد الإلكتروني.']);
    }

    public function showResetForm(Request $request, string $guard, string $token): Response
    {
        $config = self::GUARDS[$guard];

        return Inertia::render('auth/reset-password', [
            'guard' => $guard,
            'guardLabel' => $config['label'],
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    public function reset(Request $request, string $guard): RedirectResponse
    {
        $config = self::GUARDS[$guard];

        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $status = Password::broker($config['broker'])->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route($config['login_route'])->with('status', 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.')
            : back()->withErrors(['email' => 'فشل إعادة تعيين كلمة المرور. تأكد من صحة البيانات.']);
    }
}

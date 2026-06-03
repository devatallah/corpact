<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    private const GUARDS = [
        'admin' => [
            'model' => User::class,
            'guard' => 'admin',
            'dashboard_route' => 'admin.dash',
            'label' => 'المشرف',
        ],
        'employee' => [
            'model' => Employee::class,
            'guard' => 'employee',
            'dashboard_route' => 'employee.home',
            'label' => 'الموظف',
        ],
        'business' => [
            'model' => Business::class,
            'guard' => 'business',
            'dashboard_route' => 'business.dash',
            'label' => 'النادي',
        ],
        'company' => [
            'model' => Company::class,
            'guard' => 'company',
            'dashboard_route' => 'company.dash',
            'label' => 'الشركة',
        ],
    ];

    public function notice(Request $request, string $guard): Response|RedirectResponse
    {
        $config = self::GUARDS[$guard];

        $user = $request->user($config['guard']);

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route($config['dashboard_route']));
        }

        return Inertia::render('auth/verify-email', [
            'guard' => $guard,
            'guardLabel' => $config['label'],
        ]);
    }

    public function verify(Request $request, string $guard, int $id, string $hash): RedirectResponse
    {
        $config = self::GUARDS[$guard];

        $user = $config['model']::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'رابط التحقق غير صالح.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();

            if ($guard === 'employee' && $user->status === 'pending_verification') {
                $user->update(['status' => 'active']);
            }
        }

        $loginRoute = match ($guard) {
            'employee' => 'employee.login',
            'business' => 'business.login',
            'company' => 'company.login',
            default => 'admin.login',
        };

        return redirect()->route($loginRoute, ['email' => $user->email])->with('status', 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.');
    }

    public function resend(Request $request, string $guard): RedirectResponse
    {
        $config = self::GUARDS[$guard];

        $user = $request->user($config['guard']);

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route($config['dashboard_route']));
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', 'تم إرسال رابط التحقق إلى بريدك الإلكتروني.');
    }
}

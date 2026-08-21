<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\Concerns\HandlesOtpLogin;
use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Services\Auth\OtpLoginService;
use App\Services\Auth\PortalLoginService;
use App\Services\Identity\IdentityResolver;
use App\Services\Otp\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PartnerAuthController extends Controller
{
    use HandlesOtpLogin;

    public function __construct(
        protected OtpService $otpService,
        protected OtpLoginService $otpLogin,
        protected PortalLoginService $portalLogin,
    ) {}

    protected function guardName(): string
    {
        return 'partner';
    }

    protected function guardLabel(): string
    {
        return 'مزوّد الخدمة';
    }

    protected function portalTag(): string
    {
        return 'PARTNER';
    }

    protected function homeRoute(): string
    {
        return 'partner.dash';
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:partners,email'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['integer', 'exists:categories,id'],
            'venues_count' => ['required', 'integer', 'min:1'],
            'working_hours' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_title' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $categoryIds = $validated['categories'];
        unset($validated['categories']);

        $partner = Partner::create([
            ...$validated,
            'status' => 'pending',
        ]);

        $partner->categories()->attach($categoryIds);

        return redirect('/partners#register')
            ->with('success', 'تم إرسال طلب التسجيل بنجاح.');
    }

    public function showActivateForm(string $token): Response|RedirectResponse
    {
        $partner = Partner::where('activation_token', $token)->first();

        if (! $partner || ($partner->activation_token_expires_at && $partner->activation_token_expires_at->isPast())) {
            return redirect()->route('partner.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        return Inertia::render('auth/activate-partner', [
            'token' => $token,
            'partnerName' => $partner->name,
            'email' => $partner->email,
        ]);
    }

    public function activate(Request $request, string $token): Response|RedirectResponse
    {
        $partner = Partner::where('activation_token', $token)->first();

        if (! $partner || ($partner->activation_token_expires_at && $partner->activation_token_expires_at->isPast())) {
            return redirect()->route('partner.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        $partnerName = $partner->name;

        $partner->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
            'email_verified_at' => now(),
        ]);

        // Ensure the provider identity exists, then open a stamped portal
        // session (14-day lifetime, epoch-bound).
        $user = app(IdentityResolver::class)->linkPartner($partner);
        $this->portalLogin->login($request, 'partner', $partner, $user);

        return Inertia::render('auth/activate-partner', [
            'token' => '',
            'partnerName' => $partnerName,
            'email' => $partner->email,
            'activated' => true,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->portalLogin->logout($request, 'partner');

        return redirect()->route('partner.login');
    }
}

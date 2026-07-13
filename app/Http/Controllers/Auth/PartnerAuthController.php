<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Services\Auth\PartnerAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PartnerAuthController extends Controller
{
    public function __construct(private PartnerAuthService $authService) {}

    public function showLoginForm(): RedirectResponse
    {
        return redirect('/partners?login=1');
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

        if (! Auth::guard('partner')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        $user = Auth::guard('partner')->user();

        if ($user->status !== 'active') {
            Auth::guard('partner')->logout();
            throw ValidationException::withMessages([
                'email' => ['حساب الشريك غير مفعّل.'],
            ]);
        }

        // For staff accounts, also check that the parent partner is active
        if ($user->parent_id) {
            $parent = $user->parent;
            if (! $parent || $parent->status !== 'active') {
                Auth::guard('partner')->logout();
                throw ValidationException::withMessages([
                    'email' => ['حساب الشريك الرئيسي غير مفعّل.'],
                ]);
            }
        }

        $request->session()->regenerate();

        return redirect()->route('partner.dash');
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

        Auth::guard('partner')->login($partner);
        $request->session()->regenerate();

        return Inertia::render('auth/activate-partner', [
            'token' => '',
            'partnerName' => $partnerName,
            'email' => $partner->email,
            'activated' => true,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect()->route('partner.login');
    }
}

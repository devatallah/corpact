<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Sport;
use App\Services\Auth\ClubAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClubAuthController extends Controller
{
    public function __construct(private ClubAuthService $authService) {}

    public function showLoginForm(): Response
    {
        return Inertia::render('auth/login', [
            'guard' => 'club',
            'guardLabel' => 'النادي',
            'portalTag' => 'CLUB',
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

        if (! Auth::guard('club')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        if (Auth::guard('club')->user()->status !== 'active') {
            Auth::guard('club')->logout();
            throw ValidationException::withMessages([
                'email' => ['حساب النادي غير مفعّل.'],
            ]);
        }

        $request->session()->regenerate();

        return redirect()->route('club.dash');
    }

    public function showRegisterForm(): Response
    {
        return Inertia::render('auth/register-club', [
            'sports' => Sport::select('id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:clubs,email'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'sports' => ['required', 'array', 'min:1'],
            'sports.*' => ['integer', 'exists:sports,id'],
            'courts_count' => ['required', 'integer', 'min:1'],
            'working_hours' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_title' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $sportIds = $validated['sports'];
        unset($validated['sports']);

        $club = Club::create([
            ...$validated,
            'status' => 'pending',
        ]);

        $club->sports()->attach($sportIds);

        return redirect()->route('club.register')
            ->with('success', 'تم إرسال طلب التسجيل بنجاح.');
    }

    public function showActivateForm(string $token): Response|RedirectResponse
    {
        $club = Club::where('activation_token', $token)->first();

        if (! $club) {
            return redirect()->route('club.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        return Inertia::render('auth/activate-club', [
            'token' => $token,
            'clubName' => $club->name,
            'email' => $club->email,
        ]);
    }

    public function activate(Request $request, string $token): Response|RedirectResponse
    {
        $club = Club::where('activation_token', $token)->first();

        if (! $club) {
            return redirect()->route('club.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        $clubName = $club->name;

        $club->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
            'email_verified_at' => now(),
        ]);

        Auth::guard('club')->login($club);
        $request->session()->regenerate();

        return Inertia::render('auth/activate-club', [
            'token' => '',
            'clubName' => $clubName,
            'email' => $club->email,
            'activated' => true,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect()->route('club.login');
    }
}

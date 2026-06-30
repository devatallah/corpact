<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Services\Auth\BusinessAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BusinessAuthController extends Controller
{
    public function __construct(private BusinessAuthService $authService) {}

    public function showLoginForm(): RedirectResponse
    {
        return redirect('/clubs?login=1');
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

        if (! Auth::guard('business')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        $user = Auth::guard('business')->user();

        if ($user->status !== 'active') {
            Auth::guard('business')->logout();
            throw ValidationException::withMessages([
                'email' => ['حساب النادي غير مفعّل.'],
            ]);
        }

        // For staff accounts, also check that the parent business is active
        if ($user->parent_id) {
            $parent = $user->parent;
            if (! $parent || $parent->status !== 'active') {
                Auth::guard('business')->logout();
                throw ValidationException::withMessages([
                    'email' => ['حساب المنشأة الرئيسي غير مفعّل.'],
                ]);
            }
        }

        $request->session()->regenerate();

        return redirect()->route('business.dash');
    }

    public function showRegisterForm(): Response
    {
        return Inertia::render('auth/register-business', [
            'categories' => Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:businesss,email'],
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

        $business = Business::create([
            ...$validated,
            'status' => 'pending',
        ]);

        $business->categories()->attach($categoryIds);

        return redirect()->route('business.register')
            ->with('success', 'تم إرسال طلب التسجيل بنجاح.');
    }

    public function showActivateForm(string $token): Response|RedirectResponse
    {
        $business = Business::where('activation_token', $token)->first();

        if (! $business || ($business->activation_token_expires_at && $business->activation_token_expires_at->isPast())) {
            return redirect()->route('business.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        return Inertia::render('auth/activate-business', [
            'token' => $token,
            'businessName' => $business->name,
            'email' => $business->email,
        ]);
    }

    public function activate(Request $request, string $token): Response|RedirectResponse
    {
        $business = Business::where('activation_token', $token)->first();

        if (! $business || ($business->activation_token_expires_at && $business->activation_token_expires_at->isPast())) {
            return redirect()->route('business.login')
                ->with('error', 'رابط التفعيل غير صالح أو منتهي الصلاحية.');
        }

        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        $businessName = $business->name;

        $business->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
            'email_verified_at' => now(),
        ]);

        Auth::guard('business')->login($business);
        $request->session()->regenerate();

        return Inertia::render('auth/activate-business', [
            'token' => '',
            'businessName' => $businessName,
            'email' => $business->email,
            'activated' => true,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect()->route('business.login');
    }
}

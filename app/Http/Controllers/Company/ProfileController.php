<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('company/profile/index', [
            'company' => auth('company')->user(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth('company')->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'hr_name' => ['nullable', 'string', 'max:255'],
            'hr_phone' => ['nullable', 'string', 'max:20'],
            'current_password' => ['required', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required' => 'اسم الشركة مطلوب.',
            'current_password.required' => 'كلمة المرور الحالية مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق.',
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'كلمة المرور الحالية غير صحيحة.']);
        }

        unset($data['current_password']);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return back()->with('success', 'تم تحديث الملف الشخصي بنجاح.');
    }
}

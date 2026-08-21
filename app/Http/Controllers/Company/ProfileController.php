<?php

namespace App\Http\Controllers\Company;

use App\Enums\FileCategory;
use App\Http\Controllers\Controller;
use App\Services\Files\FileStorageService;
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
            'commercial_registration' => ['nullable', 'string', 'max:30'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'current_password' => ['required', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required' => 'اسم الشركة مطلوب.',
            'logo.image' => 'الشعار يجب أن يكون صورة.',
            'logo.max' => 'حجم الشعار يتجاوز 2 ميجابايت.',
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

        if ($request->hasFile('logo')) {
            // A15 — H §19 «الملفات»: شعار jpg·png·webp حتى 2MB بفحص نوع MIME
            // الفعلي ورفض التنفيذي. الاستبدال ينشئ **نسخة جديدة** ويحتفظ
            // بالقديمة (لم تعد تُحذف من القرص كما كان يفعل هذا المسار).
            $stored = app(FileStorageService::class)->store(
                upload: $request->file('logo'),
                category: FileCategory::Logo,
                owner: $user,
                companyId: $user->id,
                field: 'logo',
            );

            $data['logo'] = $stored->path;
        } else {
            unset($data['logo']);
        }

        $user->update($data);

        return back()->with('success', 'تم تحديث الملف الشخصي بنجاح.');
    }
}

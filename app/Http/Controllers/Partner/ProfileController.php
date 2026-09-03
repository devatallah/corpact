<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\ActivityUnit;
use App\Models\ProviderBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $authPartner = auth('partner')->user();

        $partner = $authPartner->resolvedPartner();

        /*
         * H §17 — معالج التفعيل.
         *
         * المزوّد لا يتلقى طلباً واحداً قبل اكتمال أربعة أشياء. غيابها يظهر
         * اليوم كصمت: لوحة فارغة بلا سبب معروض. هذه الحالة تقول له أين توقف.
         */
        $branches = ProviderBranch::where('partner_id', $partner->id)->count();
        $units = ActivityUnit::whereHas('branch', fn ($q) => $q->where('partner_id', $partner->id))
            ->where('status', 'active')
            ->count();

        return Inertia::render('partner/profile/index', [
            'partner' => $partner,
            'activation' => [
                ['key' => 'profile', 'label' => 'الملف التجاري', 'hint' => 'السجل والتواصل', 'href' => '/partner/profile',
                    'done' => filled($partner->commercial_registration) && filled($partner->contact_phone)],
                ['key' => 'branches', 'label' => 'الفروع', 'hint' => 'المواقع وأوقات العمل', 'href' => '/partner/branches',
                    'done' => $branches > 0, 'count' => $branches],
                ['key' => 'units', 'label' => 'وحدات النشاط', 'hint' => 'الكتالوج والتسعير', 'href' => '/partner/branches',
                    'done' => $units > 0, 'count' => $units],
                ['key' => 'bank', 'label' => 'الحساب البنكي', 'hint' => 'الاعتماد المالي', 'href' => '/partner/bank',
                    'done' => $partner->bank_status === 'approved'],
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth('partner')->user()->resolvedPartner();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'current_password' => ['required', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required' => 'اسم الشريك مطلوبة.',
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

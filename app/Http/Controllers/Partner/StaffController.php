<?php

namespace App\Http\Controllers\Partner;

use App\Enums\PartnerRole;
use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * List staff members for the authenticated partner.
     */
    public function index(): Response
    {
        $partner = auth('partner')->user();

        $staff = Partner::where('parent_id', $partner->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('partner/staff/index', [
            'partner' => $partner,
            'staff' => $staff,
            'roles' => collect(PartnerRole::cases())
                ->filter(fn ($role) => $role !== PartnerRole::Owner)
                ->map(fn ($role) => [
                    'value' => $role->value,
                    'label' => $role->label(),
                ])
                ->values(),
        ]);
    }

    /**
     * Store a new staff member.
     */
    public function store(Request $request): RedirectResponse
    {
        $partner = auth('partner')->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:partners,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::enum(PartnerRole::class)->except([PartnerRole::Owner])],
        ], [
            'name.required' => 'اسم الموظف مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'role.required' => 'الدور مطلوب.',
        ]);

        Partner::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'parent_id' => $partner->id,
            'city' => $partner->city,
            'district' => $partner->district,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'تم إضافة الموظف بنجاح.');
    }

    /**
     * Update a staff member.
     */
    public function update(Request $request, Partner $staff): RedirectResponse
    {
        $partner = auth('partner')->user();

        if ($staff->parent_id !== $partner->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('partners')->ignore($staff->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', Rule::enum(PartnerRole::class)->except([PartnerRole::Owner])],
            'status' => ['required', 'in:active,inactive'],
        ], [
            'name.required' => 'اسم الموظف مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'role.required' => 'الدور مطلوب.',
        ]);

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'status' => $data['status'],
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $staff->update($updateData);

        return back()->with('success', 'تم تحديث بيانات الموظف بنجاح.');
    }

    /**
     * Delete a staff member.
     */
    public function destroy(Partner $staff): RedirectResponse
    {
        $partner = auth('partner')->user();

        if ($staff->parent_id !== $partner->id) {
            abort(403);
        }

        $staff->delete();

        return back()->with('success', 'تم حذف الموظف بنجاح.');
    }
}

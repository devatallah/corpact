<?php

namespace App\Http\Controllers\Business;

use App\Enums\BusinessRole;
use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * List staff members for the authenticated business.
     */
    public function index(): Response
    {
        $business = auth('business')->user();

        $staff = Business::where('parent_id', $business->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('business/staff/index', [
            'business' => $business,
            'staff' => $staff,
            'roles' => collect(BusinessRole::cases())
                ->filter(fn ($role) => $role !== BusinessRole::Owner)
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
        $business = auth('business')->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:businesses,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::enum(BusinessRole::class)->except([BusinessRole::Owner])],
        ], [
            'name.required' => 'اسم الموظف مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'role.required' => 'الدور مطلوب.',
        ]);

        Business::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'parent_id' => $business->id,
            'city' => $business->city,
            'district' => $business->district,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'تم إضافة الموظف بنجاح.');
    }

    /**
     * Update a staff member.
     */
    public function update(Request $request, Business $staff): RedirectResponse
    {
        $business = auth('business')->user();

        if ($staff->parent_id !== $business->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('businesses')->ignore($staff->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', Rule::enum(BusinessRole::class)->except([BusinessRole::Owner])],
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
    public function destroy(Business $staff): RedirectResponse
    {
        $business = auth('business')->user();

        if ($staff->parent_id !== $business->id) {
            abort(403);
        }

        $staff->delete();

        return back()->with('success', 'تم حذف الموظف بنجاح.');
    }
}

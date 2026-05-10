<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
        ]);

        $admins = User::query()
            ->when(isset($filters['search']), fn ($q) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('email', 'like', '%'.$filters['search'].'%')
            ))
            ->when(isset($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/admins/index', [
            'admins' => $admins,
            'totalAdmins' => User::count(),
            'filters' => $filters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive'])],
        ], [
            'name.required' => 'الاسم مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
        ]);

        User::create($data);

        return back()->with('success', 'تم إنشاء المشرف بنجاح.');
    }

    public function update(Request $request, User $admin): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive'])],
        ], [
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $admin->update($data);

        return back()->with('success', 'تم تحديث المشرف بنجاح.');
    }

    public function sendResetPassword(User $admin): RedirectResponse
    {
        $status = Password::broker('admins')->sendResetLink(
            ['email' => $admin->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.')
            : back()->with('error', 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    }

    public function destroy(User $admin): RedirectResponse
    {
        if ($admin->id === auth('admin')->id()) {
            return back()->with('error', 'لا يمكنك حذف حسابك الحالي.');
        }

        $admin->delete();

        return back()->with('success', 'تم حذف المشرف بنجاح.');
    }
}

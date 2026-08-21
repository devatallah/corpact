<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\RoleAssignment;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Audit\SecurityEventService;
use App\Support\Audit\AuditAction;
use App\Support\Identity\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Teamat platform admins. Roles live in `role_assignments` on the platform
 * scope (H §3): platform_admin (أدمن تيمات) and finance_admin (الأدمن
 * المالي) — the `users` table itself carries no role.
 */
class AdminController extends Controller
{
    /**
     * H §16: فصل الأدوار — `platform_admin` (كل شيء عدا الاعتماد المالي) ·
     * `finance_admin` (الاعتمادات المالية) · `support_agent` (قراءة وتدخل
     * محدود). A15 أضاف الثالث.
     */
    private const ROLES = ['platform_admin', 'finance_admin', 'support_agent'];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
        ]);

        $admins = User::query()
            ->whereHas('roleAssignments', fn ($q) => $q->where('scope_type', RoleAssignment::SCOPE_PLATFORM))
            ->with('roleAssignments')
            ->when(isset($filters['search']), fn ($q) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('email', 'like', '%'.$filters['search'].'%')
            ))
            ->when(isset($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->latest()
            ->paginate(15)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'role' => $user->platformRole()?->value,
                'roles' => $user->platformRoles()->map(fn (Role $role) => $role->value)->values()->all(),
                'created_at' => $user->created_at,
            ]);

        return Inertia::render('admin/admins/index', [
            'admins' => $admins,
            'totalAdmins' => User::query()
                ->whereHas('roleAssignments', fn ($q) => $q->where('scope_type', RoleAssignment::SCOPE_PLATFORM))
                ->count(),
            'filters' => $filters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['required', 'string', 'max:20'],
            'role' => ['sometimes', 'string', Rule::in(self::ROLES)],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive'])],
        ], [
            'name.required' => 'الاسم مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'phone.required' => 'رقم الجوال مطلوب — رمز التحقق شرط للدخول.',
        ]);

        $role = Role::from($data['role'] ?? Role::PlatformAdmin->value);
        unset($data['role']);

        $data['phone'] = PhoneNumber::normalize($data['phone']);

        $admin = User::create($data);
        $admin->assignRole($role, RoleAssignment::SCOPE_PLATFORM);

        return back()->with('success', 'تم إنشاء المشرف بنجاح.');
    }

    public function update(Request $request, User $admin): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'role' => ['sometimes', 'string', Rule::in(self::ROLES)],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive'])],
        ], [
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        if (isset($data['phone'])) {
            $data['phone'] = PhoneNumber::normalize($data['phone']);
        }

        if (isset($data['role'])) {
            $role = Role::from($data['role']);
            unset($data['role']);

            // Deleted one by one, not as a mass query delete: the observer
            // that writes «تغيير الصلاحيات» into the audit + security logs
            // (H §19) only fires on model events.
            $admin->roleAssignments()
                ->where('scope_type', RoleAssignment::SCOPE_PLATFORM)
                ->where('role', '!=', $role->value)
                ->get()
                ->each->delete();

            $admin->assignRole($role, RoleAssignment::SCOPE_PLATFORM);
            $admin->unsetRelation('roleAssignments');
        }

        $admin->update($data);

        if (($data['status'] ?? null) === 'inactive') {
            // Deactivation kills every session immediately (H §4).
            $admin->revokeAllSessions();
            $this->auditDeactivation($admin, 'تعطيل حساب مشرف من لوحة المشرفين');
        }

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

    /**
     * H §19 / §21: «الحذف يتم بإخفاء الهوية لا بحذف السجل المالي»، وسجل
     * التدقيق للكتابة فقط — فحذف صف المستخدم يقطع نسب كل ما فعله. الإجراء
     * المتاح هو التعطيل: كل الجلسات تُلغى فوراً ويبقى السجل مُسنداً.
     */
    public function destroy(User $admin): RedirectResponse
    {
        if ($admin->id === auth('admin')->id()) {
            return back()->with('error', 'لا يمكنك تعطيل حسابك الحالي.');
        }

        $admin->update(['status' => 'inactive']);
        $admin->revokeAllSessions();
        $this->auditDeactivation($admin, 'تعطيل حساب مشرف — لا يُحذف صف المستخدم كي يبقى سجل التدقيق منسوباً');

        return back()->with('success', 'تم تعطيل المشرف وإلغاء جلساته.');
    }

    private function auditDeactivation(User $admin, string $reason): void
    {
        AuditLogService::record(
            action: AuditAction::ACCOUNT_DEACTIVATED,
            entity: $admin,
            before: ['status' => 'active'],
            after: ['status' => 'inactive'],
            reason: $reason,
        );

        SecurityEventService::record(
            event: SecurityEvent::ACCOUNT_DEACTIVATED,
            severity: SecurityEvent::SEVERITY_WARNING,
            subject: $admin,
            context: ['scope' => 'platform'],
        );
    }
}

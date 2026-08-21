<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\User;
use App\Services\Auth\PortalLoginService;
use App\Support\Identity\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::with('company')
            ->where('token', $token)
            ->first();

        if (! $invitation || $invitation->status === 'accepted') {
            return redirect()->route('employee.login')
                ->with('error', 'رابط الدعوة غير صالح.');
        }

        // Expired link → resend only, NEVER a new account (H §5).
        if ($invitation->isExpired()) {
            return redirect()->route('employee.login')
                ->with('error', 'انتهت صلاحية رابط الدعوة. اطلب من مسؤول الحساب إعادة إرسالها — لن يُنشأ حساب جديد.');
        }

        return Inertia::render('auth/accept-invitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'name' => $invitation->name,
                'phone' => PhoneNumber::display($invitation->phone),
                'phone_locked' => $invitation->phone !== null,
                'company_name' => $invitation->company->name,
            ],
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = Invitation::with('company')
            ->where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (! $invitation) {
            return redirect()->route('employee.login')
                ->with('error', 'رابط الدعوة غير صالح.');
        }

        if ($invitation->isExpired()) {
            return redirect()->route('employee.login')
                ->with('error', 'انتهت صلاحية رابط الدعوة. اطلب من مسؤول الحساب إعادة إرسالها — لن يُنشأ حساب جديد.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // The imported phone is the invite's identity anchor — it is not
            // editable at acceptance; legacy email-only invites collect it here.
            'phone' => [$invitation->phone === null ? 'required' : 'nullable', 'string', 'max:20'],
        ], [
            'phone.required' => 'رقم الجوال مطلوب — تسجيل الدخول يتم برقم الجوال ورمز تحقق.',
        ]);

        $phone = $invitation->phone ?? PhoneNumber::normalize($data['phone']);

        if ($phone === null || ! preg_match('/^9665\d{8}$/', $phone)) {
            return back()->withErrors(['phone' => 'صيغة رقم الجوال السعودي غير صحيحة (05XXXXXXXX).']);
        }

        // No password on the employee portal (H §4) — the phone is the login
        // identity. A random secret satisfies the legacy NOT NULL column.
        $employee = Employee::create([
            'name' => $data['name'],
            'email' => $invitation->email,
            'phone' => $phone,
            'password' => Hash::make(Str::random(40)),
            'company_id' => $invitation->company_id,
            'department_id' => $invitation->department_id,
            'employee_number' => $invitation->employee_number,
            'status' => 'active',
        ]);

        $invitation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // The observer linked the employee to its global user (phone dedup:
        // a phone already registered under another company joins the SAME
        // account as a new membership); open a stamped 30-day session.
        $employee->refresh();
        app(PortalLoginService::class)->login(
            $request,
            'employee',
            $employee,
            User::findOrFail($employee->user_id),
        );

        return redirect()->route('employee.home')
            ->with('success', 'مرحباً بك! تم إنشاء حسابك بنجاح.');
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\User;
use App\Services\Auth\PortalLoginService;
use App\Services\Otp\OtpService;
use App\Support\Identity\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Invitation acceptance (H §5).
 *
 * The link is delivered over WhatsApp/SMS/mail and is therefore a token that
 * can be forwarded, logged, or read over someone's shoulder. It names the
 * invitation — it does **not** authenticate the person opening it. Before any
 * account is created or any session is opened, the acceptor proves control of
 * the phone that will become their login identity (phone + OTP, H §4). That
 * holds for both invitation shapes: the phone imported by the company, and
 * the phone a legacy email-only invitation asks for at acceptance.
 */
class InvitationController extends Controller
{
    public const OTP_PURPOSE = 'invitation';

    /** Seconds an acceptance may sit between the code being sent and entered. */
    private const PENDING_TTL = 600;

    public function __construct(private OtpService $otpService) {}

    public function show(Request $request, string $token): Response|RedirectResponse
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

        $pending = $this->pending($request, $invitation);

        return Inertia::render('auth/accept-invitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'name' => $invitation->name,
                'phone' => PhoneNumber::display($invitation->phone),
                'phone_locked' => $invitation->phone !== null,
                'company_name' => $invitation->company->name,
            ],
            // The code was sent to the invited number — the step is driven by
            // the server, never by a field the client can flip.
            'step' => $pending === null ? 'details' : 'otp',
            'pendingPhone' => $pending === null ? null : PhoneNumber::display($pending['phone']),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Step 1 — collect the details and send a login code to the phone that
     * will become the identity. Nothing is created and no session is opened.
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->pendingInvitation($token);

        if (! $invitation instanceof Invitation) {
            return $invitation;
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

        // Throws a validation error on the resend cap / active lock.
        $this->otpService->request($phone, self::OTP_PURPOSE);

        $request->session()->put($this->pendingKey($invitation), [
            'name' => $data['name'],
            'phone' => $phone,
            'sent_at' => now()->getTimestamp(),
        ]);

        return redirect()->route('invitation.show', $invitation->token)
            ->with('status', 'otp-sent');
    }

    /**
     * Step 2 — the code proves the acceptor holds the phone. Only now is the
     * employee created and a session opened.
     */
    public function verify(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->pendingInvitation($token);

        if (! $invitation instanceof Invitation) {
            return $invitation;
        }

        $data = $request->validate([
            'code' => ['required', 'digits:6'],
        ], [
            'code.required' => 'رمز التحقق مطلوب.',
            'code.digits' => 'الرمز مكوّن من ٦ أرقام.',
        ]);

        $pending = $this->pending($request, $invitation);

        if ($pending === null) {
            return redirect()->route('invitation.show', $invitation->token)
                ->with('error', 'انتهت مهلة رمز التحقق. اطلب رمزاً جديداً.');
        }

        $this->otpService->verify($pending['phone'], $data['code'], self::OTP_PURPOSE);

        // No password on the employee portal (H §4) — the phone is the login
        // identity. A random secret satisfies the legacy NOT NULL column.
        $employee = Employee::create([
            'name' => $pending['name'],
            'email' => $invitation->email,
            'phone' => $pending['phone'],
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

        $request->session()->forget($this->pendingKey($invitation));

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

    /**
     * The pending, unexpired invitation for the token — or the redirect that
     * refuses it.
     */
    private function pendingInvitation(string $token): Invitation|RedirectResponse
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

        return $invitation;
    }

    /**
     * @return array{name: string, phone: string, sent_at: int}|null
     */
    private function pending(Request $request, Invitation $invitation): ?array
    {
        $pending = $request->session()->get($this->pendingKey($invitation));

        if (! is_array($pending) || ! isset($pending['name'], $pending['phone'], $pending['sent_at'])) {
            return null;
        }

        if (now()->getTimestamp() - (int) $pending['sent_at'] > self::PENDING_TTL) {
            $request->session()->forget($this->pendingKey($invitation));

            return null;
        }

        return $pending;
    }

    private function pendingKey(Invitation $invitation): string
    {
        return 'invitation_otp.'.$invitation->id;
    }
}

<?php

namespace App\Http\Controllers\Auth\Concerns;

use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared phone + OTP login flow for the employee / company / partner
 * portals (H §4). The concrete controller defines the guard, labels and
 * the post-login destination.
 */
trait HandlesOtpLogin
{
    abstract protected function guardName(): string;

    abstract protected function guardLabel(): string;

    abstract protected function portalTag(): string;

    abstract protected function homeRoute(): string;

    protected function pendingKey(): string
    {
        return 'otp_pending.'.$this->guardName();
    }

    public function showLoginForm(Request $request): Response
    {
        $pending = $request->session()->get($this->pendingKey());
        $options = [];

        if (is_array($pending) && $this->pendingIsFresh($pending)) {
            $user = User::query()->find($pending['user_id']);

            if ($user !== null) {
                $options = $this->otpLogin->options($user, $this->guardName())->all();
            }
        }

        return Inertia::render('auth/otp-login', [
            'guard' => $this->guardName(),
            'guardLabel' => $this->guardLabel(),
            'portalTag' => $this->portalTag(),
            'step' => $options === [] ? 'phone' : 'context',
            'contextOptions' => $options,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function requestOtp(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
        ], [
            'phone.required' => 'رقم الجوال مطلوب.',
        ]);

        $user = $this->otpLogin->userForPhone($data['phone']);

        if ($user === null || $user->status !== 'active' || $this->otpLogin->options($user, $this->guardName())->isEmpty()) {
            throw ValidationException::withMessages([
                'phone' => ['لا يوجد حساب مرتبط بهذا الرقم في هذه البوابة.'],
            ]);
        }

        $this->otpService->request($data['phone'], 'login', $user);

        return back()->with('status', 'otp-sent');
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'code' => ['required', 'digits:6'],
        ], [
            'phone.required' => 'رقم الجوال مطلوب.',
            'code.required' => 'رمز التحقق مطلوب.',
            'code.digits' => 'الرمز مكوّن من ٦ أرقام.',
        ]);

        $this->otpService->verify($data['phone'], $data['code']);

        $user = $this->otpLogin->userForPhone($data['phone']);
        $options = $user !== null && $user->status === 'active'
            ? $this->otpLogin->options($user, $this->guardName())
            : collect();

        if ($user === null || $options->isEmpty()) {
            throw ValidationException::withMessages([
                'phone' => ['لا يوجد حساب مرتبط بهذا الرقم في هذه البوابة.'],
            ]);
        }

        if ($options->count() === 1) {
            $this->otpLogin->loginInto($request, $this->guardName(), $user, $options->first()['id']);

            return redirect()->route($this->homeRoute());
        }

        // Multi-scope user: pick the context explicitly (H §4).
        $request->session()->put($this->pendingKey(), [
            'user_id' => $user->id,
            'verified_at' => now()->getTimestamp(),
        ]);

        return redirect()->route($this->guardName().'.login');
    }

    public function chooseContext(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'context_id' => ['required', 'integer'],
        ]);

        $pending = $request->session()->get($this->pendingKey());

        if (! is_array($pending) || ! $this->pendingIsFresh($pending)) {
            $request->session()->forget($this->pendingKey());

            return redirect()->route($this->guardName().'.login')
                ->with('error', 'انتهت صلاحية الجلسة. أعد تسجيل الدخول.');
        }

        $user = User::query()->findOrFail($pending['user_id']);

        $this->otpLogin->loginInto($request, $this->guardName(), $user, (int) $data['context_id']);
        $request->session()->forget($this->pendingKey());

        $this->auditContextChange($user, (int) $data['context_id'], 'context_selected');

        return redirect()->route($this->homeRoute());
    }

    /**
     * Switch the active context of an already-authenticated multi-scope
     * user. Every switch is audited (H §4).
     */
    public function switchContext(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'context_id' => ['required', 'integer'],
        ]);

        $userId = $this->portalLogin->sessionUserId($request, $this->guardName())
            ?? $this->fallbackSessionUserId();

        if ($userId === null) {
            abort(403, 'تعذر تحديد هوية الجلسة.');
        }

        $user = User::query()->findOrFail($userId);

        $this->otpLogin->loginInto($request, $this->guardName(), $user, (int) $data['context_id']);

        $this->auditContextChange($user, (int) $data['context_id'], 'context_switched');

        return redirect()->route($this->homeRoute())->with('success', 'تم تبديل السياق بنجاح.');
    }

    /**
     * Resolve the global user for sessions without a login stamp
     * (e.g. test `actingAs`).
     */
    protected function fallbackSessionUserId(): ?int
    {
        $account = auth($this->guardName())->user();

        return $account?->user_id ?? null;
    }

    protected function auditContextChange(User $user, int $contextId, string $type): void
    {
        $companyId = in_array($this->guardName(), ['employee', 'company'], true) ? $contextId : null;

        ActivityLogService::log(
            $companyId,
            $user,
            $type,
            'تبديل سياق الجلسة النشط.',
            ['guard' => $this->guardName(), 'context_id' => $contextId],
            $user->id,
            $user->name,
        );
    }

    /**
     * @param  array{user_id?: int, verified_at?: int}  $pending
     */
    private function pendingIsFresh(array $pending): bool
    {
        return isset($pending['user_id'], $pending['verified_at'])
            && now()->getTimestamp() - (int) $pending['verified_at'] < 300;
    }
}

<?php

namespace App\Http\Middleware;

use App\Enums\EventStatus;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Notification;
use App\Models\User;
use App\Services\Auth\OtpLoginService;
use App\Services\Provider\ReliabilityService;
use App\Support\Identity\CurrentActor;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $guard = $this->detectGuard();
        $user = $guard ? auth($guard)->user() : null;

        // Resolve role label and permissions for guards that support roles
        $roleLabel = null;
        $permissions = [];

        if ($user && $guard === 'admin') {
            // A15: the union of every platform-scope role, not just the first
            // assignment — a user holding two staff roles was previously
            // served the nav of one of them.
            $roles = $user->platformRoles();
            $roleLabel = $roles->map(fn ($role) => $role->label())->implode(' · ') ?: null;
            $permissions = $user->platformPermissions();
        }

        if ($user && $guard === 'partner' && isset($user->role)) {
            $roleLabel = $user->role->label();
            $permissions = $user->role->permissions();
        }

        // Partner-specific permission sharing (for permission-gated nav)
        $partnerRole = null;
        if ($guard === 'partner' && $user) {
            $partnerRole = $user->role->value;
        }

        /*
         * H §11 — شريط المزوّد.
         *
         * أربعة أرقام تُرافق المزوّد على كل شاشة لا على لوحته وحدها: ما ينتظر
         * ردّه، وما التزم بتقديمه، وسلوكه في القبول وسرعة الرد. الطلب الذي
         * تنتهي مهلته يكلّفه نقاطاً، فإخفاء عدّاده خلف رابط «لوحة التحكم»
         * يجعل الشاشة التي يفتحها هي التي تقرر إن كان سيراه.
         */
        $providerBar = null;

        if ($guard === 'partner' && $user) {
            $providerBar = fn () => $this->providerBar($user);
        }

        // Multi-membership accounts get a context switcher (H §4/§18).
        // A15: the company portal shares it too — an account manager can hold
        // memberships in more than one company exactly like an employee, and
        // the sidebar picker reads this prop.
        $memberships = [];

        if ($guard === 'employee' && $user && $user->user_id !== null) {
            $memberships = app(OtpLoginService::class)
                ->options(User::find($user->user_id), 'employee')
                ->map(fn (array $option) => [
                    ...$option,
                    'active' => $option['id'] === $user->company_id,
                ])
                ->all();
        }

        if ($guard === 'company' && $user) {
            // The company guard authenticates a Company row; the acting global
            // user comes from the portal session stamp (never guessed).
            $actorId = CurrentActor::resolve()['id'];
            $globalUser = $actorId === null ? null : User::query()->find($actorId);

            if ($globalUser !== null) {
                $memberships = app(OtpLoginService::class)
                    ->options($globalUser, 'company')
                    ->map(fn (array $option) => [
                        ...$option,
                        'active' => $option['id'] === $user->id,
                    ])
                    ->all();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'guard' => $guard,
                'user' => $user,
                'role_label' => $roleLabel,
                'permissions' => $permissions,
                'partnerRole' => $partnerRole,
                'providerBar' => $providerBar,
                'partnerPermissions' => $permissions,
                'memberships' => $memberships,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadNotifications' => fn () => $guard === 'employee' && auth('employee')->check()
                ? Notification::where('notifiable_type', Employee::class)
                    ->where('notifiable_id', auth('employee')->id())
                    ->whereNull('read_at')
                    ->count()
                : 0,
        ];
    }

    private function detectGuard(): ?string
    {
        foreach (['admin', 'company', 'partner', 'employee'] as $guard) {
            if (auth($guard)->check()) {
                return $guard;
            }
        }

        return null;
    }

    /**
     * إحصاءات شريط المزوّد — كسولة، فلا تُحسب إلا حين تُقرأ.
     *
     * @return array<string, mixed>
     */
    private function providerBar(mixed $account): array
    {
        $provider = $account->resolvedPartner();

        $behaviors = app(ReliabilityService::class)->behaviors($provider);

        return [
            'pending_requests' => EventProviderRequest::query()
                ->where('partner_id', $provider->id)
                ->pending()
                ->count(),
            'upcoming_events' => Event::query()
                ->where('partner_id', $provider->id)
                ->whereIn('status', [EventStatus::Booked->value, EventStatus::Confirmed->value])
                ->whereDate('event_date', '>=', now()->toDateString())
                ->count(),
            'acceptance_rate' => $behaviors['acceptance_rate'],
            'avg_response_minutes' => $behaviors['avg_response_minutes'],
            'trade_name' => $provider->trade_name ?: $provider->name,
            'commercial_registration' => $provider->commercial_registration,
            'status' => $provider->status,
        ];
    }
}

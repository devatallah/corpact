<?php

namespace App\Http\Middleware;

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

        $authUser = $guard ? auth($guard)->user() : null;

        $businessPermissions = null;
        $businessRole = null;
        if ($guard === 'business' && $authUser) {
            $businessRole = $authUser->role->value;
            $businessPermissions = $authUser->role->permissions();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'guard' => $guard,
                'user' => $authUser,
                'businessRole' => $businessRole,
                'businessPermissions' => $businessPermissions,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadNotifications' => fn () => $guard === 'employee' && auth('employee')->check()
                ? \App\Models\Notification::where('notifiable_type', \App\Models\Employee::class)
                    ->where('notifiable_id', auth('employee')->id())
                    ->whereNull('read_at')
                    ->count()
                : 0,
        ];
    }

    private function detectGuard(): ?string
    {
        foreach (['admin', 'company', 'business', 'employee'] as $guard) {
            if (auth($guard)->check()) {
                return $guard;
            }
        }

        return null;
    }
}

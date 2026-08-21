<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Auth\PortalLoginService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforces the per-guard absolute session lifetime (30d / 14d / 12h) and the
 * auth-epoch revocation: bumping `users.auth_epoch` (departure cascade)
 * invalidates every stamped session of that user on its next request.
 */
class EnforcePortalSession
{
    private const GUARDS = ['admin', 'company', 'partner', 'employee'];

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasSession()) {
            return $next($request);
        }

        /** @var array<int, User|null> $users request-local cache */
        $users = [];

        foreach (self::GUARDS as $guard) {
            $meta = $request->session()->get(PortalLoginService::sessionKey($guard));

            if (! is_array($meta) || ! Auth::guard($guard)->check()) {
                continue;
            }

            $expired = isset($meta['expires_at']) && now()->getTimestamp() > (int) $meta['expires_at'];

            $revoked = false;

            if (! $expired && isset($meta['user_id'], $meta['epoch'])) {
                $userId = (int) $meta['user_id'];
                $users[$userId] ??= User::query()->find($userId);
                $user = $users[$userId];

                $revoked = $user === null
                    || $user->auth_epoch !== (int) $meta['epoch']
                    || $user->status !== 'active';
            }

            if ($expired || $revoked) {
                Auth::guard($guard)->logout();
                $request->session()->forget(PortalLoginService::sessionKey($guard));
            }
        }

        return $next($request);
    }
}

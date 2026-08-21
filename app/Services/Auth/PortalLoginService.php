<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Completes a portal login on top of the global identity: logs the portal
 * guard in with its profile row, and stamps the session with the global
 * user, its auth epoch (for immediate revocation) and the absolute expiry
 * of the guard (30d / 14d / 12h — ملحق أ).
 */
class PortalLoginService
{
    /**
     * Session key carrying per-guard auth metadata.
     */
    public static function sessionKey(string $guard): string
    {
        return "portal_auth.{$guard}";
    }

    public function login(Request $request, string $guard, Authenticatable $account, User $user): void
    {
        Auth::guard($guard)->login($account);

        $request->session()->regenerate();

        $lifetime = (int) config("portal.session_lifetimes.{$guard}", 720);

        $request->session()->put(self::sessionKey($guard), [
            'user_id' => $user->id,
            'epoch' => $user->auth_epoch,
            'expires_at' => now()->addMinutes($lifetime)->getTimestamp(),
        ]);
    }

    public function logout(Request $request, string $guard): void
    {
        Auth::guard($guard)->logout();
        $request->session()->forget(self::sessionKey($guard));
        $request->session()->regenerateToken();
    }

    /**
     * The global user behind the current portal session, if stamped.
     */
    public function sessionUserId(Request $request, string $guard): ?int
    {
        return $request->session()->get(self::sessionKey($guard).'.user_id');
    }
}

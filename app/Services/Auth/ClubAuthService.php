<?php

namespace App\Services\Auth;

use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClubAuthService
{
    /**
     * Attempt to authenticate a club, checking active status.
     *
     * @param  array{email: string, password: string}  $credentials
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        if (! Auth::guard('club')->attempt($credentials, $remember)) {
            return false;
        }

        if (Auth::guard('club')->user()->status !== 'active') {
            Auth::guard('club')->logout();

            return false;
        }

        return true;
    }

    /**
     * Log the club out without invalidating the entire session.
     */
    public function logout(Request $request): void
    {
        Auth::guard('club')->logout();
        $request->session()->regenerateToken();
    }

    /**
     * Get the currently authenticated club.
     */
    public function user(): ?Club
    {
        return Auth::guard('club')->user();
    }
}

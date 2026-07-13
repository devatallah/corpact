<?php

namespace App\Services\Auth;

use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartnerAuthService
{
    /**
     * Attempt to authenticate a partner, checking active status.
     *
     * @param  array{email: string, password: string}  $credentials
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        if (! Auth::guard('partner')->attempt($credentials, $remember)) {
            return false;
        }

        if (Auth::guard('partner')->user()->status !== 'active') {
            Auth::guard('partner')->logout();

            return false;
        }

        return true;
    }

    /**
     * Log the partner out without invalidating the entire session.
     */
    public function logout(Request $request): void
    {
        Auth::guard('partner')->logout();
        $request->session()->regenerateToken();
    }

    /**
     * Get the currently authenticated partner.
     */
    public function user(): ?Partner
    {
        return Auth::guard('partner')->user();
    }
}

<?php

namespace App\Services\Auth;

use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BusinessAuthService
{
    /**
     * Attempt to authenticate a business, checking active status.
     *
     * @param  array{email: string, password: string}  $credentials
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        if (! Auth::guard('business')->attempt($credentials, $remember)) {
            return false;
        }

        if (Auth::guard('business')->user()->status !== 'active') {
            Auth::guard('business')->logout();

            return false;
        }

        return true;
    }

    /**
     * Log the business out without invalidating the entire session.
     */
    public function logout(Request $request): void
    {
        Auth::guard('business')->logout();
        $request->session()->regenerateToken();
    }

    /**
     * Get the currently authenticated business.
     */
    public function user(): ?Business
    {
        return Auth::guard('business')->user();
    }
}

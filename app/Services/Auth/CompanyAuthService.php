<?php

namespace App\Services\Auth;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyAuthService
{
    /**
     * Attempt to authenticate a company, checking active status.
     *
     * @param  array{email: string, password: string}  $credentials
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        if (! Auth::guard('company')->attempt($credentials, $remember)) {
            return false;
        }

        if (Auth::guard('company')->user()->status !== 'active') {
            Auth::guard('company')->logout();

            return false;
        }

        return true;
    }

    /**
     * Log the company out without invalidating the entire session.
     */
    public function logout(Request $request): void
    {
        Auth::guard('company')->logout();
        $request->session()->regenerateToken();
    }

    /**
     * Get the currently authenticated company.
     */
    public function user(): ?Company
    {
        return Auth::guard('company')->user();
    }
}

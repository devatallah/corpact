<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthService
{
    /**
     * Attempt to authenticate an admin user.
     *
     * @param  array{email: string, password: string}  $credentials
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        return Auth::guard('admin')->attempt($credentials, $remember);
    }

    /**
     * Log the admin user out without invalidating the entire session.
     */
    public function logout(Request $request): void
    {
        Auth::guard('admin')->logout();
        $request->session()->regenerateToken();
    }

    /**
     * Get the currently authenticated admin user.
     */
    public function user(): ?User
    {
        return Auth::guard('admin')->user();
    }
}

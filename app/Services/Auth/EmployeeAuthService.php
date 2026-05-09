<?php

namespace App\Services\Auth;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeAuthService
{
    /**
     * Attempt to authenticate an employee, checking active status.
     *
     * @param  array{email: string, password: string}  $credentials
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        if (! Auth::guard('employee')->attempt($credentials, $remember)) {
            return false;
        }

        if (Auth::guard('employee')->user()->status !== 'active') {
            Auth::guard('employee')->logout();

            return false;
        }

        return true;
    }

    /**
     * Log the employee out without invalidating the entire session.
     */
    public function logout(Request $request): void
    {
        Auth::guard('employee')->logout();
        $request->session()->regenerateToken();
    }

    /**
     * Get the currently authenticated employee.
     */
    public function user(): ?Employee
    {
        return Auth::guard('employee')->user();
    }
}

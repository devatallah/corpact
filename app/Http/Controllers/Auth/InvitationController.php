<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::with('company')
            ->where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (! $invitation) {
            return redirect()->route('employee.login')
                ->with('error', 'رابط الدعوة غير صالح أو منتهي الصلاحية.');
        }

        return Inertia::render('auth/accept-invitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'company_name' => $invitation->company->name,
            ],
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = Invitation::with('company')
            ->where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (! $invitation) {
            return redirect()->route('employee.login')
                ->with('error', 'رابط الدعوة غير صالح أو منتهي الصلاحية.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $employee = Employee::create([
            'name' => $data['name'],
            'email' => $invitation->email,
            'password' => Hash::make($data['password']),
            'company_id' => $invitation->company_id,
            'status' => 'active',
        ]);

        $invitation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        Auth::guard('employee')->login($employee);
        $request->session()->regenerate();

        return redirect()->route('employee.home')
            ->with('success', 'مرحباً بك! تم إنشاء حسابك بنجاح.');
    }
}

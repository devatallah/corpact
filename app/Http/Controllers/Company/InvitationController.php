<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Services\Company\InvitationService;
use Illuminate\Http\RedirectResponse;

class InvitationController extends Controller
{
    public function __construct(private InvitationService $invitations) {}

    /**
     * Resend an invitation (pending or expired) with a fresh 7-day window.
     * An expired link is only ever resent — never a new account (H §5).
     */
    public function resend(Invitation $invitation): RedirectResponse
    {
        $this->invitations->resend($invitation);

        return back()->with('success', 'تمت إعادة إرسال الدعوة — الرابط صالح 7 أيام.');
    }
}

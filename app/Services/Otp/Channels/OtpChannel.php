<?php

namespace App\Services\Otp\Channels;

/**
 * Delivery abstraction for login codes. A14 adds the WhatsApp Business and
 * SMS drivers behind this same contract; login must never depend on a single
 * channel (H §4 — «الدخول يجب ألا يتعطل بتعطل قناة واحدة»).
 */
interface OtpChannel
{
    /**
     * Deliver the code. Return true when delivery is confirmed synchronously
     * (the fallback job then never fires); asynchronous channels return false
     * and confirm later by stamping `otp_codes.delivered_at`.
     */
    public function send(string $phone, string $code, string $purpose): bool;
}

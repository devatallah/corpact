<?php

namespace App\Services\Otp\Channels;

use Illuminate\Support\Facades\Log;

/**
 * Dev/demo driver: the code lands in the application log. Delivery is
 * confirmed synchronously, so the SMS fallback never fires for it.
 */
class LogOtpChannel implements OtpChannel
{
    public function send(string $phone, string $code, string $purpose): bool
    {
        Log::info("OTP [{$purpose}] for {$phone}: {$code}");

        return true;
    }
}

<?php

namespace Tests\Support;

use App\Services\Otp\Channels\OtpChannel;

/**
 * Captures issued OTP codes so tests can drive the login flows end-to-end.
 * Bind it in a test via `fakeOtp()` (see Pest.php).
 */
class FakeOtpChannel implements OtpChannel
{
    /** @var array<int, array{phone: string, code: string, purpose: string}> */
    public array $sent = [];

    public function send(string $phone, string $code, string $purpose): bool
    {
        $this->sent[] = ['phone' => $phone, 'code' => $code, 'purpose' => $purpose];

        return true;
    }

    public function lastCode(): ?string
    {
        return $this->sent === [] ? null : end($this->sent)['code'];
    }
}

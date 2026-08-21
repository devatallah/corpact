<?php

namespace App\Jobs;

use App\Models\OtpCode;
use App\Services\Otp\OtpService;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

/**
 * The 60-second SMS-fallback hook (H §4 — «إذا لم يصل رمز الواتساب خلال
 * 60 ثانية، يُرسل تلقائياً كرسالة نصية»). Dispatched with a delay at send
 * time; fires only when the primary channel has not confirmed delivery and
 * the code is still usable.
 *
 * SECURITY (A14 — fixes the issue A3 flagged in §4 note 9): a delayed job
 * sits in the queue store for a full minute, so it must **never** carry the
 * login code in plaintext. Two independent guards:
 *
 *   1. the code is carried as a `Crypt`-encrypted string, so even a payload
 *      dumped from the queue table (or a failed_jobs row) reveals nothing;
 *   2. the job is `ShouldBeEncrypted`, so the whole serialized payload is
 *      encrypted at rest by the queue itself.
 *
 * The plaintext never leaves `OtpService` — and an undecryptable payload
 * fails closed (no send) rather than leaking or crashing the login path.
 */
class SendOtpFallback implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $encryptedCode  ciphertext — see `for()`
     */
    public function __construct(public int $otpCodeId, public string $encryptedCode) {}

    /**
     * Build the job from a plaintext code, encrypting it on the way in.
     */
    public static function for(int $otpCodeId, string $code): self
    {
        return new self($otpCodeId, Crypt::encryptString($code));
    }

    public function handle(OtpService $otpService): void
    {
        $otp = OtpCode::query()->find($this->otpCodeId);

        if ($otp === null
            || $otp->isConsumed()
            || $otp->isExpired()
            || $otp->delivered_at !== null
            || $otp->fallback_sent_at !== null) {
            return;
        }

        try {
            $code = Crypt::decryptString($this->encryptedCode);
        } catch (\Throwable $e) {
            // Fail closed: never guess, never resend something else silently.
            Log::error('تعذّر فك تشفير رمز الدخول في مهمة القناة البديلة.', [
                'otp_code_id' => $this->otpCodeId,
                'error' => $e->getMessage(),
            ]);

            return;
        }

        $otpService->sendThroughFallback($otp, $code);
    }
}

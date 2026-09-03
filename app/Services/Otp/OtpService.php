<?php

namespace App\Services\Otp;

use App\Enums\DeliveryStatus;
use App\Jobs\SendOtpFallback;
use App\Models\NotificationLog;
use App\Models\OtpCode;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Services\Audit\SecurityEventService;
use App\Services\Otp\Channels\OtpChannel;
use App\Support\Identity\PhoneNumber;
use Illuminate\Support\Facades\App;
use Illuminate\Validation\ValidationException;

/**
 * Issues and verifies login codes per H §4 / ملحق أ:
 * 6 digits · 5-minute validity · max 3 sends/hour/phone ·
 * 5 wrong entries → 15-minute lock · WhatsApp→SMS fallback after 60s.
 */
class OtpService
{
    /**
     * Issue and deliver a code for the phone.
     *
     * @throws ValidationException on the resend cap or an active lock
     */
    public function request(string $phone, string $purpose = 'login', ?User $user = null): OtpCode
    {
        $phone = PhoneNumber::normalize($phone) ?? throw ValidationException::withMessages([
            'phone' => ['رقم الجوال غير صالح.'],
        ]);

        $latest = $this->latestFor($phone, $purpose);

        if ($latest?->isLocked()) {
            throw ValidationException::withMessages([
                'phone' => ['تم قفل المحاولة مؤقتاً بعد محاولات خاطئة متكررة. حاول لاحقاً.'],
            ]);
        }

        $sendsLastHour = OtpCode::query()
            ->where('phone', $phone)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($sendsLastHour >= (int) config('otp.max_sends_per_hour')) {
            throw ValidationException::withMessages([
                'phone' => ['لا يمكن طلب الرمز أكثر من ٣ مرات في الساعة لنفس الرقم. حاول لاحقاً.'],
            ]);
        }

        // Invalidate previous outstanding codes for this phone+purpose.
        OtpCode::query()
            ->where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->update(['expires_at' => now()]);

        $code = $this->generateCode();

        $otp = OtpCode::query()->create([
            'phone' => $phone,
            'purpose' => $purpose,
            'user_id' => $user?->id,
            'code_hash' => $this->hash($phone, $code),
            'expires_at' => now()->addSeconds((int) config('otp.ttl_seconds')),
            'channel' => config('otp.channel'),
        ]);

        $this->deliver($otp, $code);

        return $otp;
    }

    /**
     * Verify a submitted code. Consumes it on success.
     *
     * @throws ValidationException
     */
    public function verify(string $phone, string $code, string $purpose = 'login'): OtpCode
    {
        $phone = PhoneNumber::normalize($phone) ?? throw ValidationException::withMessages([
            'phone' => ['رقم الجوال غير صالح.'],
        ]);

        $otp = $this->latestFor($phone, $purpose);

        if ($otp === null || $otp->isConsumed()) {
            throw ValidationException::withMessages([
                'code' => ['لا يوجد رمز صالح لهذا الرقم. اطلب رمزاً جديداً.'],
            ]);
        }

        if ($otp->isLocked()) {
            throw ValidationException::withMessages([
                'code' => ['تم قفل المحاولة ١٥ دقيقة بعد محاولات خاطئة متكررة.'],
            ]);
        }

        if ($otp->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['انتهت صلاحية الرمز. اطلب رمزاً جديداً.'],
            ]);
        }

        if (! hash_equals($otp->code_hash, $this->hash($phone, $code))) {
            $otp->increment('attempts');

            // A15 — H §19: «سجل أحداث أمنية منفصل (دخول فاشل …)»؛ الدخول هنا
            // برمز لا بكلمة مرور، فحدث `Failed` الإطاري لا يقع.
            SecurityEventService::record(
                event: SecurityEvent::OTP_FAILED,
                severity: SecurityEvent::SEVERITY_WARNING,
                context: ['purpose' => $purpose, 'attempts' => (int) $otp->attempts],
                actorIdentifier: SecurityEventService::mask($phone),
                resolveActor: false,
            );

            if ($otp->attempts >= (int) config('otp.max_attempts')) {
                $otp->forceFill(['locked_until' => now()->addMinutes((int) config('otp.lock_minutes'))])->save();

                SecurityEventService::record(
                    event: SecurityEvent::LOGIN_LOCKOUT,
                    severity: SecurityEvent::SEVERITY_CRITICAL,
                    context: ['purpose' => $purpose, 'lock_minutes' => (int) config('otp.lock_minutes')],
                    actorIdentifier: SecurityEventService::mask($phone),
                    resolveActor: false,
                );

                throw ValidationException::withMessages([
                    'code' => ['تم قفل المحاولة ١٥ دقيقة بعد ٥ محاولات خاطئة.'],
                ]);
            }

            throw ValidationException::withMessages([
                'code' => ['الرمز غير صحيح.'],
            ]);
        }

        $otp->forceFill(['consumed_at' => now()])->save();

        return $otp;
    }

    /**
     * Deliver through the fallback channel (invoked by the delayed job when
     * the primary channel has not confirmed within 60 seconds).
     */
    public function sendThroughFallback(OtpCode $otp, string $code): void
    {
        $fallback = config('otp.fallback_channel');

        if ($fallback === null) {
            return;
        }

        $channel = $this->channel($fallback);
        $delivered = $channel->send($otp->phone, $code, $otp->purpose);

        $this->recordAttempt($otp, (string) $fallback, $delivered, fallback: true);

        $otp->forceFill([
            'fallback_sent_at' => now(),
            'delivered_at' => $delivered ? now() : $otp->delivered_at,
        ])->save();
    }

    private function deliver(OtpCode $otp, string $code): void
    {
        $delivered = $this->channel((string) config('otp.channel'))->send($otp->phone, $code, $otp->purpose);

        $this->recordAttempt($otp, (string) config('otp.channel'), $delivered, fallback: false);

        if ($delivered) {
            $otp->forceFill(['delivered_at' => now()])->save();
        }

        if (config('otp.fallback_channel') !== null) {
            // A14: the delayed payload carries the code encrypted, never in
            // plaintext (see SendOtpFallback) — the issue A3 flagged.
            dispatch(SendOtpFallback::for($otp->id, $code))
                ->delay(now()->addSeconds((int) config('otp.fallback_after_seconds')));
        }
    }

    /**
     * A14 — رموز الدخول تدخل `notification_logs` كبقية الرسائل ليجيب الدعم عن
     * «ما وصلني الرمز» (G — دليل وكيل الدعم).
     *
     * **الرمز نفسه لا يُكتب في السجل أبداً**: `rendered_body` يبقى فارغاً وهو
     * الاستثناء الوحيد عن تسجيل النص المرسوم.
     */
    private function recordAttempt(OtpCode $otp, string $channel, bool $delivered, bool $fallback): void
    {
        NotificationLog::query()->create([
            'template_key' => 'auth.otp',
            'recipient_type' => $otp->user_id !== null ? (new User)->getMorphClass() : null,
            'recipient_id' => $otp->user_id,
            'recipient_phone' => $otp->phone,
            'channel' => $channel,
            'status' => $delivered ? DeliveryStatus::Delivered : DeliveryStatus::Sent,
            'attempt' => $fallback ? 2 : 1,
            'reason' => $fallback ? 'otp_fallback' : null,
            'variables' => [],
            'rendered_body' => null,
            'locale' => 'ar',
            'purpose' => $otp->purpose,
            'queued_at' => now(),
            'sent_at' => now(),
            'delivered_at' => $delivered ? now() : null,
        ]);
    }

    private function channel(string $name): OtpChannel
    {
        // Tests (and future drivers) may bind the interface directly.
        if ($name === (string) config('otp.channel') && App::bound(OtpChannel::class)) {
            return App::make(OtpChannel::class);
        }

        $class = config("otp.channels.{$name}")
            ?? throw new \InvalidArgumentException("Unknown OTP channel [{$name}].");

        return App::make($class);
    }

    private function latestFor(string $phone, string $purpose): ?OtpCode
    {
        return OtpCode::query()
            ->where('phone', $phone)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();
    }

    private function generateCode(): string
    {
        $length = (int) config('otp.length');

        // رمز ثابت للتطوير المحلي وحده — انظر التحذير في config/otp.php.
        $fixed = config('otp.fixed_code');

        if ($fixed !== null && $fixed !== '' && app()->environment('local')) {
            return str_pad((string) $fixed, $length, '0', STR_PAD_LEFT);
        }

        return str_pad((string) random_int(0, 999999), $length, '0', STR_PAD_LEFT);
    }

    private function hash(string $phone, string $code): string
    {
        return hash_hmac('sha256', $phone.'|'.$code, (string) config('app.key'));
    }
}

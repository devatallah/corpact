<?php

use App\Jobs\SendOtpFallback;
use App\Models\NotificationLog;
use App\Models\OtpCode;
use App\Services\Otp\OtpService;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Queue;

/**
 * H §4 — «إذا لم يصل رمز الواتساب خلال 60 ثانية، يُرسل تلقائياً كرسالة نصية.
 * الدخول يجب ألا يتعطل بتعطل قناة واحدة».
 *
 * وملاحظة A3 الأمنية (§4 بند 9): الكود النصي كان يركب حمولة الـ job المؤجل.
 */
it('never puts the login code in the delayed job payload in plaintext', function () {
    $job = SendOtpFallback::for(42, '654321');

    expect($job->encryptedCode)->not->toBe('654321')
        ->and(str_contains($job->encryptedCode, '654321'))->toBeFalse();

    // ولا في الحمولة المسلسلة التي تجلس في جدول الطابور دقيقة كاملة.
    expect(str_contains(serialize($job), '654321'))->toBeFalse();
});

it('marks the fallback job as queue-encrypted so the payload is encrypted at rest too', function () {
    expect(SendOtpFallback::for(1, '111111'))->toBeInstanceOf(ShouldBeEncrypted::class);
});

it('still delivers the very same code the user was told to expect', function () {
    $job = SendOtpFallback::for(7, '246810');

    expect(Crypt::decryptString($job->encryptedCode))->toBe('246810');
});

it('fails closed on an undecryptable payload instead of guessing or crashing login', function () {
    $otp = OtpCode::query()->create([
        'phone' => '966551234567',
        'purpose' => 'login',
        'code_hash' => 'x',
        'expires_at' => now()->addMinutes(5),
        'channel' => 'log',
    ]);

    config(['otp.fallback_channel' => 'log']);

    $job = new SendOtpFallback($otp->id, 'not-a-valid-ciphertext');
    $job->handle(app(OtpService::class));

    expect($otp->fresh()->fallback_sent_at)->toBeNull();
});

it('dispatches the fallback with a 60-second delay when a fallback channel is configured', function () {
    config(['otp.fallback_channel' => 'log']);

    Queue::fake();
    fakeOtp();

    app(OtpService::class)->request('0551234567');

    Queue::assertPushed(
        SendOtpFallback::class,
        fn ($job) => $job->delay !== null && round(now()->diffInSeconds($job->delay)) === 60.0,
    );
});

it('skips the fallback once the primary channel confirmed delivery', function () {
    config(['otp.fallback_channel' => 'log']);

    $otp = fakeOtp();

    app(OtpService::class)->request('0551234567');

    $code = OtpCode::query()->latest('id')->first();

    // القناة الأساسية أكدت التسليم (FakeOtpChannel يعيد true).
    expect($code->delivered_at)->not->toBeNull()
        ->and($code->fallback_sent_at)->toBeNull()
        ->and($otp->sent)->toHaveCount(1);
});

it('logs the OTP attempt for support without ever storing the code itself', function () {
    fakeOtp();

    app(OtpService::class)->request('0551234567');

    $log = NotificationLog::query()->where('template_key', 'auth.otp')->first();

    expect($log)->not->toBeNull()
        ->and($log->recipient_phone)->toBe('966551234567')
        ->and($log->status->value)->toBe('delivered')
        ->and($log->rendered_body)->toBeNull();
});

it('records the fallback attempt as a second attempt on the SMS channel', function () {
    config(['otp.fallback_channel' => 'log']);

    $otp = OtpCode::query()->create([
        'phone' => '966551234567',
        'purpose' => 'login',
        'code_hash' => 'x',
        'expires_at' => now()->addMinutes(5),
        'channel' => 'whatsapp',
    ]);

    app(OtpService::class)->sendThroughFallback($otp, '135790');

    $log = NotificationLog::query()->where('template_key', 'auth.otp')->latest('id')->first();

    expect($log->attempt)->toBe(2)
        ->and($log->reason)->toBe('otp_fallback')
        ->and($log->rendered_body)->toBeNull()
        ->and($otp->fresh()->fallback_sent_at)->not->toBeNull();
});

it('does not depend on a single channel: an unconfigured SMS fallback is a clean no-op, not an exception', function () {
    config(['otp.fallback_channel' => 'sms', 'messaging.sms.enabled' => false]);

    $otp = OtpCode::query()->create([
        'phone' => '966551234567',
        'purpose' => 'login',
        'code_hash' => 'x',
        'expires_at' => now()->addMinutes(5),
        'channel' => 'whatsapp',
    ]);

    app(OtpService::class)->sendThroughFallback($otp, '135790');

    expect($otp->fresh()->fallback_sent_at)->not->toBeNull()
        ->and($otp->fresh()->delivered_at)->toBeNull();
});

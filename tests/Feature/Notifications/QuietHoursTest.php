<?php

use App\Jobs\DeliverOutboundMessage;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\NotificationLog;
use App\Services\Messaging\MessageDispatcher;
use App\Services\Notifications\QuietHours;
use App\Services\Otp\OtpService;
use App\Support\Notify;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Queue;
use Tests\Support\PrimaryFakeChannel;

/**
 * H §14 — «سياسة عدم الإزعاج: من 22:00 إلى 08:00 بتوقيت الرياض تُؤجَّل الرسائل
 * غير الإلزامية — ورموز الدخول مستثناة دائماً».
 */
function quietChannel(): PrimaryFakeChannel
{
    $channel = new PrimaryFakeChannel;

    app()->instance(PrimaryFakeChannel::class, $channel);
    config([
        'messaging.channels.primary' => PrimaryFakeChannel::class,
        'messaging.chain' => ['primary'],
    ]);

    return $channel;
}

/** 23:30 بتوقيت الرياض — داخل نافذة الهدوء. */
function atRiyadhNight(): void
{
    test()->travelTo(Carbon::parse('2026-08-20 23:30', 'Asia/Riyadh')->utc());
}

/** 14:00 بتوقيت الرياض — خارج النافذة. */
function atRiyadhAfternoon(): void
{
    test()->travelTo(Carbon::parse('2026-08-20 14:00', 'Asia/Riyadh')->utc());
}

it('knows the Riyadh quiet window regardless of the app timezone', function () {
    $quiet = app(QuietHours::class);

    expect($quiet->isQuietAt(Carbon::parse('2026-08-20 23:30', 'Asia/Riyadh')))->toBeTrue()
        ->and($quiet->isQuietAt(Carbon::parse('2026-08-20 22:00', 'Asia/Riyadh')))->toBeTrue()
        ->and($quiet->isQuietAt(Carbon::parse('2026-08-21 03:00', 'Asia/Riyadh')))->toBeTrue()
        ->and($quiet->isQuietAt(Carbon::parse('2026-08-21 07:59', 'Asia/Riyadh')))->toBeTrue()
        ->and($quiet->isQuietAt(Carbon::parse('2026-08-21 08:00', 'Asia/Riyadh')))->toBeFalse()
        ->and($quiet->isQuietAt(Carbon::parse('2026-08-20 21:59', 'Asia/Riyadh')))->toBeFalse();
});

it('defers an optional message inside the quiet window to 08:00 Riyadh', function () {
    $channel = quietChannel();
    atRiyadhNight();

    // طابور مزيّف: مشغّل sync يتجاهل التأخير وينفّذ فوراً، فيخفي ما نختبره.
    Queue::fake();

    $employee = Employee::factory()->create(['phone' => '0551234567']);

    Notify::send('event.reminder.24h', $employee, [
        'community' => 'البادل', 'date' => '2026-08-22 20:00', 'location' => 'ملعب 3',
    ]);

    $log = NotificationLog::query()->where('channel', 'primary')->first();

    expect($log->status->value)->toBe('deferred')
        ->and($log->deferred_until)->not->toBeNull()
        ->and($log->deferred_until->copy()->timezone('Asia/Riyadh')->format('H:i'))->toBe('08:00')
        ->and($log->deferred_until->copy()->timezone('Asia/Riyadh')->toDateString())->toBe('2026-08-21');

    // المهمة دخلت الطابور بتأخير حتى 08:00 لا بلا تأخير.
    Queue::assertPushed(
        DeliverOutboundMessage::class,
        fn ($job) => $job->delay !== null
            && $job->delay->copy()->timezone('Asia/Riyadh')->format('H:i') === '08:00',
    );

    // ولم تُنادَ القناة بعد.
    expect($channel->sent)->toBeEmpty();
});

it('sends the deferred message when the job finally runs at 08:00', function () {
    $channel = quietChannel();
    atRiyadhNight();

    Queue::fake();

    $employee = Employee::factory()->create(['phone' => '0551234567']);

    Notify::send('event.reminder.24h', $employee, [
        'community' => 'البادل', 'date' => '2026-08-22 20:00', 'location' => 'ملعب 3',
    ]);

    $log = NotificationLog::query()->where('channel', 'primary')->first();

    // الصباح: المهمة المؤجَّلة تُنفَّذ — الحالة deferred ليست نهائية.
    test()->travelTo($log->deferred_until->copy()->addMinute());
    app(MessageDispatcher::class)->attempt($log->fresh());

    expect($channel->sent)->toHaveCount(1)
        ->and($log->fresh()->status->value)->toBe('delivered');
});

it('still writes the in-app notification immediately during quiet hours — it wakes nobody', function () {
    quietChannel();
    atRiyadhNight();

    $employee = Employee::factory()->create(['phone' => '0551234567']);

    $notification = Notify::send('event.reminder.24h', $employee, [
        'community' => 'البادل', 'date' => '2026-08-22 20:00', 'location' => 'ملعب 3',
    ]);

    expect($notification)->not->toBeNull()
        ->and(Notification::query()->where('notifiable_id', $employee->id)->count())->toBe(1)
        ->and(NotificationLog::query()->where('channel', 'in_app')->first()->status->value)->toBe('delivered');
});

it('sends a mandatory message during quiet hours without deferring it', function () {
    $channel = quietChannel();
    atRiyadhNight();

    $employee = Employee::factory()->create(['phone' => '0551234567']);

    Notify::send('payment.demand', $employee, [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '23:59', 'url' => 'https://x.test/pay',
    ]);

    expect($channel->sent)->toHaveCount(1)
        ->and(NotificationLog::query()->where('channel', 'primary')->first()->status->value)->toBe('delivered');
});

it('never defers a login code — the OTP path does not consult quiet hours at all', function () {
    atRiyadhNight();

    $otp = fakeOtp();

    app(OtpService::class)->request('0551234567');

    expect($otp->sent)->toHaveCount(1);

    $log = NotificationLog::query()->where('template_key', 'auth.otp')->first();

    expect($log->status->value)->toBe('delivered')
        ->and($log->deferred_until)->toBeNull();
});

it('sends an optional message straight away outside the quiet window', function () {
    $channel = quietChannel();
    atRiyadhAfternoon();

    $employee = Employee::factory()->create(['phone' => '0551234567']);

    Notify::send('event.reminder.24h', $employee, [
        'community' => 'البادل', 'date' => '2026-08-22 20:00', 'location' => 'ملعب 3',
    ]);

    expect($channel->sent)->toHaveCount(1)
        ->and(NotificationLog::query()->where('channel', 'primary')->first()->deferred_until)->toBeNull();
});

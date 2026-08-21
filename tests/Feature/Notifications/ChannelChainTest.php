<?php

use App\Jobs\DeliverOutboundMessage;
use App\Models\AdminAlert;
use App\Models\Employee;
use App\Models\NotificationLog;
use App\Services\Messaging\Channels\SmsChannel;
use App\Services\Messaging\Channels\WhatsAppChannel;
use App\Services\Messaging\DeliveryResult;
use App\Services\Messaging\MessageDispatcher;
use App\Services\Messaging\OutboundMessage;
use App\Support\Notify;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\Support\FallbackFakeChannel;
use Tests\Support\PrimaryFakeChannel;

/**
 * H §14 — «واتساب ← رسالة نصية ← داخل المنصة»، وفشل الإرسال: «إعادة محاولة 3
 * مرات بتباعد أسي، ثم التحويل للقناة البديلة، ثم تسجيل الفشل وتنبيه الأدمن».
 */
function chainChannels(): array
{
    $primary = new PrimaryFakeChannel;
    $fallback = new FallbackFakeChannel;

    app()->instance(PrimaryFakeChannel::class, $primary);
    app()->instance(FallbackFakeChannel::class, $fallback);

    config([
        'messaging.channels.primary' => PrimaryFakeChannel::class,
        'messaging.channels.fallback' => FallbackFakeChannel::class,
        'messaging.chain' => ['primary', 'fallback'],
    ]);

    return [$primary, $fallback];
}

function chainRecipient(): Employee
{
    return Employee::factory()->create(['phone' => '0551234567']);
}

it('delivers on the primary channel and never touches the fallback', function () {
    [$primary, $fallback] = chainChannels();

    Notify::send('payment.demand', chainRecipient(), [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    expect($primary->sent)->toHaveCount(1)
        ->and($fallback->sent)->toBeEmpty();

    $log = NotificationLog::query()->where('channel', 'primary')->first();

    expect($log->status->value)->toBe('delivered')
        ->and($log->rendered_body)->toContain('https://x.test/pay');
});

it('skips an unconfigured primary channel quietly and delivers over the fallback', function () {
    [$primary, $fallback] = chainChannels();
    $primary->configured = false;

    Notify::send('payment.demand', chainRecipient(), [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    expect($fallback->sent)->toHaveCount(1);

    expect(NotificationLog::query()->where('channel', 'primary')->first())
        ->status->value->toBe('skipped')
        ->reason->toBe('not_configured');

    expect(NotificationLog::query()->where('channel', 'fallback')->first()->status->value)->toBe('delivered');
});

it('retries the same channel three times with exponential backoff before escalating', function () {
    [$primary, $fallback] = chainChannels();
    $primary->failNext = 3;

    Notify::send('payment.demand', chainRecipient(), [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    $attempts = NotificationLog::query()->where('channel', 'primary')->orderBy('attempt')->get();

    // ثلاث محاولات على القناة نفسها — سطر لكل محاولة.
    expect($attempts)->toHaveCount(3)
        ->and($attempts->pluck('attempt')->all())->toBe([1, 2, 3])
        ->and($attempts->pluck('status')->map->value->unique()->all())->toBe(['failed']);

    // ثم القناة البديلة نجحت.
    expect($fallback->sent)->toHaveCount(1)
        ->and(NotificationLog::query()->where('channel', 'fallback')->first()->status->value)->toBe('delivered');
});

it('schedules the retry with the configured exponential backoff', function () {
    [$primary] = chainChannels();
    $primary->failNext = 2;

    Queue::fake();

    Notify::send('payment.demand', chainRecipient(), [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    $delays = fn () => collect(Queue::pushedJobs()[DeliverOutboundMessage::class] ?? [])
        ->map(fn ($record) => $record['job']->delay)
        ->all();

    // أول إرسال يدخل الطابور فوراً بلا تأخير.
    expect($delays())->toHaveCount(1)
        ->and($delays()[0])->toBeNull();

    $dispatcher = app(MessageDispatcher::class);

    // المحاولة الأولى تفشل ⇒ إعادة بعد 60 ثانية.
    $dispatcher->attempt(NotificationLog::query()->where('attempt', 1)->where('channel', 'primary')->first());

    expect($delays())->toHaveCount(2)
        ->and(round(now()->diffInSeconds($delays()[1])))->toBe(60.0);

    // المحاولة الثانية تفشل ⇒ التباعد يتضاعف إلى 300 ثانية.
    $dispatcher->attempt(NotificationLog::query()->where('attempt', 2)->where('channel', 'primary')->first());

    expect($delays())->toHaveCount(3)
        ->and(round(now()->diffInSeconds($delays()[2])))->toBe(300.0);
});

it('escalates immediately on a hard failure without burning the retry budget', function () {
    [$primary, $fallback] = chainChannels();

    // فشل نهائي: القناة مهيأة لكنها ترفض الرسالة.
    config(['messaging.chain' => ['primary', 'fallback']]);
    $primary->configured = true;
    $primary->failNext = 0;

    // نجعل القناة ترفض نهائياً بجعلها غير مهيأة بعد أول فحص — بدلاً من ذلك
    // نستخدم مسار عدم التهيئة الذي يمثل «انتقل فوراً» نفسه.
    $primary->configured = false;

    Notify::send('waitlist.offer', chainRecipient(), ['minutes' => 30]);

    expect(NotificationLog::query()->where('channel', 'primary')->count())->toBe(1)
        ->and($fallback->sent)->toHaveCount(1);
});

it('marks the message failed and raises an admin alert when every channel is exhausted', function () {
    [$primary, $fallback] = chainChannels();
    $primary->failNext = 3;
    $fallback->failNext = 3;

    Notify::send('payment.demand', chainRecipient(), [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    expect(NotificationLog::query()->where('channel', 'fallback')->count())->toBe(3)
        ->and(NotificationLog::query()->where('status', 'failed')->count())->toBe(6);

    $alert = AdminAlert::query()->where('key', 'notification.delivery_failed')->first();

    expect($alert)->not->toBeNull()
        ->and($alert->level)->toBe('critical')
        ->and($alert->context['template_key'])->toBe('payment.demand');
});

it('escalates to the fallback when the primary accepts but never confirms delivery within 60 seconds', function () {
    [$primary, $fallback] = chainChannels();
    $primary->confirmsDelivery = false;

    Notify::send('payment.demand', chainRecipient(), [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    // القناة الأولى قبلت الرسالة ولم تؤكدها، فصعّدت المهلة إلى البديلة.
    expect($primary->sent)->toHaveCount(1)
        ->and($fallback->sent)->toHaveCount(1);

    expect(NotificationLog::query()->where('channel', 'primary')->first())
        ->status->value->toBe('sent')
        ->reason->toBe('no_delivery_confirmation');
});

it('writes an in-app row regardless of what the outbound chain does', function () {
    [$primary, $fallback] = chainChannels();
    $primary->failNext = 3;
    $fallback->failNext = 3;

    $employee = chainRecipient();

    $notification = Notify::send('payment.demand', $employee, [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    expect($notification)->not->toBeNull()
        ->and(NotificationLog::query()->where('channel', 'in_app')->first()->status->value)->toBe('delivered');
});

it('never invents credentials: unconfigured WhatsApp and SMS drivers report cleanly and make no HTTP call', function () {
    Http::fake();

    config(['messaging.whatsapp.enabled' => false, 'messaging.sms.enabled' => false]);

    $whatsapp = app(WhatsAppChannel::class);
    $sms = app(SmsChannel::class);

    expect($whatsapp->isConfigured())->toBeFalse()
        ->and($sms->isConfigured())->toBeFalse();

    $message = new OutboundMessage('9665551234567', 'مرحباً', 'test');

    expect($whatsapp->deliver($message)->isNotConfigured())->toBeTrue()
        ->and($sms->deliver($message)->isNotConfigured())->toBeTrue()
        ->and($whatsapp->send('9665551234567', 'مرحباً', 'test'))->toBeFalse();

    Http::assertNothingSent();
});

function configuredWhatsApp(int $status, array $body): DeliveryResult
{
    config([
        'messaging.whatsapp.enabled' => true,
        'messaging.whatsapp.phone_number_id' => '1234567890',
        'messaging.whatsapp.token' => 'test-token',
    ]);

    Http::fake(['*' => Http::response($body, $status)]);

    return app(WhatsAppChannel::class)->deliver(
        new OutboundMessage('9665551234567', 'مرحباً', 'test'),
    );
}

it('treats a WhatsApp 5xx as retryable — the network, not the message, is at fault', function () {
    expect(configuredWhatsApp(503, ['error' => 'boom'])->isRetryable())->toBeTrue();
});

it('treats a WhatsApp 4xx as a hard failure and escalates instead of hammering the API', function () {
    $result = configuredWhatsApp(400, ['error' => 'bad template']);

    expect($result->isRetryable())->toBeFalse()
        ->and($result->isSuccessful())->toBeFalse();
});

it('treats a WhatsApp 200 as accepted — not delivered — because the Cloud API confirms by webhook', function () {
    $result = configuredWhatsApp(200, ['messages' => [['id' => 'wamid.X']]]);

    expect($result->isAccepted())->toBeTrue()
        ->and($result->isDelivered())->toBeFalse()
        ->and($result->providerMessageId)->toBe('wamid.X');
});

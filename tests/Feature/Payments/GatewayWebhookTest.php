<?php

use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\GatewayTransaction;
use App\Models\ParticipantEvent;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhook;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;
use App\Services\Payments\Gateway\LocalTestGateway;

// A10 بند 6 — بوابة الدفع خلف PaymentGatewayInterface والويبهوكات (H §12.6):
// التخزين الخام قبل المعالجة، تحقق التوقيع، التفرّد (المكرر لا يُنشئ قيداً
// ثانياً)، المتأخر يُقبل ما لم يُمنح المقعد لغيره وإلا استرداد تلقائي.

test('the local test gateway drives a full checkout: pay button -> gateway checkout page -> signed webhook -> paid', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $employee = collect($employees)->firstWhere('id', $intent->employee_id);

    // «ادفع» ينشئ الدفعة عبر الطبقة المجرَّدة ويحوّل لصفحة checkout البوابة.
    $response = $this->actingAs($employee, 'employee')
        ->post(route('employee.payments.pay', ['intent' => $intent->id]));

    $intent = $intent->fresh();
    expect($intent->gateway_reference)->toStartWith('local_');
    $response->assertRedirect(route('test-gateway.checkout', ['reference' => $intent->gateway_reference]));

    // صفحة البوابة التجريبية تعرض المبلغ ووسائل الدفع واسم «تيمات» في الكشف.
    $this->get(route('test-gateway.checkout', ['reference' => $intent->gateway_reference]))
        ->assertOk()
        ->assertSee('تيمات')
        ->assertSee('مدى');

    // نجاح الدفع = ويبهوك موقَّع عبر نفس نقطة الاستقبال.
    $this->post(route('test-gateway.complete', ['reference' => $intent->gateway_reference]), ['action' => 'success']);

    expect($intent->fresh()->status)->toBe(PaymentIntent::STATUS_PAID)
        ->and(PaymentWebhook::where('gateway_reference', $intent->gateway_reference)->value('processing_status'))->toBe(PaymentWebhook::STATUS_PROCESSED);
});

test('every webhook is stored RAW before processing, and a bad signature is rejected without effect', function () {
    fakeMessages();

    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);
    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();

    ['payload' => $payload] = a10SignedWebhook($intent, 'local_bad_sig');

    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => 'forged'], $payload)
        ->assertStatus(400);

    $webhook = PaymentWebhook::latest('id')->firstOrFail();

    expect($webhook->processing_status)->toBe(PaymentWebhook::STATUS_INVALID)
        ->and($webhook->payload)->toBe($payload) // خام كما وصل
        ->and($webhook->signature)->toBe('forged')
        ->and($intent->fresh()->status)->toBe(PaymentIntent::STATUS_PENDING);
});

test('a DUPLICATE webhook is ignored by idempotency key and never creates a second entry', function () {
    fakeMessages();

    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);
    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $intent->forceFill(['gateway_reference' => 'local_dup'])->save();

    ['payload' => $payload, 'signature' => $signature] = a10SignedWebhook($intent->fresh());

    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], $payload)->assertOk();
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], $payload)->assertOk();

    $statuses = PaymentWebhook::where('gateway_reference', 'local_dup')->orderBy('id')->pluck('processing_status')->all();

    expect($statuses)->toBe([PaymentWebhook::STATUS_PROCESSED, PaymentWebhook::STATUS_DUPLICATE])
        // قيد بوابة واحد لا اثنان — القاعدة 5.
        ->and(GatewayTransaction::where('payment_intent_id', $intent->id)->where('type', 'payment')->count())->toBe(1)
        ->and(ParticipantEvent::where('event_id', $event->id)->where('employee_id', $intent->employee_id)->where('to_value', 'paid')->count())->toBe(1);
});

test('a LATE webhook is honored when the seat was not given away', function () {
    fakeMessages();

    // ثلاثة منضمين بحد أدنى 2 وسعة 3 — بلا بدلاء: انقضاء C يترك مقعده شاغراً
    // بينما مطالبتا A وB ما زالتا مفتوحتين.
    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'capacity' => 3, 'joiners' => 3, 'close' => true]);

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_l1');

    $late = $intents[2];
    $late->forceFill(['expires_at' => now()->subMinute(), 'gateway_reference' => 'local_late_ok'])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    expect($late->fresh()->status)->toBe(PaymentIntent::STATUS_EXPIRED)
        ->and($event->fresh()->status)->toBe('awaiting_payment');

    // الويبهوك المتأخر يصل: المقعد لم يُمنح لغيره ⇒ يُقبل ويستعاد المقعد.
    ['payload' => $payload, 'signature' => $signature] = a10SignedWebhook($late->fresh());
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], $payload)->assertOk();

    $late = $late->fresh();
    expect($late->status)->toBe(PaymentIntent::STATUS_PAID)
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $late->employee_id)->value('seat_status'))->toBe('reserved');

    // يدفع B فيكتمل التحصيل بكل المقاعد الثلاثة.
    $collection->markIntentPaid($intents[1]->fresh(), 'local_l2');
    expect($event->fresh()->status)->toBe('confirmed');
});

test('a LATE webhook after the seat went to a substitute AUTO-REFUNDS to the original method', function () {
    fakeMessages();

    // سعة 2 وحد أدنى 2 + بديل واحد في القائمة.
    $built = a10Event(['total' => 300.0, 'min' => 2, 'capacity' => 2, 'joiners' => 2]);
    $event = $built['event'];
    $participation = app(ParticipationService::class);

    $substitute = Employee::factory()->create(['company_id' => $built['company']->id]);
    $built['community']->members()->attach($substitute->id, ['status' => 'active', 'joined_at' => now()]);
    $participation->join($event->fresh(), $substitute);

    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();
    $this->artisan('app:close-registration')->assertSuccessful();

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_m1');

    // C لا يدفع — مقعده يُعرض على البديل الذي يقبل ويدفع (المقعد مُنح لغيره).
    $late = $intents[1];
    $late->forceFill(['expires_at' => now()->subMinute(), 'gateway_reference' => 'local_late_gone'])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $participation->acceptOffer($event->fresh(), $substitute);
    $subIntent = PaymentIntent::where('event_id', $event->id)->where('employee_id', $substitute->id)->firstOrFail();
    $collection->markIntentPaid($subIntent, 'local_m2');
    expect($event->fresh()->status)->toBe('confirmed');

    // الويبهوك المتأخر لغير الدافع الأصلي: المقعد مُنح لغيره ⇒ استرداد تلقائي.
    ['payload' => $payload, 'signature' => $signature] = a10SignedWebhook($late->fresh());
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], $payload)->assertOk();

    $late = $late->fresh();
    expect($late->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and($late->refund_status)->toBe(PaymentIntent::REFUND_REFUNDED)
        // القيد العكسي: صف refund مرتبط في gateway_transactions.
        ->and(GatewayTransaction::where('payment_intent_id', $late->id)->where('type', 'refund')->where('status', 'succeeded')->exists())->toBeTrue();
});

test('a webhook whose amount differs from the locked intent amount is rejected — never a surcharge after payment', function () {
    fakeMessages();

    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);
    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $intent->forceFill(['gateway_reference' => 'local_wrong_amount'])->save();

    $payload = json_encode([
        'type' => 'payment_succeeded',
        'reference' => 'local_wrong_amount',
        'payment_intent_id' => $intent->id,
        'amount_halalas' => $intent->amount_halalas + 1, // زيادة هللة واحدة
        'idempotency_key' => 'local-webhook:wrong-amount',
    ]);
    $signature = app(LocalTestGateway::class)->sign((string) $payload);

    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], (string) $payload)
        ->assertStatus(500);

    expect(PaymentWebhook::latest('id')->value('processing_status'))->toBe(PaymentWebhook::STATUS_FAILED)
        ->and($intent->fresh()->status)->toBe(PaymentIntent::STATUS_PENDING);
});

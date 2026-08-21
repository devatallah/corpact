<?php

use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\GatewayTransaction;
use App\Models\ParticipantEvent;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhook;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 7 (H §23) — «ويبهوك مكرر + ويبهوك متأخر بعد انتهاء المهلة»
|--------------------------------------------------------------------------
|
| صفّان من جدول الحالات الاستثنائية في H §12.3:
|
| | الحالة                          | التصرف الإلزامي                              |
| |---------------------------------|----------------------------------------------|
| | تكرار الويبهوك لنفس العملية     | يُتجاهل بمفتاح التفرّد — **ولا يُنشأ قيد ثانٍ** |
| | ويبهوك متأخر بعد انتهاء المهلة  | يُقبل ما لم يُمنح المقعد لغيره، وإن مُنح **يُرد المبلغ تلقائياً** |
|
| «قيد ثانٍ» تُفحص هنا بمعناها الكامل: لا صف بوابة ثانٍ، ولا سطر حالة مشارك
| ثانٍ، **ولا حركة دفتر واحدة زائدة** — ولا استقطاع ثانٍ لدعم المجتمع.
*/

test('سيناريو 7أ — ويبهوك مكرر لنفس العملية لا يُنشئ قيداً ثانياً في أي دفتر', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build([
        'funding_mode' => 'mixed',
        'subsidy_type' => 'fixed',
        'subsidy_value' => 10_000,   // دعم 100.00 يُحجز ثم يُستقطع عند الاكتمال
        'price' => 300.0,
        'wallet' => 10_000,
    ]);

    $communityWallet = $world->communityWallet();

    $event = $world->createEvent(min: 2, capacity: 4);
    $world->joinNewMember($event);
    $world->providerAccepts($event->fresh());
    $world->closeRegistration($event->fresh());
    $event = $event->fresh();

    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    expect($intents)->toHaveCount(2)->and($event->final_share_halalas)->toBe(10_000);

    // الأول يدفع بويبهوك موقّع.
    $first = $intents[0];
    $first->forceFill(['gateway_reference' => 'local_dup_first'])->save();
    ['payload' => $p1, 'signature' => $s1] = a10SignedWebhook($first->fresh());
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $s1], $p1)->assertOk();

    // الثاني يدفع — دفعته هي التي تُكمل التحصيل فتستقطع حجز الدعم.
    $second = $intents[1];
    $second->forceFill(['gateway_reference' => 'local_dup_second'])->save();
    ['payload' => $p2, 'signature' => $s2] = a10SignedWebhook($second->fresh());
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $s2], $p2)->assertOk();

    $event = $event->fresh();
    $hold = WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->firstOrFail();

    expect($event->status)->toBe('confirmed')
        ->and($hold->status)->toBe(WalletHold::STATUS_CAPTURED)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0);

    // ── بصمة النظام قبل التكرار ────────────────────────────────────────────
    $ledgerRows = WalletTransaction::count();
    $ledgerSum = FinancialInvariants::ledgerBalance($communityWallet);
    $gatewayRows = GatewayTransaction::count();
    $paidLogRows = ParticipantEvent::where('event_id', $event->id)->where('to_value', 'paid')->count();

    // ── الويبهوك نفسه يصل مرة ثانية (تكرار المزوّد المعتاد) ────────────────
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $s2], $p2)->assertOk();

    expect(PaymentWebhook::where('gateway_reference', 'local_dup_second')->orderBy('id')->pluck('processing_status')->all())
        ->toBe([PaymentWebhook::STATUS_PROCESSED, PaymentWebhook::STATUS_DUPLICATE])
        // لا قيد دفتر ثانٍ — ولا استقطاع ثانٍ للدعم.
        ->and(WalletTransaction::count())->toBe($ledgerRows)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe($ledgerSum)
        ->and(WalletTransaction::where('idempotency_key', "capture:event:{$event->id}:subsidy-hold")->count())->toBe(1)
        // ولا صف بوابة ثانٍ، ولا سطر «دُفعت» ثانٍ في سجل المشارك.
        ->and(GatewayTransaction::count())->toBe($gatewayRows)
        ->and(GatewayTransaction::where('payment_intent_id', $second->id)->where('type', GatewayTransaction::TYPE_PAYMENT)->count())->toBe(1)
        ->and(ParticipantEvent::where('event_id', $event->id)->where('to_value', 'paid')->count())->toBe($paidLogRows)
        // ولا مبلغ تغيّر بعد الدفع.
        ->and($second->fresh()->amount_halalas)->toBe(10_000)
        ->and($second->fresh()->status)->toBe(PaymentIntent::STATUS_PAID);

    FinancialInvariants::assertAll();
});

test('سيناريو 7ب — ويبهوك متأخر بعد منح المقعد لبديل يُرد تلقائياً لوسيلة الدفع الأصلية', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build([
        'funding_mode' => 'mixed',
        'subsidy_type' => 'fixed',
        'subsidy_value' => 10_000,
        'price' => 300.0,
        'wallet' => 10_000,
    ]);

    $communityWallet = $world->communityWallet();

    // سعة 2 وحد أدنى 2: المنشئ + واحد يحجزان، وثالث ينتظر كبديل.
    $event = $world->createEvent(min: 2, capacity: 2);
    $world->joinNewMember($event);
    $substitute = $world->addMember();
    expect(app(ParticipationService::class)->join($event->fresh(), $substitute))->toBe('waitlisted');

    $world->providerAccepts($event->fresh());
    $world->closeRegistration($event->fresh());
    $event = $event->fresh();

    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $payer = $intents[0];
    $lateComer = $intents[1];

    app(CollectionService::class)->markIntentPaid($payer, 'local_late_paid');

    // ── انقضت مهلة المتأخر: مقعده يُخلى ويُعرض على البديل ─────────────────
    $lateComer->forceFill(['expires_at' => now()->subMinute(), 'gateway_reference' => 'local_late_gone'])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    expect($lateComer->fresh()->status)->toBe(PaymentIntent::STATUS_EXPIRED)
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $lateComer->employee_id)->value('seat_status'))->toBe('released');

    // البديل يقبل المقعد ويدفع ⇒ **مُنح المقعد لغيره** والفعالية تتأكد.
    app(ParticipationService::class)->acceptOffer($event->fresh(), Employee::withoutGlobalScopes()->findOrFail($substitute->id));
    $subIntent = PaymentIntent::where('event_id', $event->id)->where('employee_id', $substitute->id)->firstOrFail();

    // «الحصة المقفلة لا تتغير» — البديل يدفع المبلغ نفسه لا أكثر.
    expect($subIntent->amount_halalas)->toBe((int) $event->final_share_halalas);

    app(CollectionService::class)->markIntentPaid($subIntent, 'local_late_sub');

    expect($event->fresh()->status)->toBe('confirmed');

    $ledgerRows = WalletTransaction::count();

    // ── الويبهوك المتأخر يصل الآن ─────────────────────────────────────────
    ['payload' => $payload, 'signature' => $signature] = a10SignedWebhook($lateComer->fresh());
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], $payload)->assertOk();

    $lateComer = $lateComer->fresh();

    expect($lateComer->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and($lateComer->refund_status)->toBe(PaymentIntent::REFUND_REFUNDED)
        // الردّ إلى وسيلة الدفع الأصلية عبر البوابة — صف refund مرتبط بالدفعة.
        ->and(GatewayTransaction::where('payment_intent_id', $lateComer->id)->where('type', GatewayTransaction::TYPE_REFUND)->where('status', 'succeeded')->count())->toBe(1)
        // الفعالية لم تُمسّ: البديل يحتفظ بمقعده والتأكيد قائم.
        ->and($event->fresh()->status)->toBe('confirmed')
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $substitute->id)->value('seat_status'))->toBe('reserved')
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->count())->toBe(2)
        // ولا حركة دفتر محافظ زائدة: مال الموظف ليس في دفتر المحافظ أصلاً.
        ->and(WalletTransaction::count())->toBe($ledgerRows)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0);

    FinancialInvariants::assertAll();
});

test('سيناريو 7ج — ويبهوك متأخر ومقعده لم يُمنح لأحد يُقبل ويُستعاد المقعد', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build(['funding_mode' => 'employee_paid', 'price' => 300.0]);

    // ثلاثة بحد أدنى 2 وبلا بدلاء: انقضاء الثالث يترك مقعده شاغراً.
    $event = $world->createEvent(min: 2, capacity: 3);
    $world->joinNewMember($event);
    $world->joinNewMember($event);
    $world->providerAccepts($event->fresh());
    $world->closeRegistration($event->fresh());
    $event = $event->fresh();

    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    app(CollectionService::class)->markIntentPaid($intents[0], 'local_keep_1');

    $late = $intents[2];
    $late->forceFill(['expires_at' => now()->subMinute(), 'gateway_reference' => 'local_keep_late'])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    expect($late->fresh()->status)->toBe(PaymentIntent::STATUS_EXPIRED)
        ->and($event->fresh()->status)->toBe('awaiting_payment');

    ['payload' => $payload, 'signature' => $signature] = a10SignedWebhook($late->fresh());
    $this->call('POST', '/webhooks/payments/local', [], [], [], ['HTTP_X-Signature' => $signature], $payload)->assertOk();

    expect($late->fresh()->status)->toBe(PaymentIntent::STATUS_PAID)
        ->and($late->fresh()->refund_status)->toBe(PaymentIntent::REFUND_NONE)
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $late->employee_id)->value('seat_status'))->toBe('reserved')
        ->and(GatewayTransaction::where('type', GatewayTransaction::TYPE_REFUND)->count())->toBe(0);

    // ويدفع الثاني فيكتمل التحصيل بالمقاعد الثلاثة.
    app(CollectionService::class)->markIntentPaid($intents[1]->fresh(), 'local_keep_2');

    expect($event->fresh()->status)->toBe('confirmed');

    FinancialInvariants::assertAll();
});

<?php

use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\GatewayTransaction;
use App\Models\Notification;
use App\Models\ParticipantEvent;
use App\Models\PaymentIntent;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;

// A10 بند 4 — خط التحصيل (H §12.3) بديل EventCollectionStub:
// عند الإغلاق: تثبيت العدد ← الحصة النهائية ← حجز الدعم ← مطالبة لكل مشارك
// (payment_status = due) برابط موقّع ← نافذة 120 دقيقة أو 6 ساعات قبل البدء ←
// المقعد محجوز طوالها ← غير الدافع يُستبدل من قائمة الانتظار ← اكتمال الدفع
// والدعم = confirmed مع لقطة مالية مملوءة. لا تحصيل عند الانضمام أبداً،
// ولا تحصيل مرتين، ولا زيادة بعد الدفع.

test('nothing is ever charged at join — payment_status stays not_due until close', function () {
    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 3, 'wallet' => 0]);

    expect(PaymentIntent::count())->toBe(0)
        ->and(EventParticipant::where('event_id', $event->id)->pluck('payment_status')->unique()->all())->toBe(['not_due'])
        ->and(WalletTransaction::where('reference_type', Event::class)->where('reference_id', $event->id)->exists())->toBeFalse();
});

test('close creates one due intent per reserved participant with a signed resumable payment link and a demand message', function () {
    $messages = fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 2, 'capacity' => 8,
        'joiners' => 4, 'wallet' => 10_000, 'close' => true,
    ]);

    $intents = PaymentIntent::where('event_id', $event->id)->get();

    expect($intents)->toHaveCount(4)
        ->and($intents->pluck('status')->unique()->all())->toBe(['pending'])
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->pluck('payment_status')->unique()->all())->toBe(['due']);

    // سجل participant_events لكل تغيير payment_status (H §10).
    expect(ParticipantEvent::where('event_id', $event->id)->where('field', 'payment_status')->where('to_value', 'due')->count())->toBe(4);

    // المطالبة برابط موقّع يعمل دائماً خلال النافذة (استئناف من نفس الرابط).
    $intent = $intents->first();
    $url = $intent->signedPaymentUrl();
    expect($url)->toContain('/employee/payments/'.$intent->id)
        ->and($url)->toContain('signature=');

    $employee = collect($employees)->firstWhere('id', $intent->employee_id);
    $this->actingAs($employee, 'employee')->get($url)->assertOk();
    // «إغلاق الصفحة لا يلغي شيئاً» — نفس الرابط يعمل مرة أخرى.
    $this->actingAs($employee, 'employee')->get($url)->assertOk();

    // مطالبة واتساب عبر MessageChannel (درايفر A14 لاحقاً).
    expect(collect($messages->sent)->where('purpose', 'payment_demand')->count())->toBe(4);
});

test('the payment window is 120 minutes or until 6h before start, whichever sooner, and the seat stays reserved throughout', function () {
    fakeMessages();

    // البدء غداً 20:00 والإغلاق الآن ⇒ 120 دقيقة أقرب من (البدء − 6 ساعات).
    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();

    expect((int) round(now()->diffInMinutes($intent->expires_at)))->toBeLessThanOrEqual(120)
        ->and((int) round(now()->diffInMinutes($intent->expires_at)))->toBeGreaterThan(115)
        // المقعد محجوز طوال النافذة.
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $intent->employee_id)->value('seat_status'))->toBe('reserved');

    // فعالية تبدأ بعد 4 ساعات: النافذة تُسقف بوقت البدء لا 120 دقيقة كاملة.
    $soonStart = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2]);
    $soon = $soonStart['event'];
    $soon->forceFill([
        'starts_at' => now()->addHours(4),
        'registration_closes_at' => now()->subMinute(),
    ])->save();
    $this->artisan('app:close-registration')->assertSuccessful();

    $soonIntent = PaymentIntent::where('event_id', $soon->id)->firstOrFail();
    expect($soonIntent->expires_at->lte($soon->fresh()->startsAt()))->toBeTrue();
});

test('paying twice is impossible — idempotency key per intent, one gateway entry, no double effect', function () {
    fakeMessages();

    ['event' => $event] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $collection = app(CollectionService::class);

    $collection->markIntentPaid($intent, 'local_ref_1');
    $collection->markIntentPaid($intent->fresh(), 'local_ref_1');

    expect(GatewayTransaction::where('payment_intent_id', $intent->id)->where('type', 'payment')->count())->toBe(1)
        ->and(ParticipantEvent::where('event_id', $event->id)->where('employee_id', $intent->employee_id)->where('to_value', 'paid')->count())->toBe(1);
});

test('all paid + subsidy hold captured => confirmed with the financial snapshot filled', function () {
    fakeMessages();

    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 2, 'capacity' => 8,
        'joiners' => 4, 'wallet' => 10_000, 'close' => true,
    ]);

    $collection = app(CollectionService::class);
    foreach (PaymentIntent::where('event_id', $event->id)->get() as $i => $intent) {
        expect($event->fresh()->status)->toBe('awaiting_payment');
        $collection->markIntentPaid($intent, "local_{$i}");
    }

    $event = $event->fresh();
    expect($event->status)->toBe('confirmed')
        ->and($event->funding_status)->toBe('collected')
        ->and(WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->value('status'))->toBe(WalletHold::STATUS_CAPTURED)
        ->and($event->event_snapshot['financial']['share_per_participant_halalas'])->toBe(5_000)
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->pluck('payment_status')->unique()->all())->toBe(['paid']);
});

test('Path A (subsidy covers everything) confirms immediately with no intents and no employee ever charged', function () {
    fakeMessages();

    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 100, 'subsidy_type' => 'percentage',
        'min' => 2, 'joiners' => 3, 'wallet' => 30_000, 'close' => true,
    ]);

    expect($event->status)->toBe('confirmed')
        ->and(PaymentIntent::count())->toBe(0)
        ->and($event->subsidy_halalas)->toBe(30_000)
        ->and($event->final_share_halalas)->toBe(0);
});

test('a non-payer at expiry loses the seat to a FIFO waitlist substitute with a short deadline, and the intent expires', function () {
    fakeMessages();

    // سعة 3 وحد أدنى 2: ينضم 3 ويدخل رابع وخامس قائمة الانتظار كبدلاء.
    $built = a10Event(['total' => 300.0, 'min' => 2, 'capacity' => 3, 'joiners' => 3]);
    $event = $built['event'];
    $community = $built['community'];

    $participation = app(ParticipationService::class);
    $substitutes = [];
    for ($i = 0; $i < 2; $i++) {
        $substitute = Employee::factory()->create(['company_id' => $built['company']->id]);
        $community->members()->attach($substitute->id, ['status' => 'active', 'joined_at' => now()]);
        $participation->join($event->fresh(), $substitute);
        $substitutes[] = $substitute;
    }

    expect(EventParticipant::where('event_id', $event->id)->where('seat_status', 'waitlisted')->count())->toBe(2);

    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();
    $this->artisan('app:close-registration')->assertSuccessful();
    $event = $event->fresh();
    expect($event->status)->toBe('awaiting_payment');

    // اثنان يدفعان والثالث لا — تنقضي مهلته.
    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_a');
    $collection->markIntentPaid($intents[1], 'local_b');

    $nonPayer = $intents[2];
    $nonPayer->forceFill(['expires_at' => now()->subMinute()])->save();

    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $nonPayer = $nonPayer->fresh();
    $nonPayerRow = EventParticipant::where('event_id', $event->id)->where('employee_id', $nonPayer->employee_id)->first();

    expect($nonPayer->status)->toBe(PaymentIntent::STATUS_EXPIRED)
        ->and($nonPayerRow->seat_status)->toBe('released')
        ->and($nonPayerRow->payment_status)->toBe('failed');

    // البديل الأول (FIFO) عُرض عليه المقعد بمهلة قصيرة.
    $offer = EventParticipant::where('event_id', $event->id)
        ->where('employee_id', $substitutes[0]->id)
        ->first();

    expect($offer->offered_at)->not->toBeNull()
        ->and($offer->offer_expires_at)->not->toBeNull()
        ->and((int) round(now()->diffInMinutes($offer->offer_expires_at)))->toBeLessThanOrEqual((int) config('payments.collection.substitute_offer_minutes'));

    // البديل يقبل ⇒ مقعد محجوز + مطالبة بنفس الحصة المقفلة (لا زيادة أبداً).
    $participation->acceptOffer($event->fresh(), $substitutes[0]);

    $subIntent = PaymentIntent::where('event_id', $event->id)->where('employee_id', $substitutes[0]->id)->firstOrFail();
    expect($subIntent->amount_halalas)->toBe((int) $event->final_share_halalas);

    // البديل يدفع ⇒ اكتمل التحصيل (3 حصص) والفعالية مؤكدة.
    $collection->markIntentPaid($subIntent, 'local_sub');
    expect($event->fresh()->status)->toBe('confirmed');
});

test('substitutes are notified when the waitlist closes that they remain as backups', function () {
    fakeMessages();

    $built = a10Event(['total' => 300.0, 'min' => 2, 'capacity' => 2, 'joiners' => 2]);
    $event = $built['event'];

    $substitute = Employee::factory()->create(['company_id' => $built['company']->id]);
    $built['community']->members()->attach($substitute->id, ['status' => 'active', 'joined_at' => now()]);
    app(ParticipationService::class)->join($event->fresh(), $substitute);

    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();
    $this->artisan('app:close-registration')->assertSuccessful();

    // الصف بقي waitlisted (بديل) وأُشعر.
    expect(EventParticipant::where('event_id', $event->id)->where('employee_id', $substitute->id)->value('seat_status'))->toBe('waitlisted')
        ->and(Notification::where('notifiable_id', $substitute->id)->where('title', 'أُغلق التسجيل')->exists())->toBeTrue();
});

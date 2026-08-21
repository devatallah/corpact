<?php

use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;

// A10 بند 5 — الحالات الاستثنائية في التحصيل (H §12.3، كلها إلزامية):
// نزول العدد تحت الحد بعد فشل الدفع ⇒ cancelled_payment_failed + رد كل
// ما حُصِّل + فك حجز الدعم + إبلاغ المزوّد؛ عجز فوق الحد ⇒ الحصص المقفلة
// لا تتغير: تغطية من المحفظة أو إلغاء وردّ؛ رصيد لا يكفي الدعم ⇒ حجز
// المتاح وإعادة الحساب ضمن السقف (اختُبر في FundingFormulaTest).

test('count below minimum after payment failures => cancelled_payment_failed, everything refunded, hold released, provider informed', function () {
    fakeMessages();

    // حد أدنى 3 من 3 منضمين بلا قائمة انتظار: فشل واحد ينزل بالعدد تحت الحد.
    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 3, 'capacity' => 3,
        'joiners' => 3, 'wallet' => 10_000, 'close' => true,
    ]);

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();

    // اثنان دفعا والثالث انقضت مهلته.
    $collection->markIntentPaid($intents[0], 'local_x');
    $collection->markIntentPaid($intents[1], 'local_y');
    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();

    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $event = $event->fresh();

    expect($event->status)->toBe('cancelled_payment_failed')
        // كل المدفوع رُدّ إلى وسيلة الدفع الأصلية.
        ->and($intents[0]->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and($intents[1]->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        // حجز الدعم فُكّ — رصيد المحفظة عاد كاملاً.
        ->and(WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->value('status'))->toBe(WalletHold::STATUS_RELEASED)
        ->and(Wallet::subFor($event->community)->fresh()->balance_halalas)->toBe(10_000)
        // المزوّد أُبلغ.
        ->and(Notification::where('notifiable_type', Partner::class)
            ->where('notifiable_id', $event->partner_id)
            ->where('title', 'أُلغيت الفعالية — فشل التحصيل')->exists())->toBeTrue();
});

test('shortfall with count still >= minimum: LOCKED SHARES NEVER CHANGE — the wallet covers the gap', function () {
    fakeMessages();

    // حد أدنى 2 من 3، لا بدلاء. واحد لا يدفع: العدد (2) ≥ الحد لكن التحصيل
    // ناقص حصة — تُغطى من محفظة المجتمع (رصيد كافٍ بعد الدعم).
    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 0.0, 'min' => 2, 'capacity' => 3,
        'joiners' => 3, 'wallet' => 50_000, 'close' => true,
    ]);

    $share = (int) $event->final_share_halalas; // 30000 ÷ 3 = 10000

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_p1');
    $collection->markIntentPaid($intents[1], 'local_p2');
    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();

    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $event = $event->fresh();

    expect($event->status)->toBe('confirmed')
        // الحصص المقفلة لم تتغير — لا مطالبة زادت هللة واحدة.
        ->and(PaymentIntent::where('event_id', $event->id)->whereIn('status', ['paid'])->pluck('amount_halalas')->unique()->all())->toBe([$share])
        // العجز (حصة واحدة) استُقطع من المحفظة بقيد capture مسجَّل.
        ->and($event->shortfall_covered_halalas)->toBe($share)
        ->and(WalletTransaction::where('idempotency_key', "capture:event:{$event->id}:shortfall-cover")->value('amount_halalas'))->toBe($share)
        ->and(Wallet::subFor($event->community)->fresh()->balance_halalas)->toBe(50_000 - $share);
});

test('shortfall with count >= minimum but an empty wallet cancels and refunds everything collected', function () {
    fakeMessages();

    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 0.0, 'min' => 2, 'capacity' => 3,
        'joiners' => 3, 'wallet' => 0, 'close' => true,
    ]);

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_q1');
    $collection->markIntentPaid($intents[1], 'local_q2');
    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();

    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $event = $event->fresh();

    expect($event->status)->toBe('cancelled_payment_failed')
        ->and($intents[0]->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and($intents[1]->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and(EventParticipant::where('event_id', $event->id)->where('payment_status', 'refunded')->count())->toBe(2);
});

test('a substitute declining post-close moves the offer to the next substitute', function () {
    fakeMessages();

    $built = a10Event(['total' => 300.0, 'min' => 2, 'capacity' => 2, 'joiners' => 2]);
    $event = $built['event'];
    $participation = app(ParticipationService::class);

    $substitutes = [];
    for ($i = 0; $i < 2; $i++) {
        $substitute = Employee::factory()->create(['company_id' => $built['company']->id]);
        $built['community']->members()->attach($substitute->id, ['status' => 'active', 'joined_at' => now()]);
        $participation->join($event->fresh(), $substitute);
        $substitutes[] = $substitute;
    }

    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();
    $this->artisan('app:close-registration')->assertSuccessful();

    // ينقضي أحد الدافعَين فيُعرض على البديل الأول، فيرفض ⇒ ينتقل للثاني.
    $intent = PaymentIntent::where('event_id', $event->id)->orderBy('id')->first();
    $intent->forceFill(['expires_at' => now()->subMinute()])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    expect(EventParticipant::where('event_id', $event->id)->where('employee_id', $substitutes[0]->id)->value('offered_at'))->not->toBeNull();

    $participation->declineOffer($event->fresh(), $substitutes[0]);

    expect(EventParticipant::where('event_id', $event->id)->where('employee_id', $substitutes[1]->id)->value('offered_at'))->not->toBeNull();
});

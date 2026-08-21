<?php

use App\Enums\EventStatus;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;

// A10 — H §12.3 بند 2: «عند الإغلاق: **تثبيت العدد**». العدد المثبَّت هو أساس
// الفوترة الذي تقيس عليه CollectionService::evaluate عجز التحصيل، وهو ما
// يُجمَّد في event_snapshot فتُحتسب عليه العمولة ومستحق المزوّد.
//
// إخلاء مقعد غير الدافع (expireIntent) لا يمس العدّادات عمداً — المقعد يُعرض
// على بديل والعدد يبقى كما هو. فلو خفّضت ترقيةُ بديلٍ (promote) أو إزالةٌ
// إدارية أو إسقاطُ مشاركة العدّادَ بعد الإغلاق، لانطبق العجز على نفسه:
// participants_count == paid ⇒ لا coverShortfallFromWallet ⇒ فعالية محصَّلة
// ناقصاً تتأكد ويُدفع للمزوّد إجماليها المجمَّد كاملاً من جيب المنصة.
//
// هذه الاختبارات تثبّت الحدّ: **بعد الإغلاق العدد لا ينزل بأي مسار**، وقبله
// يتحرك في الاتجاهين كما كان دائماً.

/**
 * فعالية مغلقة على أربعة مقاعد مدفوعة (حصة 10000 هللة) وبديلين في القائمة.
 *
 * @return array{event: Event, community: Community, company: Company, employees: array<int, Employee>, substitutes: array<int, Employee>}
 */
function frozenHeadcountEvent(int $walletHalalas): array
{
    $built = a10Event([
        'total' => 400.0, 'subsidy' => 0.0, 'min' => 2, 'capacity' => 4,
        'joiners' => 4, 'wallet' => $walletHalalas,
    ]);

    $participation = app(ParticipationService::class);
    $substitutes = [];

    for ($i = 0; $i < 2; $i++) {
        $substitute = Employee::factory()->create(['company_id' => $built['company']->id]);
        $built['community']->members()->attach($substitute->id, ['status' => 'active', 'joined_at' => now()]);
        $participation->join($built['event']->fresh(), $substitute);
        $substitutes[] = $substitute;
    }

    $built['event']->forceFill(['registration_closes_at' => now()->subMinute()])->save();
    test()->artisan('app:close-registration')->assertSuccessful();

    return [...$built, 'event' => $built['event']->fresh(), 'substitutes' => $substitutes];
}

test('two lapsed payments and only one substitute: the frozen headcount holds and the wallet pays the shortfall', function () {
    fakeMessages();

    ['event' => $event, 'substitutes' => $substitutes] = frozenHeadcountEvent(50_000);

    $share = (int) $event->final_share_halalas;

    expect($event->status)->toBe('awaiting_payment')
        ->and($event->participants_count)->toBe(4)
        ->and($share)->toBe(10_000);

    $collection = app(CollectionService::class);
    $participation = app(ParticipationService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();

    $collection->markIntentPaid($intents[0], 'local_h1');
    $collection->markIntentPaid($intents[1], 'local_h2');

    // كل المطالبات تحمل المهلة نفسها (CollectionService::createIntentAndDemand)
    // فغير الدافعَين ينقضيان معاً ويُعرض المقعدان على البديلين دفعة واحدة.
    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();
    $intents[3]->forceFill(['expires_at' => now()->subMinute()])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    expect(EventParticipant::where('event_id', $event->id)->whereNotNull('offer_expires_at')->count())->toBe(2);

    // الحالة اللامتناظرة: بديل واحد يقبل، والعرض الثاني يُترك ينقضي.
    $participation->acceptOffer($event->fresh(), $substitutes[0]);

    // ← هنا كان يهبط العدد من 4 إلى 3 (syncCounters داخل promote).
    expect($event->fresh()->participants_count)->toBe(4);

    EventParticipant::where('event_id', $event->id)
        ->where('employee_id', $substitutes[1]->id)
        ->update(['offer_expires_at' => now()->subMinute()]);

    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    expect($event->fresh()->status)->toBe('awaiting_payment');

    // البديل يدفع: ثلاث حصص محصَّلة على فعالية عدّادها المثبَّت أربعة.
    $subIntent = PaymentIntent::where('event_id', $event->id)
        ->where('employee_id', $substitutes[0]->id)
        ->firstOrFail();
    $collection->markIntentPaid($subIntent, 'local_sub');

    $event = $event->fresh();

    expect($event->participants_count)->toBe(4)
        ->and($event->status)->toBe('confirmed')
        // الحصص المقفلة لم تتغير — العجز غُطّي من محفظة المجتمع لا من المنصة.
        ->and(PaymentIntent::where('event_id', $event->id)->where('status', 'paid')->pluck('amount_halalas')->unique()->all())->toBe([$share])
        ->and($event->shortfall_covered_halalas)->toBe($share)
        ->and(Wallet::subFor($event->community)->fresh()->balance_halalas)->toBe(50_000 - $share);
});

test('the same asymmetric shortfall with an empty wallet cancels instead of confirming under-collected', function () {
    fakeMessages();

    ['event' => $event, 'substitutes' => $substitutes] = frozenHeadcountEvent(0);

    $collection = app(CollectionService::class);
    $participation = app(ParticipationService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();

    $collection->markIntentPaid($intents[0], 'local_e1');
    $collection->markIntentPaid($intents[1], 'local_e2');
    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();
    $intents[3]->forceFill(['expires_at' => now()->subMinute()])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $participation->acceptOffer($event->fresh(), $substitutes[0]);

    EventParticipant::where('event_id', $event->id)
        ->where('employee_id', $substitutes[1]->id)
        ->update(['offer_expires_at' => now()->subMinute()]);
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $subIntent = PaymentIntent::where('event_id', $event->id)
        ->where('employee_id', $substitutes[0]->id)
        ->firstOrFail();
    $collection->markIntentPaid($subIntent, 'local_esub');

    $event = $event->fresh();

    // لا رصيد يغطي الحصة الناقصة ⇒ إلغاء وردّ كل ما حُصِّل. الخطأ القديم كان
    // يؤكّد الفعالية بثلاث حصص من أربع ويسلّم المزوّد إجماليها كاملاً.
    expect($event->participants_count)->toBe(4)
        ->and($event->status)->toBe('cancelled_payment_failed')
        ->and($event->funding_status)->toBe('collection_failed')
        ->and($intents[0]->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and($intents[1]->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and($subIntent->fresh()->status)->toBe(PaymentIntent::STATUS_REFUNDED);
});

test('an administrative removal after close does not lower the frozen headcount either', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event([
        'total' => 300.0, 'subsidy' => 0.0, 'min' => 2, 'capacity' => 3,
        'joiners' => 3, 'wallet' => 50_000, 'close' => true,
    ]);

    $share = (int) $event->final_share_halalas;

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_rm1');
    $collection->markIntentPaid($intents[1], 'local_rm2');

    $third = collect($employees)->firstWhere('id', (int) $intents[2]->employee_id);

    app(ParticipationService::class)->remove($event->fresh(), $third, null, 'إزالة إدارية بعد إغلاق التسجيل');

    // ← releaseReservedSeat كان يهبط بالعدد من 3 إلى 2 في خطوة واحدة.
    expect($event->fresh()->participants_count)->toBe(3)
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $third->id)->value('seat_status'))->toBe('released');

    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $event = $event->fresh();

    expect($event->participants_count)->toBe(3)
        ->and($event->status)->toBe('confirmed')
        ->and($event->shortfall_covered_halalas)->toBe($share)
        ->and(Wallet::subFor($event->community)->fresh()->balance_halalas)->toBe(50_000 - $share);
});

test('an offboarding cancellation after close does not lower the frozen headcount either', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event([
        'total' => 300.0, 'subsidy' => 0.0, 'min' => 2, 'capacity' => 3,
        'joiners' => 3, 'wallet' => 50_000, 'close' => true,
    ]);

    $share = (int) $event->final_share_halalas;

    $collection = app(CollectionService::class);
    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();
    $collection->markIntentPaid($intents[0], 'local_off1');
    $collection->markIntentPaid($intents[1], 'local_off2');

    $third = collect($employees)->firstWhere('id', (int) $intents[2]->employee_id);

    app(ParticipationService::class)->cancelParticipation($event->fresh(), $third, null, 'مغادرة الموظف الشركة');

    expect($event->fresh()->participants_count)->toBe(3);

    $intents[2]->forceFill(['expires_at' => now()->subMinute()])->save();
    $this->artisan('app:expire-payment-deadlines')->assertSuccessful();

    $event = $event->fresh();

    expect($event->participants_count)->toBe(3)
        ->and($event->status)->toBe('confirmed')
        ->and($event->shortfall_covered_halalas)->toBe($share);
});

test('the freeze starts at the close — before it the counter still moves in both directions', function () {
    fakeMessages();

    $built = a10Event(['total' => 300.0, 'min' => 2, 'capacity' => 5, 'joiners' => 3]);
    $event = $built['event'];
    $participation = app(ParticipationService::class);

    // الحالة هنا من الحالات القابلة للانضمام (booked بعد قبول المزوّد).
    expect(in_array((string) $event->status, EventStatus::joinableValues(), true))->toBeTrue()
        ->and($event->participants_count)->toBe(3);

    $participation->withdraw($event->fresh(), $built['employees'][2]);
    expect($event->fresh()->participants_count)->toBe(2);

    $participation->remove($event->fresh(), $built['employees'][1], null, 'إزالة قبل الإغلاق');
    expect($event->fresh()->participants_count)->toBe(1);

    $newcomer = Employee::factory()->create(['company_id' => $built['company']->id]);
    $built['community']->members()->attach($newcomer->id, ['status' => 'active', 'joined_at' => now()]);
    $participation->join($event->fresh(), $newcomer);

    expect($event->fresh()->participants_count)->toBe(2);
});

<?php

use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\PaymentIntent;
use App\Models\WalletTransaction;
use App\Services\Events\ParticipationService;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 6 (H §23) — «100 طلب انضمام متزامن على 10 مقاعد»
|--------------------------------------------------------------------------
|
| المطلوب رقمان لا ثالث لهما: **10 محجوزة و90 في قائمة الانتظار** — لا 11
| ولا 9 — ومواضع FIFO سليمة بلا فجوة ولا تكرار.
|
| ⚠️ **حدّ الأتمتة**: التزامن الحقيقي (100 اتصال في اللحظة نفسها) لا يُعاد
| إنتاجه على SQLite داخل الاختبار. ما يثبته هذا السيناريو هو ما تحمي به
| المنصة نفسها فعلاً: معاملة واحدة بقفل صف الفعالية (`lockForUpdate`) تقرأ
| العدد وتكتب المقعد معاً، فلا نافذة بين القراءة والكتابة يتسلل منها مقعد
| حادي عشر. اختبار الحِمل الحقيقي بند في قائمة ما لا تثبته الأتمتة
| (`docs/acceptance.md`).
*/

test('سيناريو 6 — 100 انضمام على 10 مقاعد ينتج 10 محجوزة و90 في الانتظار بمواضع FIFO سليمة', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build(['funding_mode' => 'employee_paid', 'price' => 300.0]);

    // المنشئ ينضم تلقائياً — فهو الطلب الأول من المائة.
    $event = $world->createEvent(min: 4, capacity: 10);

    expect($event->capacity)->toBe(10)->and($event->participants_count)->toBe(1);

    $order = [$world->leader->id];
    $seats = ['reserved'];

    for ($i = 0; $i < 99; $i++) {
        $joined = $world->joinNewMember($event);
        $order[] = $joined['employee']->id;
        $seats[] = $joined['seat'];
    }

    $event = $event->fresh();

    // ── الرقمان: 10 و90 ───────────────────────────────────────────────────
    expect(count($order))->toBe(100)
        ->and(count(array_filter($seats, fn ($s) => $s === 'reserved')))->toBe(10)
        ->and(count(array_filter($seats, fn ($s) => $s === 'waitlisted')))->toBe(90)
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->count())->toBe(10)
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'waitlisted')->count())->toBe(90)
        ->and($event->participants_count)->toBe(10)
        // بلوغ السعة عَلَم مشتق لا حالة (H §9 القاعدة 3).
        ->and($event->is_full)->toBeTrue()
        ->and($event->status)->toBe('pending_provider');

    // ── مواضع FIFO: 1..90 بلا فجوة، وبترتيب الوصول حرفياً ─────────────────
    $waitlist = EventParticipant::where('event_id', $event->id)
        ->where('seat_status', 'waitlisted')
        ->orderBy('position')
        ->get();

    expect($waitlist->pluck('position')->all())->toBe(range(1, 90))
        // العاشر مقعده محجوز، والحادي عشر أول القائمة — ترتيب الوصول نفسه.
        ->and($waitlist->pluck('employee_id')->all())->toBe(array_slice($order, 10))
        ->and($waitlist->pluck('offered_at')->unique()->all())->toBe([null]);   // لا عرض بلا مقعد شاغر

    // المحجوزون هم العشرة الأوائل بترتيب وصولهم — لا مزاحمة ولا تجاوز.
    expect(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->orderBy('id')->pluck('employee_id')->all())
        ->toBe(array_slice($order, 0, 10));

    // ── ولا هللة تحركت: الانضمام ليس لحظة تحصيل (H §12.3 بند 1) ───────────
    expect(PaymentIntent::count())->toBe(0)
        ->and(WalletTransaction::count())->toBe(0)
        ->and(EventParticipant::where('event_id', $event->id)->pluck('payment_status')->unique()->all())->toBe(['not_due']);

    // ── سلامة الطابور بعد انسحاب: المقعد يذهب للموضع 1، والباقي ينضغط ──────
    $firstInLine = Employee::withoutGlobalScopes()->findOrFail($waitlist->first()->employee_id);

    app(ParticipationService::class)->withdraw($event->fresh(), Employee::withoutGlobalScopes()->findOrFail($order[3]));

    $offered = EventParticipant::where('event_id', $event->id)->where('employee_id', $firstInLine->id)->firstOrFail();

    expect($offered->seat_status)->toBe('waitlisted')
        ->and($offered->offered_at)->not->toBeNull()          // «الأسبق يفوز»
        ->and($offered->position)->toBe(1)
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'waitlisted')->orderBy('position')->pluck('position')->all())
        ->toBe(range(1, 90))                                   // بلا فجوة بعد الانضغاط
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->count())->toBe(9)
        // الصف المنسحب باقٍ — الحالة تتغير ولا يُحذف تاريخ (H §10).
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $order[3])->value('seat_status'))->toBe('cancelled')
        ->and(EventParticipant::where('event_id', $event->id)->count())->toBe(100);

    // البديل يقبل داخل المهلة ⇒ المقعد العاشر يعود محجوزاً والقائمة 89.
    app(ParticipationService::class)->acceptOffer($event->fresh(), $firstInLine);

    expect(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->count())->toBe(10)
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'waitlisted')->orderBy('position')->pluck('position')->all())
        ->toBe(range(1, 89))
        ->and($event->fresh()->participants_count)->toBe(10);
});

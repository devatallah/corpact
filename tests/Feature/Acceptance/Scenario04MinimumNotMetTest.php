<?php

use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\EventStatusHistory;
use App\Models\GatewayTransaction;
use App\Models\Notification;
use App\Models\PaymentIntent;
use App\Models\SettlementItem;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Events\ParticipationService;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 4 (H §23)
| «فشل الحد الأدنى ← إعادة جدولة ← فشل ثانٍ ← إلغاء نهائي بلا أي استقطاع»
|--------------------------------------------------------------------------
|
| قوس واحد متصل على **سجل واحد** (H §8): الفعالية تبلغ الحد فيقبلها المزوّد،
| ثم ينسحب اثنان فتنزل تحت الحد عند الإغلاق، فتُعاد جدولتها مرة واحدة +7 أيام
| على نفس السجل مع إبلاغ المزوّد فوراً، ثم تفشل ثانيةً فتُلغى نهائياً.
|
| **الادعاء الأثمن هنا سلبي**: لا هللة واحدة تحركت — لا حجز، ولا استقطاع، ولا
| مطالبة دفع، ولا بند تسوية، ورصيد محفظة المجتمع كما كان بالضبط.
*/

test('سيناريو 4 — فشل الحد الأدنى مرتين ينتهي بإلغاء نهائي على نفس السجل بلا أي استقطاع من أحد', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build([
        'funding_mode' => 'mixed',
        'subsidy_type' => 'fixed',
        'subsidy_value' => 10_000,
        'price' => 300.0,
        'wallet' => 50_000,   // رصيد قائم — يجب أن يبقى كما هو حرفياً
    ]);

    $communityWallet = $world->communityWallet();
    $balanceBefore = FinancialInvariants::ledgerBalance($communityWallet);
    $ledgerRowsBefore = WalletTransaction::count();

    expect($balanceBefore)->toBe(50_000);

    // ── بلوغ الحد الأدنى وقبول المزوّد ─────────────────────────────────────
    $event = $world->createEvent(min: 5, capacity: 8);

    $joiners = [];
    for ($i = 0; $i < 4; $i++) {
        $joiners[] = $world->joinNewMember($event)['employee'];
    }

    expect($event->fresh()->status)->toBe('pending_provider');

    $request = $world->providerAccepts($event->fresh());
    $event = $event->fresh();

    expect($event->status)->toBe('booked')
        ->and($request->status)->toBe(EventProviderRequest::STATUS_ACCEPTED)
        ->and(WalletTransaction::count())->toBe($ledgerRowsBefore);   // «booked بلا أثر مالي»

    // ── ينسحب اثنان قبل الإغلاق فتنزل تحت الحد (5 ← 3) ─────────────────────
    $event->forceFill(['registration_closes_at' => now()->addHours(2)])->save();

    $participation = app(ParticipationService::class);
    foreach (array_slice($joiners, 0, 2) as $withdrawing) {
        $participation->withdraw($event->fresh(), Employee::withoutGlobalScopes()->find($withdrawing->id));
    }

    $originalStartsAt = $event->fresh()->starts_at->copy();

    expect((int) $event->fresh()->reservedParticipants()->count())->toBe(3);

    // ── الفشل الأول: إعادة جدولة واحدة على نفس السجل، +7 أيام ──────────────
    // الزمن يتقدم فعلاً إلى لحظة الإغلاق — لا حقن قيمة في العمود.
    $this->travelTo($event->fresh()->registration_closes_at->copy()->addMinute());
    $this->artisan('app:close-registration')->assertSuccessful();

    $event = Event::withoutGlobalScopes()->findOrFail($event->id);

    expect(Event::withoutGlobalScopes()->count())->toBe(1)          // نفس السجل — لا صف جديد
        ->and($event->status)->toBe('open')
        ->and($event->reschedule_attempt)->toBe(1)
        ->and($event->original_starts_at->toDateTimeString())->toBe($originalStartsAt->toDateTimeString())
        ->and($event->starts_at->toDateTimeString())->toBe($originalStartsAt->copy()->addDays(7)->toDateTimeString())
        ->and($event->starts_at->format('H:i'))->toBe('20:00')      // نفس اليوم والوقت من الأسبوع
        // المزوّد الذي قَبِل أُبلغ فوراً وأُلغي طلبه وفُكّ حجز وحدته.
        ->and($request->fresh()->status)->toBe(EventProviderRequest::STATUS_CANCELLED)
        ->and(Notification::where('notifiable_id', $world->partner->id)->where('title', 'إلغاء حجز — لم يكتمل العدد')->exists())->toBeTrue()
        ->and(Notification::where('notifiable_id', $world->leader->id)->where('title', 'أُعيدت جدولة فعالية — محاولة أخيرة')->exists())->toBeTrue()
        // ولا هللة تحركت في المحاولة الأولى.
        ->and(WalletTransaction::count())->toBe($ledgerRowsBefore)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe($balanceBefore);

    // ── الفشل الثاني: إلغاء نهائي على السجل نفسه ───────────────────────────
    // أسبوع كامل مرّ ولم ينضم أحد — إغلاق التسجيل الجديد يحسمها نهائياً.
    $this->travelTo($event->registration_closes_at->copy()->addMinute());
    $this->artisan('app:close-registration')->assertSuccessful();

    $event = Event::withoutGlobalScopes()->findOrFail($event->id);

    expect(Event::withoutGlobalScopes()->count())->toBe(1)
        ->and($event->status)->toBe('cancelled_min_not_met')
        ->and($event->reschedule_attempt)->toBe(1)                  // لا محاولة ثالثة أبداً
        ->and(Notification::where('notifiable_id', $world->leader->id)->where('title', 'راجع الحد الأدنى للفعالية')->exists())->toBeTrue();

    // ── «بلا أي استقطاع» — الادعاء المركزي، مفصَّلاً ────────────────────────
    FinancialInvariants::assertNoLedgerActivityFor($event);

    expect(WalletTransaction::count())->toBe($ledgerRowsBefore)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe($balanceBefore)
        ->and((int) $communityWallet->fresh()->balance_halalas)->toBe(50_000)
        ->and(WalletHold::count())->toBe(0)
        ->and($event->budget_deducted_at)->toBeNull()
        ->and($event->subsidy_halalas)->toBeNull()
        ->and($event->final_share_halalas)->toBeNull()
        // ولا مطالبة دفع واحدة وُجّهت لأي موظف، ولا حركة بوابة، ولا بند تسوية.
        ->and(PaymentIntent::count())->toBe(0)
        ->and(GatewayTransaction::count())->toBe(0)
        ->and(SettlementItem::count())->toBe(0);

    // سطر إعادة الجدولة موثَّق في تاريخ الحالات (booked ← open ← ملغاة).
    expect(EventStatusHistory::where('event_id', $event->id)->orderBy('id')->pluck('to_status')->all())
        ->toBe(['open', 'pending_provider', 'booked', 'open', 'cancelled_min_not_met']);

    FinancialInvariants::assertAll();
});

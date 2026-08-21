<?php

use App\Enums\WalletTransactionType;
use App\Models\EventParticipant;
use App\Models\EventStatusHistory;
use App\Models\PaymentIntent;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Billing\ProviderPayableService;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 1 (H §23)
| «دورة فعالية كاملة في المسار أ (تمويل كامل من المحفظة) من الإنشاء إلى التسوية»
|--------------------------------------------------------------------------
|
| المسار أ = `subsidy_type = percentage` بقيمة 100 (H §12.2): محفظة المجتمع
| تغطي الإجمالي كاملاً، فلا يُطالَب موظف بريال واحد. المحطات السبع:
|
|   شحن وتخصيص ← إنشاء ← بلوغ الحد وإرسال الطلب ← قبول المزوّد ←
|   إغلاق التسجيل (حجز الدعم واستقطاعه) ← الاكتمال (العمولة) ← التسوية.
|
| **الرصيد يُفحص عند كل محطة**، لا في النهاية فقط: القاعدة أن المال لا يتحرك
| إلا في اللحظتين اللتين تسمّيهما المواصفة — إغلاق التسجيل والاكتمال.
*/

test('سيناريو 1 — المسار أ: فعالية ممولة بالكامل من محفظة المجتمع، من الإنشاء إلى التسوية', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    // ── المحطة 0: شحن المحفظة الرئيسية ثم تخصيص 500.00 لمحفظة المجتمع ──────
    $world = AcceptanceWorld::build([
        'funding_mode' => 'community_wallet',
        'price' => 300.0,
        'wallet' => 50_000,          // 500.00 ريال
        'commission_rate' => 12.00,
    ]);

    $communityWallet = $world->communityWallet();

    expect(FinancialInvariants::ledgerBalance($world->companyWallet()))->toBe(0)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(50_000)
        ->and((int) $communityWallet->fresh()->balance_halalas)->toBe(50_000);

    $ledgerAfterFunding = WalletTransaction::count();

    // ── المحطة 1: الإنشاء — «أثناء التسجيل لا تحصيل» (H §12.3 بند 1) ───────
    $event = $world->createEvent(min: 4, capacity: 8);

    expect($event->status)->toBe('open')
        ->and($event->total_amount_halalas)->toBe(30_000)
        ->and($event->subsidy_type)->toBe('percentage')
        ->and($event->subsidy_value)->toBe(100)
        // الحصة القصوى المعروضة عند الانضمام = (300 − 300) ÷ 4 = صفر.
        ->and($event->max_share_halalas)->toBe(0)
        ->and($event->participants_count)->toBe(1)   // القائد المنشئ
        ->and(WalletTransaction::count())->toBe($ledgerAfterFunding)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(50_000);

    // ── المحطة 2: بلوغ الحد الأدنى يرسل الطلب الملزم للمزوّد ───────────────
    for ($i = 0; $i < 3; $i++) {
        expect($world->joinNewMember($event)['seat'])->toBe('reserved');
    }

    $event = $event->fresh();

    expect($event->status)->toBe('pending_provider')
        ->and($event->participants_count)->toBe(4)
        ->and(EventParticipant::where('event_id', $event->id)->pluck('payment_status')->unique()->all())->toBe(['not_due'])
        ->and(WalletTransaction::count())->toBe($ledgerAfterFunding);

    // ── المحطة 3: قبول المزوّد — «booked بلا أثر مالي» (H §9) ──────────────
    $world->providerAccepts($event);
    $event = $event->fresh();

    expect($event->status)->toBe('booked')
        ->and(WalletTransaction::count())->toBe($ledgerAfterFunding)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(50_000);

    // ── المحطة 4: إغلاق التسجيل — حجز الدعم ثم استقطاعه فوراً (المسار أ) ───
    $world->closeRegistration($event);
    $event = $event->fresh();

    $hold = WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->firstOrFail();

    expect($event->status)->toBe('confirmed')                       // تأكيد فوري بلا مطالبات
        ->and($event->funding_status)->toBe('collected')
        ->and($event->subsidy_halalas)->toBe(30_000)
        ->and($event->final_share_halalas)->toBe(0)
        ->and($event->rounding_remainder_halalas)->toBe(0)
        // «لا محفظة نقدية للموظف»: لا مطالبة دفع واحدة في المسار أ.
        ->and(PaymentIntent::where('event_id', $event->id)->count())->toBe(0)
        ->and($hold->status)->toBe(WalletHold::STATUS_CAPTURED)
        ->and((int) $hold->captured_amount_halalas)->toBe(30_000)
        // الرصيد: 500.00 − 300.00 = 200.00، والدفتر يقولها لا عمود الرصيد.
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(20_000)
        ->and((int) $communityWallet->fresh()->balance_halalas)->toBe(20_000);

    // اللقطة المالية المجمّدة — مصدر التسوية الوحيد لاحقاً (H §12.10).
    $financial = $event->event_snapshot['financial'];
    expect($financial['total_amount_halalas'])->toBe(30_000)
        ->and($financial['subsidy_halalas'])->toBe(30_000)
        ->and($financial['share_per_participant_halalas'])->toBe(0)
        ->and($financial['collected_from_participants_halalas'])->toBe(0)
        // اللقطة تعود من JSON بلا تمييز int/float — المقارنة بالقيمة لا بالنوع.
        ->and($event->event_snapshot['provider']['commission_rate'])->toEqual(12.0);

    // ── المحطة 5: الاكتمال التلقائي — لحظة العمولة الوحيدة (H §12.7) ───────
    expect(SettlementItem::where('event_id', $event->id)->exists())->toBeFalse();

    $this->travelTo($event->endsAt()->copy()->addMinutes(30));
    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    $event = $event->fresh();
    $payableWallet = app(ProviderPayableService::class)->walletFor($world->partner);

    expect($event->status)->toBe('completed')
        ->and($event->completed_at)->not->toBeNull()
        // الحضور تلقائي بالكامل بلا تدخل بشري (H §13).
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->pluck('attendance_status')->unique()->all())->toBe(['attended']);

    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();

    expect($item->gross_amount_halalas)->toBe(30_000)
        ->and($item->commission_amount_halalas)->toBe(3_600)     // 12% من 300.00
        ->and($item->net_amount_halalas)->toBe(26_400)
        ->and($item->status)->toBe(SettlementItem::STATUS_PENDING)
        // دفتر مستحقات المزوّد: استحقاق بالإجمالي ثم اقتطاع العمولة.
        ->and(FinancialInvariants::ledgerBalance($payableWallet))->toBe(26_400)
        ->and(WalletTransaction::where('wallet_id', $payableWallet->id)->where('type', WalletTransactionType::Settlement)->where('direction', 'credit')->value('amount_halalas'))->toBe(30_000)
        ->and(WalletTransaction::where('wallet_id', $payableWallet->id)->where('type', WalletTransactionType::Commission)->value('amount_halalas'))->toBe(3_600)
        // محفظة المجتمع لم تتحرك عند الاكتمال — المال كله تحرك عند الإغلاق.
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(20_000);

    // ── المحطة 6: كشف التسوية — يُولَّد، يعتمده غير مولّده، ثم يُصرف ────────
    $this->travelTo(Carbon::parse('2026-08-16 03:00'));
    $this->artisan('app:generate-settlements')->assertSuccessful();

    $statement = SettlementStatement::where('partner_id', $world->partner->id)->firstOrFail();
    $service = app(SettlementStatementService::class);

    expect($statement->period_key)->toBe('2026-08-P1')
        ->and($statement->status)->toBe(SettlementStatement::STATUS_DRAFT)
        ->and($statement->gross_amount_halalas)->toBe(30_000)
        ->and($statement->commission_amount_halalas)->toBe(3_600)
        ->and($statement->net_amount_halalas)->toBe(26_400);

    $service->approve($statement, a11FinanceAdmin('المعتمِد'));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'BANK-A-001');

    $event = $event->fresh();

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_PAID)
        ->and($event->status)->toBe('settled')
        // المستحق أُفرغ بقيد صرف — لا رصيد معلق على تيمات.
        ->and(FinancialInvariants::ledgerBalance($payableWallet))->toBe(0);

    // خط سير الحالات كاملاً كما ينص جدول §9 — لا قفزة ولا كتابة حالة خارجه.
    expect(EventStatusHistory::where('event_id', $event->id)->orderBy('id')->pluck('to_status')->all())
        ->toBe(['open', 'pending_provider', 'booked', 'awaiting_payment', 'confirmed', 'in_progress', 'completed', 'settled']);

    // ── الثوابت المالية ───────────────────────────────────────────────────
    FinancialInvariants::assertAll();
});

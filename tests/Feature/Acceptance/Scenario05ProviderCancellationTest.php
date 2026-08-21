<?php

use App\Enums\WalletTransactionType;
use App\Models\EventParticipant;
use App\Models\GatewayTransaction;
use App\Models\PaymentIntent;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Payments\CollectionService;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 5 (H §23)
| «إلغاء المزوّد بعد التأكيد ← استرداد كامل لكل المشاركين + فك حجز الدعم + لا عمولة»
|--------------------------------------------------------------------------
|
| ثلاثة ادعاءات في جملة واحدة، وكلها تُفحص هنا:
|
| 1. **استرداد كامل** لكل مشارك دفع — إلى وسيلة الدفع الأصلية عبر البوابة،
|    لا إلى محفظة داخلية (H §12.4)، وبلا أي نسبة متدرجة.
| 2. **فك حجز الدعم**: الدعم كان قد استُقطع عند التأكيد، فيُعكس بقيد `refund`
|    مرتبط ويعود رصيد محفظة المجتمع كما كان بالضبط.
| 3. **لا عمولة**: العمولة تُنشأ عند `completed` حصراً (H §12.7) — والفعالية
|    لم تكتمل، فلا بند تسوية ولا قيد عمولة ولا كشف يحمل شيئاً.
|
| الإلغاء يقع من **بوابة المزوّد نفسها** لا باستدعاء خدمة.
*/

test('سيناريو 5 — إلغاء المزوّد بعد التأكيد: استرداد كامل لكل مشارك، فك حجز الدعم، ولا عمولة', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build([
        'funding_mode' => 'mixed',
        'subsidy_type' => 'fixed',
        'subsidy_value' => 10_000,   // دعم 100.00
        'price' => 300.0,
        'wallet' => 10_000,
        'commission_rate' => 12.00,
    ]);

    $communityWallet = $world->communityWallet();

    $event = $world->createEvent(min: 2, capacity: 8);
    for ($i = 0; $i < 3; $i++) {
        $world->joinNewMember($event);
    }

    $request = $world->providerAccepts($event->fresh());
    $world->closeRegistration($event->fresh());
    $event = $event->fresh();

    // أربعة مشاركين × (300 − 100) ÷ 4 = 50.00 لكل واحد.
    $intents = PaymentIntent::where('event_id', $event->id)->get();
    expect($intents)->toHaveCount(4)->and($event->final_share_halalas)->toBe(5_000);

    $collection = app(CollectionService::class);
    foreach ($intents as $index => $intent) {
        $collection->markIntentPaid($intent, "local_cancel_{$index}");
    }

    $event = $event->fresh();
    $hold = WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->firstOrFail();

    expect($event->status)->toBe('confirmed')
        ->and($hold->status)->toBe(WalletHold::STATUS_CAPTURED)
        // الدعم استُقطع فعلاً: 100.00 − 100.00 = صفر.
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0)
        ->and((int) PaymentIntent::where('event_id', $event->id)->where('status', 'paid')->sum('amount_halalas'))->toBe(20_000);

    $scoreBeforeCancel = (int) $world->partner->fresh()->reliability_score;

    // ── الإلغاء من بوابة المزوّد بعد التأكيد ───────────────────────────────
    $this->actingAs($world->partner, 'partner')
        ->post(route('partner.provider-requests.cancel', $request->fresh()), [
            'reason' => 'عطل طارئ في المرفق',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $event = $event->fresh();

    // ── 1) استرداد كامل لكل مشارك، إلى وسيلة الدفع الأصلية ─────────────────
    expect($event->status)->toBe('cancelled_provider')
        ->and(PaymentIntent::where('event_id', $event->id)->pluck('status')->unique()->all())->toBe([PaymentIntent::STATUS_REFUNDED])
        ->and(PaymentIntent::where('event_id', $event->id)->pluck('refund_status')->unique()->all())->toBe([PaymentIntent::REFUND_REFUNDED])
        // مبلغ كل استرداد = مبلغ الدفعة كاملاً — لا نسبة متدرجة (H §12.4).
        ->and((int) GatewayTransaction::where('type', GatewayTransaction::TYPE_REFUND)->where('status', 'succeeded')->sum('amount_halalas'))->toBe(20_000)
        ->and(GatewayTransaction::where('type', GatewayTransaction::TYPE_REFUND)->where('status', 'succeeded')->count())->toBe(4)
        ->and(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->pluck('payment_status')->unique()->all())->toBe(['refunded']);

    // ── 2) فك حجز الدعم: الرصيد عاد كما كان بالضبط ────────────────────────
    $subsidyRefund = WalletTransaction::where('idempotency_key', "event:{$event->id}:subsidy-refund")->firstOrFail();

    expect($subsidyRefund->type)->toBe(WalletTransactionType::Refund)
        ->and($subsidyRefund->direction)->toBe(WalletTransaction::DIRECTION_CREDIT)
        ->and($subsidyRefund->amount_halalas)->toBe(10_000)
        // «التصحيح بحركة عكسية مرتبطة بالأصلية» — لا حذف ولا تعديل.
        ->and($subsidyRefund->related_transaction_id)->not->toBeNull()
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(10_000)
        ->and((int) $communityWallet->fresh()->balance_halalas)->toBe(10_000);

    // ── 3) لا عمولة — لا بند، ولا قيد، ولا كشف يحمل شيئاً ─────────────────
    $payableWallet = Wallet::query()->withoutGlobalScopes()
        ->where('owner_type', get_class($world->partner))
        ->where('owner_id', $world->partner->id)
        ->first();

    expect(SettlementItem::count())->toBe(0)
        ->and(WalletTransaction::where('type', WalletTransactionType::Commission)->count())->toBe(0)
        ->and(WalletTransaction::where('type', WalletTransactionType::Settlement)->count())->toBe(0)
        ->and($payableWallet === null || FinancialInvariants::ledgerBalance($payableWallet) === 0)->toBeTrue();

    // ولا حتى دورة التسويات تُخرج له شيئاً عن الفترة.
    $this->travelTo(Carbon::parse('2026-08-16 03:00'));
    $this->artisan('app:generate-settlements')->assertSuccessful();

    expect(SettlementStatement::count())->toBe(0);

    // أثر السلوك على المؤشر (H §11): ‎−15 لإلغاء بعد القبول.
    expect((int) $world->partner->fresh()->reliability_score)->toBe(max(0, $scoreBeforeCancel - 15));

    FinancialInvariants::assertAll();
});

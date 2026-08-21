<?php

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventStatusHistory;
use App\Models\GatewayTransaction;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhook;
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
| سيناريو القبول 2 (H §23)
| «دورة فعالية كاملة في المسار ب (دفع الموظفين) من الإنشاء إلى التسوية»
|--------------------------------------------------------------------------
|
| المسار ب = `subsidy_value = 0` (H §12.2): لا دعم من المحفظة إطلاقاً،
| والموظفون يدفعون الإجمالي بحصص متساوية تُقفل عند إغلاق التسجيل.
|
| الدفع هنا يمر بالطريق الكامل الذي يمر به الموظف في الإنتاج:
| زر «ادفع» ← البوابة عبر `PaymentGatewayInterface` ← ويبهوك موقّع على نقطة
| الاستقبال نفسها ← `payment_status = paid`. لا اختصار ولا محاكاة للنطاق.
|
| **الوعد الملزم** (H §12.2): الحصة المعروضة عند الانضمام سقف لا يُتجاوز —
| السقف هنا 75.00 والحصة الفعلية 60.00 لأن خامساً انضم.
*/

test('سيناريو 2 — المسار ب: الموظفون يدفعون حصصهم، من الإنشاء إلى التسوية', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build([
        'funding_mode' => 'employee_paid',
        'price' => 300.0,
        'commission_rate' => 12.00,
    ]);

    $communityWallet = $world->communityWallet();

    // ── المحطة 1: الإنشاء — لا دعم، والسقف المعلن = 300 ÷ 4 = 75.00 ────────
    $event = $world->createEvent(min: 4, capacity: 8);

    expect($event->status)->toBe('open')
        ->and($event->total_amount_halalas)->toBe(30_000)
        ->and($event->subsidy_type)->toBe('fixed')
        ->and($event->subsidy_value)->toBe(0)
        ->and($event->max_share_halalas)->toBe(7_500)
        ->and((string) $event->max_share)->toBe('75.00')
        ->and(WalletTransaction::count())->toBe(0);

    // ── المحطة 2: خمسة ينضمون (الحد 4) — الطلب يُرسل عند الرابع ────────────
    $members = [$world->leader];
    for ($i = 0; $i < 4; $i++) {
        $joined = $world->joinNewMember($event);
        expect($joined['seat'])->toBe('reserved');
        $members[] = $joined['employee'];

        if ($i === 2) {
            // الرابع (المنشئ + ثلاثة) بلغ الحد الأدنى.
            expect($event->fresh()->status)->toBe('pending_provider');
        }
    }

    $event = $event->fresh();

    expect($event->participants_count)->toBe(5)
        ->and($event->status)->toBe('pending_provider')
        ->and(PaymentIntent::count())->toBe(0)   // لا تحصيل أثناء التسجيل
        ->and(WalletTransaction::count())->toBe(0);

    // ── المحطة 3: قبول المزوّد — لا مال ────────────────────────────────────
    $world->providerAccepts($event);

    expect($event->fresh()->status)->toBe('booked')
        ->and(WalletTransaction::count())->toBe(0);

    // ── المحطة 4: إغلاق التسجيل — الحصة تُقفل ومطالبة لكل مشارك ────────────
    $world->closeRegistration($event);
    $event = $event->fresh();

    $intents = PaymentIntent::where('event_id', $event->id)->orderBy('id')->get();

    expect($event->status)->toBe('awaiting_payment')
        ->and($event->funding_status)->toBe('collecting')
        ->and($event->subsidy_halalas)->toBe(0)
        // (300 − 0) ÷ 5 = 60.00، وهي دون السقف المعلن 75.00 — الوعد محفوظ.
        ->and($event->final_share_halalas)->toBe(6_000)
        ->and($event->rounding_remainder_halalas)->toBe(0)
        ->and($intents)->toHaveCount(5)
        ->and($intents->pluck('amount_halalas')->unique()->all())->toBe([6_000])
        ->and($intents->every(fn (PaymentIntent $i) => $i->amount_halalas <= $event->max_share_halalas))->toBeTrue()
        ->and(EventParticipant::where('event_id', $event->id)->pluck('payment_status')->unique()->all())->toBe(['due'])
        // لا حجز ولا قيد على محفظة المجتمع: المسار ب لا يمس المحفظة أصلاً.
        ->and(WalletHold::count())->toBe(0)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0)
        ->and(WalletTransaction::count())->toBe(0);

    // ── المحطة 5: الدفع الحقيقي — زر «ادفع» ← البوابة ← ويبهوك موقّع ───────
    foreach ($intents as $index => $intent) {
        $payer = collect($members)->firstWhere('id', $intent->employee_id);

        $this->actingAs($payer, 'employee')
            ->post(route('employee.payments.pay', ['intent' => $intent->id]))
            ->assertRedirect();

        $reference = $intent->fresh()->gateway_reference;
        expect($reference)->toStartWith('local_');

        $this->post(route('test-gateway.complete', ['reference' => $reference]), ['action' => 'success']);

        expect($intent->fresh()->status)->toBe(PaymentIntent::STATUS_PAID)
            ->and(PaymentWebhook::where('gateway_reference', $reference)->value('processing_status'))->toBe(PaymentWebhook::STATUS_PROCESSED);

        // الفعالية لا تتأكد إلا بعد آخر حصة — لا قبلها.
        expect(Event::withoutGlobalScopes()->whereKey($event->id)->value('status'))
            ->toBe($index === $intents->count() - 1 ? 'confirmed' : 'awaiting_payment');
    }

    $event = $event->fresh();

    expect($event->funding_status)->toBe('collected')
        ->and((int) PaymentIntent::where('event_id', $event->id)->where('status', 'paid')->sum('amount_halalas'))->toBe(30_000)
        ->and(GatewayTransaction::where('type', GatewayTransaction::TYPE_PAYMENT)->where('status', 'succeeded')->count())->toBe(5)
        ->and(EventParticipant::where('event_id', $event->id)->pluck('payment_status')->unique()->all())->toBe(['paid'])
        // «دفتر مال الموظفين» خارج دفتر المحافظ عمداً (H §12.4).
        ->and(WalletTransaction::count())->toBe(0);

    $financial = $event->event_snapshot['financial'];
    expect($financial['total_amount_halalas'])->toBe(30_000)
        ->and($financial['subsidy_halalas'])->toBe(0)
        ->and($financial['share_per_participant_halalas'])->toBe(6_000)
        ->and($financial['collected_from_participants_halalas'])->toBe(30_000)
        ->and($financial['base_amount_halalas'] + $financial['vat_amount_halalas'])->toBe(30_000);

    // ── المحطة 6: الاكتمال — العمولة تُقيَّد هنا وحدها ─────────────────────
    $this->travelTo($event->endsAt()->copy()->addMinutes(30));
    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    $event = $event->fresh();
    $payableWallet = app(ProviderPayableService::class)->walletFor($world->partner);
    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();

    expect($event->status)->toBe('completed')
        ->and($item->gross_amount_halalas)->toBe(30_000)
        ->and($item->commission_amount_halalas)->toBe(3_600)
        ->and($item->net_amount_halalas)->toBe(26_400)
        ->and(FinancialInvariants::ledgerBalance($payableWallet))->toBe(26_400)
        // ولا ريال واحد خرج من محفظة المجتمع في المسار ب.
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0);

    // ── المحطة 7: التسوية — اعتماد من غير المولّد ثم صرف ──────────────────
    $this->travelTo(Carbon::parse('2026-08-16 03:00'));
    $this->artisan('app:generate-settlements')->assertSuccessful();

    $statement = SettlementStatement::where('partner_id', $world->partner->id)->firstOrFail();
    $service = app(SettlementStatementService::class);

    $service->approve($statement, a11FinanceAdmin('المعتمِد'));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'BANK-B-001');

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_PAID)
        ->and($statement->fresh()->net_amount_halalas)->toBe(26_400)
        ->and($event->fresh()->status)->toBe('settled')
        ->and(FinancialInvariants::ledgerBalance($payableWallet))->toBe(0);

    expect(EventStatusHistory::where('event_id', $event->id)->orderBy('id')->pluck('to_status')->all())
        ->toBe(['open', 'pending_provider', 'booked', 'awaiting_payment', 'confirmed', 'in_progress', 'completed', 'settled']);

    FinancialInvariants::assertAll();
});

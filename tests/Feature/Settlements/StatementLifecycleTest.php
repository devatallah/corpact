<?php

use App\Enums\WalletTransactionType;
use App\Exceptions\PaidSettlementImmutableException;
use App\Exceptions\SelfApprovalException;
use App\Models\EventStatusHistory;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\WalletTransaction;
use App\Services\Billing\ProviderPayableService;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Support\Carbon;

// H §12.7 + G/الأدمن المالي §3: كشف كل 15 يوماً لكل مزوّد · draft ← approved
// ← paid · من ولّده لا يعتمده ولا يصرفه · لا صرف قبل اعتماد الحساب البنكي ·
// الصرف بعد التحويل الفعلي ينقل الفعاليات إلى «مسوّاة» · المدفوع لا يُعدَّل.

test('the 15-day period boundaries follow the 1st and 16th cadence', function () {
    $service = app(SettlementStatementService::class);

    // تشغيل يوم 16 ⇒ الفترة المنتهية هي 1 → 15 من الشهر نفسه.
    $second = $service->periodEndingBefore(Carbon::parse('2026-08-16 03:00'));
    expect($second['key'])->toBe('2026-08-P1')
        ->and($second['start']->toDateString())->toBe('2026-08-01')
        ->and($second['end']->toDateString())->toBe('2026-08-15');

    // تشغيل يوم 1 ⇒ الفترة المنتهية هي 16 → آخر الشهر الماضي.
    $first = $service->periodEndingBefore(Carbon::parse('2026-09-01 03:00'));
    expect($first['key'])->toBe('2026-08-P2')
        ->and($first['start']->toDateString())->toBe('2026-08-16')
        ->and($first['end']->toDateString())->toBe('2026-08-31');
});

test('the scheduled job aggregates a provider completed items into one statement', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);

    Carbon::setTestNow(Carbon::parse('2026-08-10 12:00'));
    a11CompletedEvent(['partner' => $partner, 'total' => 300.0, 'completed_at' => Carbon::parse('2026-08-05 20:00')]);
    a11CompletedEvent(['partner' => $partner, 'total' => 200.0, 'completed_at' => Carbon::parse('2026-08-12 20:00')]);

    Carbon::setTestNow(Carbon::parse('2026-08-16 03:00'));
    test()->artisan('app:generate-settlements')->assertSuccessful();

    $statement = SettlementStatement::where('partner_id', $partner->id)->firstOrFail();

    expect($statement->period_key)->toBe('2026-08-P1')
        ->and($statement->status)->toBe(SettlementStatement::STATUS_DRAFT)
        ->and($statement->items_count)->toBe(2)
        ->and($statement->gross_amount_halalas)->toBe(50_000)
        ->and($statement->commission_amount_halalas)->toBe(6_000)
        ->and($statement->net_amount_halalas)->toBe(44_000)
        ->and($statement->generated_by_user_id)->toBeNull();

    expect(SettlementItem::where('partner_id', $partner->id)->where('status', SettlementItem::STATUS_INCLUDED)->count())->toBe(2);

    // إعادة التشغيل لنفس الفترة لا تنشئ كشفاً ثانياً.
    test()->artisan('app:generate-settlements')->assertSuccessful();
    expect(SettlementStatement::where('partner_id', $partner->id)->count())->toBe(1);

    Carbon::setTestNow();
});

test('the provider is notified the moment a statement is ready', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 10.00, 'bank_status' => 'approved']);
    a11CompletedEvent(['partner' => $partner]);

    app(SettlementStatementService::class)->generateAll(
        app(SettlementStatementService::class)->periodEndingBefore(now()->addMonth()),
    );

    $notification = Notification::where('notifiable_type', Partner::class)
        ->where('notifiable_id', $partner->id)
        ->where('template_key', 'settlement.ready')
        ->first();

    expect($notification)->not->toBeNull();
});

test('the generator of a statement may neither approve nor pay it', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    a11CompletedEvent(['partner' => $partner]);

    $generator = a11FinanceAdmin('المولِّد');
    $service = app(SettlementStatementService::class);

    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()), $generator);

    expect(fn () => $service->approve($statement, $generator))
        ->toThrow(SelfApprovalException::class);

    // معتمِد آخر يعتمد بلا مشكلة.
    $approver = a11FinanceAdmin('المعتمِد');
    $service->approve($statement, $approver);

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_APPROVED)
        ->and($statement->fresh()->approved_by_user_id)->toBe($approver->id);

    // والمولِّد ممنوع من تسجيل الصرف أيضاً.
    expect(fn () => $service->markPaid($statement->fresh(), $generator, 'REF-1'))
        ->toThrow(SelfApprovalException::class);
});

test('no payout is recorded while the provider bank account is unapproved', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'pending']);
    a11CompletedEvent(['partner' => $partner]);

    $service = app(SettlementStatementService::class);
    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));
    $service->approve($statement, a11FinanceAdmin('المعتمِد'));

    expect(fn () => $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'REF-1'))
        ->toThrow(RuntimeException::class, 'حساب المزوّد البنكي غير معتمد — لا صرف قبل اعتماده.');

    // بعد الاعتماد يمر الصرف.
    $partner->forceFill(['bank_status' => 'approved'])->save();
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف2'), 'REF-1');

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_PAID);
});

test('recording the payout settles the events and posts the settlement ledger entry', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    ['event' => $event] = a11CompletedEvent(['partner' => $partner, 'total' => 300.0]);

    $service = app(SettlementStatementService::class);
    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));
    $service->approve($statement, a11FinanceAdmin('المعتمِد'));

    expect($event->fresh()->status)->toBe('completed');

    $payer = a11FinanceAdmin('الصارف');
    $service->markPaid($statement->fresh(), $payer, 'BANK-REF-77', Carbon::now()->subDay());

    $statement = $statement->fresh();
    $wallet = app(ProviderPayableService::class)->walletFor($partner);
    $payout = WalletTransaction::where('idempotency_key', "provider-payout:statement:{$statement->id}")->firstOrFail();

    expect($statement->status)->toBe(SettlementStatement::STATUS_PAID)
        ->and($statement->payout_reference)->toBe('BANK-REF-77')
        ->and($statement->paid_by_user_id)->toBe($payer->id)
        // الفعالية انتقلت إلى «مسوّاة» عبر آلة A7 (لا كتابة حالة مباشرة).
        ->and($event->fresh()->status)->toBe('settled')
        ->and(EventStatusHistory::where('event_id', $event->id)->where('to_status', 'settled')->exists())->toBeTrue()
        // بنود الكشف صارت مدفوعة، والمستحق أُفرغ بقيد تسوية.
        ->and(SettlementItem::where('settlement_statement_id', $statement->id)->pluck('status')->unique()->all())->toBe([SettlementItem::STATUS_PAID])
        ->and($payout->type)->toBe(WalletTransactionType::Settlement)
        ->and($payout->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($payout->amount_halalas)->toBe(26_400)
        ->and((int) $wallet->fresh()->balance_halalas)->toBe(0);
});

test('a paid statement can never be edited again', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    a11CompletedEvent(['partner' => $partner]);

    $service = app(SettlementStatementService::class);
    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));
    $service->approve($statement, a11FinanceAdmin('المعتمِد'));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'REF-9');

    $paid = $statement->fresh();

    expect(fn () => $paid->forceFill(['net_amount_halalas' => 1])->save())
        ->toThrow(PaidSettlementImmutableException::class);

    expect(fn () => $paid->delete())
        ->toThrow(PaidSettlementImmutableException::class);

    // ولا يُعاد اعتماده ولا صرفه.
    expect(fn () => $service->approve($paid, a11FinanceAdmin('آخر')))
        ->toThrow(RuntimeException::class);
});

test('a paid item cannot be silently rewritten', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    a11CompletedEvent(['partner' => $partner]);

    $service = app(SettlementStatementService::class);
    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));
    $service->approve($statement, a11FinanceAdmin('المعتمِد'));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'REF-9');

    $item = SettlementItem::where('settlement_statement_id', $statement->id)->firstOrFail();

    expect(fn () => $item->forceFill(['net_amount_halalas' => 1])->save())
        ->toThrow(PaidSettlementImmutableException::class);

    expect(fn () => $item->delete())
        ->toThrow(PaidSettlementImmutableException::class);
});

test('a statement cannot jump straight from draft to paid', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    a11CompletedEvent(['partner' => $partner]);

    $service = app(SettlementStatementService::class);
    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));

    expect(fn () => $service->markPaid($statement, a11FinanceAdmin('الصارف'), 'REF-1'))
        ->toThrow(RuntimeException::class, 'لا يُسجَّل الصرف إلا لكشف معتمد.');
});

// سيناريو القبول 9 نفسه يعيش في حزمة القبول
// (tests/Feature/Acceptance/Scenario09SettlementStatementTest.php)؛ هذا انحدارُ
// نطاق A11 على المسار نفسه.
test('a statement for a provider with 12 completed events aggregates, approves and pays out', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);

    Carbon::setTestNow(Carbon::parse('2026-08-10 12:00'));

    $events = [];
    for ($i = 0; $i < 12; $i++) {
        ['event' => $event] = a11CompletedEvent([
            'partner' => $partner,
            'total' => 300.0,
            'completed_at' => Carbon::parse('2026-08-0'.(($i % 9) + 1).' 20:00'),
        ]);
        $events[] = $event;
    }

    Carbon::setTestNow(Carbon::parse('2026-08-16 03:00'));
    test()->artisan('app:generate-settlements')->assertSuccessful();

    $statement = SettlementStatement::where('partner_id', $partner->id)->firstOrFail();

    expect($statement->items_count)->toBe(12)
        ->and($statement->gross_amount_halalas)->toBe(12 * 30_000)
        ->and($statement->commission_amount_halalas)->toBe(12 * 3_600)
        ->and($statement->net_amount_halalas)->toBe(12 * 26_400);

    $service = app(SettlementStatementService::class);
    $service->approve($statement, a11FinanceAdmin('المعتمِد'));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'BANK-12');

    foreach ($events as $event) {
        expect($event->fresh()->status)->toBe('settled');
    }

    expect((int) app(ProviderPayableService::class)->walletFor($partner)->fresh()->balance_halalas)->toBe(0);

    Carbon::setTestNow();
});

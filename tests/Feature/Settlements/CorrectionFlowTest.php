<?php

use App\Enums\WalletTransactionType;
use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\WalletTransaction;
use App\Services\Billing\ProviderPayableService;
use App\Services\Billing\SettlementCorrectionService;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Support\Carbon;

// H §12.7: «لا تُبنى دورة نزاع كاملة في الإصدار الأول. البديل المعتمد:
// الأدمن المالي يصحّح أي بند يدوياً بحركة عكسية + بند تصحيحي في الكشف
// التالي، مع سبب إلزامي في سجل التدقيق. ولا يُعدَّل كشف مدفوع إطلاقاً.»

function a11PaidStatement(Partner $partner, float $total = 300.0): SettlementStatement
{
    $service = app(SettlementStatementService::class);
    a11CompletedEvent(['partner' => $partner, 'total' => $total]);

    $statement = $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));
    $service->approve($statement, a11FinanceAdmin('المعتمِد'.uniqid()));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'.uniqid()), 'REF-'.uniqid());

    return $statement->fresh();
}

test('correcting a paid item reverses the entries and lands a corrective item in the next statement', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11PaidStatement($partner, 300.0);
    $item = SettlementItem::where('settlement_statement_id', $statement->id)->firstOrFail();

    $actor = a11FinanceAdmin('المصحِّح');

    // السعر الصحيح كان 250.00 لا 300.00.
    $correction = app(SettlementCorrectionService::class)->correct(
        $item,
        25_000,
        null,
        'المزوّد خفّض السعر بعد الاتفاق ولم يُحدَّث قبل الاحتساب',
        $actor,
    );

    expect($correction->type)->toBe(SettlementItem::TYPE_CORRECTION)
        ->and($correction->status)->toBe(SettlementItem::STATUS_PENDING)
        ->and($correction->corrects_item_id)->toBe($item->id)
        ->and($correction->settlement_statement_id)->toBeNull()
        // الفرق موقّع: 250 − 300 = ‎−50.00 إجمالي، وصافي ‎−44.00.
        ->and($correction->gross_amount_halalas)->toBe(-5_000)
        ->and($correction->commission_amount_halalas)->toBe(-600)
        ->and($correction->net_amount_halalas)->toBe(-4_400)
        ->and($correction->reason)->toBe('المزوّد خفّض السعر بعد الاتفاق ولم يُحدَّث قبل الاحتساب');

    // البند الأصلي يُختم مصحَّحاً ولا تُمس مبالغه ولا لقطته.
    $item = $item->fresh();
    expect($item->status)->toBe(SettlementItem::STATUS_ADJUSTED)
        ->and($item->gross_amount_halalas)->toBe(30_000)
        ->and($item->net_amount_halalas)->toBe(26_400);

    // والكشف المدفوع نفسه لم يتغير بحرف.
    $statement = $statement->fresh();
    expect($statement->status)->toBe(SettlementStatement::STATUS_PAID)
        ->and($statement->net_amount_halalas)->toBe(26_400)
        ->and($statement->items_count)->toBe(1);

    // حركات عكسية مرتبطة — لا حذف ولا تعديل لأي قيد.
    $accrual = WalletTransaction::where('idempotency_key', "provider-payable:event:{$item->event_id}:accrual")->firstOrFail();
    $reversal = WalletTransaction::where('idempotency_key', "settlement-correction:item:{$item->id}:reverse:{$accrual->id}")->firstOrFail();

    expect($reversal->type)->toBe(WalletTransactionType::Adjustment)
        ->and($reversal->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($reversal->related_transaction_id)->toBe($accrual->id)
        ->and(WalletTransaction::where('idempotency_key', "settlement-correction:item:{$correction->id}:accrual")->value('amount_halalas'))->toBe(25_000);

    // الرصيد بعد الصرف الكامل ثم التصحيح = ‎−44.00 (زيادة مصروفة تُخصم لاحقاً).
    expect((int) app(ProviderPayableService::class)->walletFor($partner)->fresh()->balance_halalas)->toBe(-4_400);

    // سبب إلزامي في سجل التدقيق.
    expect(ActivityLog::where('type', 'settlement_item_corrected')->exists())->toBeTrue();
});

test('the corrective item is swept into the very next statement', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-05 12:00'));

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11PaidStatement($partner, 300.0);
    $item = SettlementItem::where('settlement_statement_id', $statement->id)->firstOrFail();

    app(SettlementCorrectionService::class)->correct($item, 25_000, null, 'تصحيح سعر', a11FinanceAdmin('المصحِّح'));

    // الكشف التالي في دورة لاحقة يلتقط البند التصحيحي وحده — «في الكشف التالي».
    Carbon::setTestNow(Carbon::parse('2026-09-16 03:00'));
    test()->artisan('app:generate-settlements')->assertSuccessful();

    $next = SettlementStatement::where('partner_id', $partner->id)
        ->where('id', '!=', $statement->id)
        ->firstOrFail();

    expect($next->items_count)->toBe(1)
        ->and($next->net_amount_halalas)->toBe(-4_400)
        ->and($next->items()->first()->type)->toBe(SettlementItem::TYPE_CORRECTION);

    Carbon::setTestNow();
});

test('a correction without a written reason is refused', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11PaidStatement($partner);
    $item = SettlementItem::where('settlement_statement_id', $statement->id)->firstOrFail();

    expect(fn () => app(SettlementCorrectionService::class)->correct($item, 25_000, null, '   ', a11FinanceAdmin('المصحِّح')))
        ->toThrow(InvalidArgumentException::class);

    expect(SettlementItem::where('type', SettlementItem::TYPE_CORRECTION)->count())->toBe(0);
});

test('an item that never entered a statement is regenerated, not corrected', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    ['event' => $event] = a11CompletedEvent(['partner' => $partner]);

    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();

    expect(fn () => app(SettlementCorrectionService::class)->correct($item, 25_000, null, 'سبب', a11FinanceAdmin('المصحِّح')))
        ->toThrow(RuntimeException::class);
});

test('correcting the commission rate alone reprices the item', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11PaidStatement($partner, 300.0);
    $item = SettlementItem::where('settlement_statement_id', $statement->id)->firstOrFail();

    // النسبة الصحيحة في العقد 10% لا 12%.
    $correction = app(SettlementCorrectionService::class)->correct(
        $item,
        30_000,
        10.0,
        'نسبة العقد 10% لا 12%',
        a11FinanceAdmin('المصحِّح'),
    );

    // العمولة الصحيحة 30.00 بدل 36.00 ⇒ فرق العمولة ‎−6.00 وفرق الصافي ‎+6.00.
    expect($correction->commission_amount_halalas)->toBe(-600)
        ->and($correction->net_amount_halalas)->toBe(600)
        ->and((float) $correction->commission_rate_percent)->toBe(10.0);
});

<?php

use App\Enums\WalletTransactionType;
use App\Events\EventCompleted;
use App\Jobs\CompleteEvent;
use App\Models\AdminAlert;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Billing\CommissionService;
use App\Services\Billing\ProviderPayableService;
use App\Services\Events\EventStateMachine;

// H §12.7: «قيد العمولة يُنشأ عند انتقال الفعالية إلى `completed` حصراً —
// لا قبله بأي حال»، وبند التسوية معه. المصدر الوحيد للأرقام هو اللقطة.

test('no commission and no settlement item exist before completed', function () {
    fakeMessages();

    ['event' => $event, 'partner' => $partner] = a11CompletedEvent(['complete' => false]);

    expect($event->status)->toBe('confirmed')
        ->and(SettlementItem::count())->toBe(0);

    $wallet = app(ProviderPayableService::class)->walletFor($partner);
    expect((int) $wallet->balance_halalas)->toBe(0)
        ->and(WalletTransaction::where('wallet_id', $wallet->id)->count())->toBe(0);

    // حتى النداء المباشر على الخدمة يرفض احتساب فعالية غير مكتملة.
    expect(app(CommissionService::class)->recordForCompletedEvent($event))->toBeNull()
        ->and(SettlementItem::count())->toBe(0);
});

test('completing an event creates the commission entry and the settlement item from the snapshot', function () {
    fakeMessages();

    ['event' => $event, 'partner' => $partner, 'company' => $company] = a11CompletedEvent([
        'total' => 300.0,
        'commission_rate' => 12.0,
    ]);

    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();

    // مثال دليل المزوّد §7 حرفياً: 300.00 · عمولة 12% = 36.00 · صافي 264.00.
    expect($item->gross_amount_halalas)->toBe(30_000)
        ->and($item->commission_amount_halalas)->toBe(3_600)
        ->and($item->net_amount_halalas)->toBe(26_400)
        // ضريبة العمولة (تيمات أصيل فيها — H §12.9): floor(3600×15÷115) نظيرها.
        ->and($item->vat_amount_halalas)->toBe(470)
        // ضريبة قيمة النشاط تُحفظ ولا تُخصم (تيمات وكيل فيها).
        ->and($item->activity_vat_amount_halalas)->toBe(3_914)
        ->and($item->status)->toBe(SettlementItem::STATUS_PENDING)
        ->and($item->type)->toBe(SettlementItem::TYPE_EVENT)
        ->and((float) $item->commission_rate_percent)->toBe(12.0)
        ->and($item->company_id)->toBe($company->id)
        ->and($item->tax_treatment)->toBe('principal')
        ->and($item->invoice_issuer)->toBe('teamat');

    // قيدا الدفتر: استحقاق الإجمالي ثم اقتطاع العمولة — الرصيد = الصافي.
    $wallet = app(ProviderPayableService::class)->walletFor($partner);

    $accrual = WalletTransaction::where('idempotency_key', "provider-payable:event:{$event->id}:accrual")->firstOrFail();
    $commission = WalletTransaction::where('idempotency_key', "provider-payable:event:{$event->id}:commission")->firstOrFail();

    expect($accrual->type)->toBe(WalletTransactionType::Settlement)
        ->and($accrual->direction)->toBe(WalletTransaction::DIRECTION_CREDIT)
        ->and($accrual->amount_halalas)->toBe(30_000)
        ->and($commission->type)->toBe(WalletTransactionType::Commission)
        ->and($commission->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($commission->amount_halalas)->toBe(3_600)
        ->and((int) $wallet->fresh()->balance_halalas)->toBe(26_400);
});

test('re-firing the completion event is idempotent — no second item and no second ledger entry', function () {
    fakeMessages();

    ['event' => $event, 'partner' => $partner] = a11CompletedEvent();

    event(new EventCompleted($event->id));
    event(new EventCompleted($event->id));
    app(CommissionService::class)->recordForCompletedEvent($event->fresh());

    $wallet = app(ProviderPayableService::class)->walletFor($partner);

    expect(SettlementItem::where('event_id', $event->id)->count())->toBe(1)
        ->and(WalletTransaction::where('wallet_id', $wallet->id)->count())->toBe(2)
        ->and((int) $wallet->fresh()->balance_halalas)->toBe(26_400);
});

test('the item snapshot stays frozen when the provider profile changes afterwards', function () {
    fakeMessages();

    ['event' => $event, 'partner' => $partner] = a11CompletedEvent([
        'total' => 300.0,
        'commission_rate' => 12.0,
    ]);

    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();
    $frozenName = $item->snapshot_json['provider']['name'];

    // يتغير ملف المزوّد بعد الاحتساب — لا شيء من التاريخ يتحرك.
    $partner->forceFill(['name' => 'اسم تجاري جديد', 'commission_rate' => 30.00])->save();

    $item = $item->fresh();

    expect($item->snapshot_json['provider']['name'])->toBe($frozenName)
        ->and((float) $item->snapshot_json['provider']['commission_rate'])->toBe(12.0)
        ->and($item->snapshot_json['pricing']['total_amount_halalas'])->toBe(30_000)
        ->and($item->commission_amount_halalas)->toBe(3_600)
        ->and($item->net_amount_halalas)->toBe(26_400);
});

test('a cancelled event never produces a commission entry', function () {
    fakeMessages();

    ['event' => $event, 'partner' => $partner] = a11CompletedEvent(['complete' => false]);

    app(EventStateMachine::class)->cancelCompany($event, null, 'إلغاء اختباري');

    event(new EventCompleted($event->id));

    $wallet = app(ProviderPayableService::class)->walletFor($partner);

    expect(SettlementItem::count())->toBe(0)
        ->and(WalletTransaction::where('wallet_id', $wallet->id)->count())->toBe(0);
});

test('a completed event without a snapshot is skipped and screamed about, never guessed', function () {
    fakeMessages();

    ['event' => $event] = a11CompletedEvent(['complete' => false]);

    // فعالية بلا لقطة (مرحّلة من قبل A7/A10) — لا يجوز التخمين من الملف الحيّ.
    $event->forceFill(['event_snapshot' => null, 'status' => 'completed', 'completed_at' => now()])->save();

    expect(app(CommissionService::class)->recordForCompletedEvent($event->fresh()))->toBeNull()
        ->and(SettlementItem::count())->toBe(0)
        ->and(AdminAlert::where('key', 'settlement.item_uncomputable')->exists())->toBeTrue();
});

test('a provider without a contracted commission rate blocks computation instead of defaulting', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => null, 'bank_status' => 'approved']);

    ['event' => $event] = a11CompletedEvent(['partner' => $partner]);

    expect(SettlementItem::count())->toBe(0)
        ->and(AdminAlert::where('key', 'settlement.item_uncomputable')->exists())->toBeTrue();
});

test('the halala rounding remainder rides on the commission side of the item', function () {
    fakeMessages();

    ['event' => $event] = a11CompletedEvent(['complete' => false]);

    // A10 يسجّل فرق الكسور على الفعالية ويحمّله على جانب العمولة (H §24).
    $event->forceFill(['rounding_remainder_halalas' => 2])->save();
    $snapshot = $event->event_snapshot;
    $snapshot['financial']['rounding_remainder_halalas'] = 2;
    $event->forceFill(['event_snapshot' => $snapshot])->save();

    (new CompleteEvent($event->id))->handle();

    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();

    expect($item->rounding_remainder_halalas)->toBe(2)
        ->and($item->snapshot_json['pricing']['rounding_remainder_charged_to'])->toBe('teamat_commission')
        // ولا يمس صافي المزوّد: 300.00 − 36.00 = 264.00 كما في المثال.
        ->and($item->net_amount_halalas)->toBe(26_400);
});

test('the provider payable wallet lives outside any company scope', function () {
    fakeMessages();

    ['partner' => $partner] = a11CompletedEvent();

    $wallet = Wallet::withoutGlobalScopes()
        ->where('owner_type', Partner::class)
        ->where('owner_id', $partner->id)
        ->firstOrFail();

    expect($wallet->company_id)->toBeNull();
});

<?php

use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Company;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Company\WalletService;
use App\Services\Wallet\LedgerService;
use Illuminate\Validation\ValidationException;

// H §12.5: محافظ فرعية للمجتمعات تُموَّل بتخصيص من الرئيسية — زوج قيود
// allocation في الدفتر، لا عمود رصيد. (بند القبول للمرحلة الثانية.)

test('allocation writes a linked ledger pair and moves both balances', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $ledger = app(LedgerService::class);

    $main = Wallet::mainFor($company);
    $ledger->credit($main, WalletTransactionType::TopUp, 100_000, 'test:fund');

    app(WalletService::class)->distributeToCommunity($company, $community, 250.0);

    $main->refresh();
    $sub = Wallet::subFor($community)->refresh();

    expect($main->balance_halalas)->toBe(75_000)
        ->and($sub->balance_halalas)->toBe(25_000);

    $out = WalletTransaction::query()
        ->where('wallet_id', $main->id)->where('type', WalletTransactionType::Allocation)->first();
    $in = WalletTransaction::query()
        ->where('wallet_id', $sub->id)->where('type', WalletTransactionType::Allocation)->first();

    expect($out)->not->toBeNull()
        ->and($in)->not->toBeNull()
        ->and($out->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($in->direction)->toBe(WalletTransaction::DIRECTION_CREDIT)
        ->and($in->related_transaction_id)->toBe($out->id);

    // الرصيد المشتق للمجتمع يقرأ من الدفتر عبر المحفظة الفرعية.
    expect($community->fresh()->balance)->toBe(250.0);
});

test('allocation beyond the main wallet balance is refused', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    app(LedgerService::class)->credit(Wallet::mainFor($company), WalletTransactionType::TopUp, 10_000, 'test:fund');

    expect(fn () => app(WalletService::class)->distributeToCommunity($company, $community, 500.0))
        ->toThrow(ValidationException::class);

    expect(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(10_000)
        ->and($community->fresh()->balance)->toBe(0.0);
});

test('allocation reversal returns the money as a linked pair', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $ledger = app(LedgerService::class);

    $main = Wallet::mainFor($company);
    $sub = Wallet::subFor($community);
    $ledger->credit($main, WalletTransactionType::TopUp, 50_000, 'test:fund');
    $pair = $ledger->allocate($main, $sub, 20_000, 'test:alloc');

    $reversal = $ledger->reverseAllocation($pair['out'], $pair['in'], 'test:alloc-reversal', null, 'خُصِّص للمجتمع الخطأ');

    expect($main->fresh()->balance_halalas)->toBe(50_000)
        ->and($sub->fresh()->balance_halalas)->toBe(0)
        ->and($reversal['out']->type)->toBe(WalletTransactionType::AllocationReversal)
        ->and($reversal['out']->related_transaction_id)->toBe($pair['in']->id)
        ->and($reversal['in']->related_transaction_id)->toBe($pair['out']->id);
});

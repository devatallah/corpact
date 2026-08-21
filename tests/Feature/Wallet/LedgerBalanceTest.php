<?php

use App\Enums\WalletTransactionType;
use App\Exceptions\InsufficientBalanceException;
use App\Models\Community;
use App\Models\Company;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Wallet\LedgerService;

// H §12.5: لا عمود رصيد قابل للكتابة — الرصيد = Σ الحركات، وعمود الـ cache
// يُحدَّث حصراً داخل نفس المعاملة مع قيد الدفتر.

beforeEach(function () {
    $this->ledger = app(LedgerService::class);
    $this->wallet = Wallet::mainFor(Company::factory()->create());
});

test('balance is derived from the ledger and the cache follows it', function () {
    $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 10_000, 'test:credit-1');
    $this->ledger->debit($this->wallet, WalletTransactionType::Capture, 3_000, 'test:debit-1');

    expect($this->ledger->balanceFromLedger($this->wallet))->toBe(7_000)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(7_000)
        ->and($this->wallet->fresh()->balance)->toBe(70.0);
});

test('the balance columns are not mass assignable', function () {
    expect((new Wallet)->isFillable('balance_halalas'))->toBeFalse()
        ->and(in_array('balance', (new Community)->getFillable(), true))->toBeFalse();
});

test('the same idempotency key never produces a double effect', function () {
    $first = $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 5_000, 'test:same-key');
    $second = $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 5_000, 'test:same-key');

    expect($second->id)->toBe($first->id)
        ->and(WalletTransaction::query()->where('wallet_id', $this->wallet->id)->count())->toBe(1)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(5_000);
});

test('a debit beyond the balance is refused', function () {
    $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 1_000, 'test:small-credit');

    expect(fn () => $this->ledger->debit($this->wallet, WalletTransactionType::Capture, 2_000, 'test:overdraw'))
        ->toThrow(InsufficientBalanceException::class);

    expect($this->wallet->fresh()->balance_halalas)->toBe(1_000);
});

test('zero and negative amounts are refused', function () {
    expect(fn () => $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 0, 'test:zero'))
        ->toThrow(InvalidArgumentException::class);

    expect(fn () => $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, -100, 'test:negative'))
        ->toThrow(InvalidArgumentException::class);
});

test('a linked reversal corrects an entry without touching it', function () {
    $original = $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 8_000, 'test:original');

    $reversal = $this->ledger->reverse($original, 'test:reversal', 'قيد بالخطأ');

    expect($reversal->type)->toBe(WalletTransactionType::Adjustment)
        ->and($reversal->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($reversal->related_transaction_id)->toBe($original->id)
        ->and($reversal->note)->toBe('قيد بالخطأ')
        ->and($original->fresh()->amount_halalas)->toBe(8_000)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(0);
});

<?php

use App\Enums\WalletTransactionType;
use App\Exceptions\InsufficientBalanceException;
use App\Models\Company;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Wallet\LedgerService;

// أساس الحجز/الفك/الاستقطاع (H §12.5) الذي يبني عليه A10 تدفق التحصيل:
// الحجز يخفض الرصيد المتاح فوراً بقيد hold، والفك يعيده بقيد hold_release،
// والاستقطاع hold_release + capture — فيبقى الرصيد = Σ الدفتر دائماً.

beforeEach(function () {
    $this->ledger = app(LedgerService::class);
    $this->wallet = Wallet::mainFor(Company::factory()->create());
    $this->ledger->credit($this->wallet, WalletTransactionType::TopUp, 100_000, 'test:fund');
});

test('a hold immediately reduces the available balance', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-1');

    expect($hold->status)->toBe(WalletHold::STATUS_ACTIVE)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(60_000)
        ->and($this->ledger->balanceFromLedger($this->wallet))->toBe(60_000)
        ->and($hold->holdTransaction->type)->toBe(WalletTransactionType::Hold);
});

test('a hold beyond the balance is refused', function () {
    expect(fn () => $this->ledger->hold($this->wallet, 200_000, 'test:hold-too-big'))
        ->toThrow(InsufficientBalanceException::class);

    expect($this->wallet->fresh()->balance_halalas)->toBe(100_000)
        ->and(WalletHold::query()->count())->toBe(0);
});

test('releasing a hold restores the balance with a linked entry', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-2');

    $released = $this->ledger->releaseHold($hold);

    expect($released->status)->toBe(WalletHold::STATUS_RELEASED)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(100_000);

    $release = WalletTransaction::query()->where('type', WalletTransactionType::HoldRelease)->first();
    expect($release->related_transaction_id)->toBe($hold->hold_transaction_id);
});

test('releasing twice has no double effect', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-3');

    $this->ledger->releaseHold($hold);
    $this->ledger->releaseHold($hold->fresh());

    expect($this->wallet->fresh()->balance_halalas)->toBe(100_000)
        ->and(WalletTransaction::query()->where('type', WalletTransactionType::HoldRelease)->count())->toBe(1);
});

test('a full capture converts the hold into spent money', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-4');

    $captured = $this->ledger->captureHold($hold);

    expect($captured->status)->toBe(WalletHold::STATUS_CAPTURED)
        ->and($captured->captured_amount_halalas)->toBe(40_000)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(60_000)
        ->and($this->ledger->balanceFromLedger($this->wallet))->toBe(60_000)
        ->and(WalletTransaction::query()->where('type', WalletTransactionType::Capture)->count())->toBe(1);
});

test('a partial capture returns the remainder automatically', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-5');

    $captured = $this->ledger->captureHold($hold, 25_000);

    expect($captured->captured_amount_halalas)->toBe(25_000)
        ->and($this->wallet->fresh()->balance_halalas)->toBe(75_000)
        ->and($this->ledger->balanceFromLedger($this->wallet))->toBe(75_000);
});

test('capturing more than the held amount is refused', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-6');

    expect(fn () => $this->ledger->captureHold($hold, 50_000))
        ->toThrow(InvalidArgumentException::class);
});

test('a released hold cannot be captured', function () {
    $hold = $this->ledger->hold($this->wallet, 40_000, 'test:hold-7');
    $this->ledger->releaseHold($hold);

    expect(fn () => $this->ledger->captureHold($hold->fresh()))
        ->toThrow(InvalidArgumentException::class);
});

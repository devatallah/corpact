<?php

use App\Exceptions\ImmutableLedgerException;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

// H §12.5 + القاعدة المالية الثانية: «لا يُصحَّح خطأ بالحذف» — الدفتر
// append-only: حراسة في النموذج (events) وحراسة في قاعدة البيانات (triggers)
// ضد الاستعلامات الخام التي تتجاوز النموذج.

test('a ledger entry cannot be updated through the model', function () {
    $entry = WalletTransaction::factory()->credit()->create();

    expect(fn () => $entry->update(['amount_halalas' => 1]))
        ->toThrow(ImmutableLedgerException::class);
});

test('a ledger entry cannot be deleted through the model', function () {
    $entry = WalletTransaction::factory()->credit()->create();

    expect(fn () => $entry->delete())
        ->toThrow(ImmutableLedgerException::class);
});

test('raw SQL updates are blocked by the database trigger', function () {
    $entry = WalletTransaction::factory()->credit()->create();

    expect(fn () => DB::table('wallet_transactions')->where('id', $entry->id)->update(['amount_halalas' => 1]))
        ->toThrow(QueryException::class);

    expect((int) DB::table('wallet_transactions')->where('id', $entry->id)->value('amount_halalas'))
        ->toBe($entry->amount_halalas);
});

test('raw SQL deletes are blocked by the database trigger', function () {
    $entry = WalletTransaction::factory()->credit()->create();

    expect(fn () => DB::table('wallet_transactions')->where('id', $entry->id)->delete())
        ->toThrow(QueryException::class);

    expect(WalletTransaction::query()->whereKey($entry->id)->exists())->toBeTrue();
});

test('deleting a wallet with ledger history is refused (restrictOnDelete)', function () {
    $wallet = Wallet::factory()->create();
    WalletTransaction::factory()->credit()->create(['wallet_id' => $wallet->id]);

    expect(fn () => DB::table('wallets')->where('id', $wallet->id)->delete())
        ->toThrow(QueryException::class);
});

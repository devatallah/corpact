<?php

use App\Enums\WalletTransactionType;
use App\Models\Company;
use App\Models\JobRun;
use App\Models\Wallet;
use App\Services\Wallet\LedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// H §12.5: يُسمح بعمود رصيد مخزَّن بشرط مهمة مطابقة ليلية تقارنه بمجموع
// الدفتر وتُنبّه عند أي فرق — والرصيد السالب لا يبقى ساعة بلا تنبيه.

test('a matching cache passes silently', function () {
    $wallet = Wallet::mainFor(Company::factory()->create());
    app(LedgerService::class)->credit($wallet, WalletTransactionType::TopUp, 10_000, 'test:fund');

    Log::spy();

    $this->artisan('app:reconcile-balances')->assertExitCode(0);

    Log::shouldNotHaveReceived('critical');
});

test('a tampered cached balance raises a critical alert, once per wallet per day', function () {
    $wallet = Wallet::mainFor(Company::factory()->create());
    app(LedgerService::class)->credit($wallet, WalletTransactionType::TopUp, 10_000, 'test:fund');

    // عبث خارج الدفتر — المحفظة نفسها ليست append-only، الدفتر هو المحمي.
    DB::table('wallets')->where('id', $wallet->id)->update(['balance_halalas' => 9_000]);

    Log::spy();

    $this->artisan('app:reconcile-balances')->assertExitCode(1);
    Log::shouldHaveReceived('critical')->once();

    // نفس اليوم: مفتاح idempotency (المحفظة + التاريخ) يمنع تكرار التنبيه.
    $this->artisan('app:reconcile-balances')->assertExitCode(1);
    Log::shouldHaveReceived('critical')->once();

    expect(JobRun::query()
        ->where('job', 'reconcile-balances')
        ->where('entity_type', Wallet::class)
        ->where('entity_id', $wallet->id)
        ->where('period', now()->toDateString())
        ->exists())->toBeTrue();
});

test('the hourly quick check screams for every persisting negative balance', function () {
    $wallet = Wallet::mainFor(Company::factory()->create());
    DB::table('wallets')->where('id', $wallet->id)->update(['balance_halalas' => -5_000]);

    Log::spy();

    // التكرار مقصود: السالب القائم يصرخ كل ساعة حتى يُعالج (لا يبقى ساعة).
    $this->artisan('app:reconcile-balances', ['--negatives-only' => true])->assertExitCode(1);
    $this->artisan('app:reconcile-balances', ['--negatives-only' => true])->assertExitCode(1);

    Log::shouldHaveReceived('critical')->twice();
});

test('every scheduled run records a heartbeat for the watchdog', function () {
    $this->artisan('app:reconcile-balances', ['--negatives-only' => true])->assertExitCode(0);

    expect(JobRun::lastHeartbeatAt('app:reconcile-balances'))->not->toBeNull();
});

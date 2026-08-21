<?php

use App\Enums\WalletTransactionType;
use App\Exceptions\IncompatibleMoneyFigureException;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Wallet;
use App\Services\Reporting\KpiDictionary;
use App\Services\Reporting\MoneyFigure;
use App\Services\Reporting\MoneyFigureKind;
use App\Services\Reporting\ReportPeriod;
use App\Services\Wallet\LedgerService;
use Illuminate\Support\Carbon;

// H §15 — التحذير المحاسبي: «حجم التداول (GMV) = مجموع total_price للفعاليات
// المكتملة — **ليس إيراد تيمات**»، و«إيراد تيمات = العمولة + رسوم النظام +
// خدمة المنسّق». الفصل مفروض **بنيوياً**: جمع نوعين مختلفين يرمي استثناءً،
// فبطاقة تخلطهما لا يمكن كتابتها أصلاً.

test('GMV can never be summed with any Teamat revenue figure', function () {
    $gmv = MoneyFigure::of(MoneyFigureKind::Gmv, 500_000);
    $commission = MoneyFigure::of(MoneyFigureKind::CommissionRevenue, 60_000);

    expect(fn () => $gmv->plus($commission))
        ->toThrow(IncompatibleMoneyFigureException::class, 'حجم التداول');

    expect(fn () => $commission->plus($gmv))
        ->toThrow(IncompatibleMoneyFigureException::class);
});

test('company spend is its own kind and cannot absorb GMV or revenue', function () {
    $spend = MoneyFigure::of(MoneyFigureKind::CompanySpend, 12_000);

    expect(fn () => $spend->plus(MoneyFigure::of(MoneyFigureKind::Gmv, 1)))
        ->toThrow(IncompatibleMoneyFigureException::class);

    expect(fn () => $spend->plus(MoneyFigure::of(MoneyFigureKind::SystemFeeRevenue, 1)))
        ->toThrow(IncompatibleMoneyFigureException::class);

    expect(fn () => $spend->plus(MoneyFigure::of(MoneyFigureKind::ProviderNet, 1)))
        ->toThrow(IncompatibleMoneyFigureException::class);
});

test('figures of the same kind add up normally', function () {
    $total = MoneyFigure::sum(MoneyFigureKind::CommissionRevenue, [
        MoneyFigure::of(MoneyFigureKind::CommissionRevenue, 1_000),
        MoneyFigure::of(MoneyFigureKind::CommissionRevenue, 2_500),
    ]);

    expect($total->halalas)->toBe(3_500)
        ->and($total->formatted())->toBe('35.00')
        ->and($total->kind->isTeamatRevenue())->toBeTrue()
        ->and(MoneyFigureKind::Gmv->isTeamatRevenue())->toBeFalse()
        ->and(MoneyFigureKind::ProviderNet->isTeamatRevenue())->toBeFalse();
});

test('a money figure serialises to two explicitly named fields and no combined total', function () {
    $fields = MoneyFigure::of(MoneyFigureKind::Gmv, 123_45)->toFields();

    expect(array_keys($fields))->toBe(['gmv_halalas', 'gmv'])
        ->and($fields['gmv'])->toBe('123.45');
});

test('the company snapshot keeps spend and GMV in separate named fields', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    a13Event($community, [$employee->id => 'attended'], [
        'completed_at' => Carbon::parse('2026-08-10 18:00'),
        'total_halalas' => 90_000,
    ]);

    $ledger = app(LedgerService::class);
    $wallet = Wallet::subFor($community);
    $ledger->credit($wallet, WalletTransactionType::TopUp, 100_000, 'a13:fund');
    $ledger->debit($wallet, WalletTransactionType::Capture, 25_000, 'a13:capture');

    $snapshot = app(KpiDictionary::class)->companySnapshot($company, ReportPeriod::month(2026, 8));

    expect($snapshot)->toHaveKeys(['gmv', 'gmv_halalas', 'company_spend', 'company_spend_halalas'])
        ->and($snapshot['gmv_halalas'])->toBe(90_000)
        ->and($snapshot['company_spend_halalas'])->toBe(25_000);

    // القيمة الحاسمة: **لا حقل في اللقطة يساوي مجموع النوعين** — لا باسم
    // صريح ولا بالمصادفة. 90,000 + 25,000 = 115,000 يجب ألا يظهر أبداً.
    $forbiddenSum = $snapshot['gmv_halalas'] + $snapshot['company_spend_halalas'];

    expect(collect($snapshot)->filter(fn ($value) => $value === $forbiddenSum))->toBeEmpty()
        ->and(collect($snapshot)->filter(fn ($value) => $value === '1150.00'))->toBeEmpty();

    Carbon::setTestNow();
});

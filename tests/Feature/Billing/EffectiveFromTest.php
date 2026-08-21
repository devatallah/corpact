<?php

use App\Models\Company;
use App\Models\Partner;
use App\Models\PlatformFeeInvoice;
use App\Models\SettlementItem;
use App\Services\Billing\FinancialTermsService;
use Illuminate\Support\Carbon;

// H §12.10: «أي تغيير في نسبة عمولة مزوّد أو في رسوم عقد شركة يسري من تاريخ
// مستقبلي محدد فقط (`effective_from`) ولا يُطبَّق بأثر رجعي».

test('a commission-rate change cannot be back-dated', function () {
    $terms = app(FinancialTermsService::class);
    $partner = Partner::factory()->create(['commission_rate' => 12.00]);

    expect(fn () => $terms->scheduleCommissionRate($partner, 15.0, Carbon::yesterday()))
        ->toThrow(InvalidArgumentException::class);

    expect(fn () => $terms->scheduleCommissionRate($partner, 15.0, Carbon::today()))
        ->toThrow(InvalidArgumentException::class);

    $scheduled = $terms->scheduleCommissionRate($partner, 15.0, Carbon::tomorrow());
    expect((float) $scheduled->rate_percent)->toBe(15.0);
});

test('the effective commission rate is the one in force on the asked-for date', function () {
    $terms = app(FinancialTermsService::class);
    $partner = Partner::factory()->create(['commission_rate' => 12.00]);

    $terms->scheduleCommissionRate($partner, 15.0, Carbon::now()->addDays(10));

    expect($terms->commissionRatePercentFor($partner, Carbon::now()))->toBe(12.0)
        ->and($terms->commissionRatePercentFor($partner, Carbon::now()->addDays(9)))->toBe(12.0)
        ->and($terms->commissionRatePercentFor($partner, Carbon::now()->addDays(10)))->toBe(15.0)
        ->and($terms->commissionRatePercentFor($partner, Carbon::now()->addDays(40)))->toBe(15.0);
});

test('a future rate does not touch an event snapshotted today, and applies to one snapshotted after', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-01 10:00'));

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    app(FinancialTermsService::class)->scheduleCommissionRate($partner, 20.0, Carbon::parse('2026-09-01'));

    ['event' => $before] = a11CompletedEvent(['partner' => $partner, 'total' => 300.0]);

    // اللقطة جمّدت 12% رغم وجود تغيير مجدول لاحقاً.
    expect((float) $before->event_snapshot['provider']['commission_rate'])->toBe(12.0)
        ->and(SettlementItem::where('event_id', $before->id)->value('commission_amount_halalas'))->toBe(3_600);

    // فعالية تتأكد بعد تاريخ السريان تحمل النسبة الجديدة.
    Carbon::setTestNow(Carbon::parse('2026-09-10 10:00'));
    ['event' => $after] = a11CompletedEvent(['partner' => $partner, 'total' => 300.0]);

    expect((float) $after->event_snapshot['provider']['commission_rate'])->toBe(20.0)
        ->and(SettlementItem::where('event_id', $after->id)->value('commission_amount_halalas'))->toBe(6_000);

    // والقديمة لم تتحرك.
    expect(SettlementItem::where('event_id', $before->id)->value('commission_amount_halalas'))->toBe(3_600);

    Carbon::setTestNow();
});

test('contract fee changes cannot be back-dated and only bind later cycles', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 10:00'));

    $terms = app(FinancialTermsService::class);
    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);

    expect(fn () => $terms->scheduleContractTerms($company, 50_000, null, Carbon::parse('2026-08-01')))
        ->toThrow(InvalidArgumentException::class);

    // سريان من 1 سبتمبر: دورة أغسطس تبقى على 300.00 للموظف المفعّل.
    $terms->scheduleContractTerms($company, 50_000, null, Carbon::parse('2026-09-01'));

    a11CompletedEvent([
        'company' => $company,
        'attendees' => 2,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $august = PlatformFeeInvoice::where('company_id', $company->id)->where('period_key', '2026-08')->firstOrFail();

    expect($august->fee_per_activated_employee_halalas)->toBe(30_000)
        ->and($august->fees_subtotal_halalas)->toBe(60_000);

    // دورة سبتمبر تُفوتر بالرسم الجديد.
    a11CompletedEvent([
        'company' => $company->fresh(),
        'attendees' => 2,
        'completed_at' => Carbon::parse('2026-09-10 20:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-10-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $september = PlatformFeeInvoice::where('company_id', $company->id)->where('period_key', '2026-09')->firstOrFail();

    expect($september->fee_per_activated_employee_halalas)->toBe(50_000)
        ->and($september->fees_subtotal_halalas)->toBe(100_000)
        // ولا تتغير فاتورة أغسطس بحرف.
        ->and($august->fresh()->fees_subtotal_halalas)->toBe(60_000);

    Carbon::setTestNow();
});

test('a scheduled contract term wins over the base contract column from its date on', function () {
    $terms = app(FinancialTermsService::class);
    $company = Company::factory()->create([
        'contract_fee_per_activated_employee' => 30_000,
        'contract_monthly_minimum' => 100_000,
    ]);

    $terms->scheduleContractTerms($company, 40_000, 200_000, Carbon::now()->addDays(5), null, 'تجديد العقد');

    $today = $terms->contractTermsFor($company, Carbon::now());
    $later = $terms->contractTermsFor($company, Carbon::now()->addDays(5));

    expect($today['fee_per_activated_employee_halalas'])->toBe(30_000)
        ->and($today['monthly_minimum_halalas'])->toBe(100_000)
        ->and($today['source'])->toBe('contract')
        ->and($later['fee_per_activated_employee_halalas'])->toBe(40_000)
        ->and($later['monthly_minimum_halalas'])->toBe(200_000)
        ->and($later['source'])->toStartWith('scheduled:');
});

test('the snapshot freezes the effective system fee and cancellation policy too', function () {
    fakeMessages();

    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);
    ['event' => $event] = a11CompletedEvent(['company' => $company]);

    $terms = $event->event_snapshot['terms'];

    expect($terms['system_fee']['fee_per_activated_employee_halalas'])->toBe(30_000)
        ->and($terms['cancellation_policy'])->toBe('full_refund_or_none')
        ->and($terms['tax']['activity_value']['treatment'])->toBe('agent')
        ->and($terms['tax']['commission']['treatment'])->toBe('principal');
});

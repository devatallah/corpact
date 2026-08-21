<?php

use App\Enums\Role;
use App\Models\Company;
use App\Models\Partner;
use App\Models\PlatformFeeInvoice;
use App\Models\ProviderCommissionRate;
use App\Models\RoleAssignment;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\User;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;

// لوحة المزوّد (H §17 / G/دليل المزوّد §7) ولوحة الأدمن المالي (G §3/§4):
// المزوّد يقرأ كشوفه وبنودها؛ الاعتماد والصرف والتصحيح خلف صلاحية
// `settlement.approve` وحدها، والفوترة خلف `invoice.approve`.

function a11StatementFor(Partner $partner): SettlementStatement
{
    a11CompletedEvent(['partner' => $partner, 'total' => 300.0]);

    $service = app(SettlementStatementService::class);

    return $service->generateFor($partner, $service->periodEndingBefore(now()->addMonth()));
}

test('the provider sees its statements list with the payout gate spelled out', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'pending']);
    a11StatementFor($partner);

    $this->actingAs($partner, 'partner')
        ->get('/partner/settlements')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('partner/settlements/index')
            ->where('totals.payouts_blocked', true)
            ->has('statements.data', 1)
            ->where('statements.data.0.net_amount', '264.00')
        );
});

test('the provider reconciles a statement item by item', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11StatementFor($partner);

    $this->actingAs($partner, 'partner')
        ->get("/partner/settlements/{$statement->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('partner/settlements/show')
            ->has('statement.items', 1)
            ->where('statement.items.0.gross_amount', '300.00')
            ->where('statement.items.0.commission_amount', '36.00')
            ->where('statement.items.0.net_amount', '264.00')
        );
});

test('a provider cannot open another provider statement', function () {
    fakeMessages();

    $mine = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $theirs = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11StatementFor($theirs);

    $this->actingAs($mine, 'partner')
        ->get("/partner/settlements/{$statement->id}")
        ->assertForbidden();
});

test('the finance admin panel generates, approves and records the payout', function () {
    fakeMessages();

    // الفعالية تكتمل داخل الفترة، والتوليد يقع بعد إغلاقها (يوم 16).
    Carbon::setTestNow(Carbon::parse('2026-08-10 12:00'));

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    a11CompletedEvent(['partner' => $partner, 'total' => 300.0]);

    Carbon::setTestNow(Carbon::parse('2026-08-16 03:00'));

    $generator = a11FinanceAdmin('المولِّد');
    $approver = a11FinanceAdmin('المعتمِد');

    $this->actingAs($generator, 'admin')
        ->post(route('admin.finance.settlements.generate'))
        ->assertRedirect();

    $statement = SettlementStatement::where('partner_id', $partner->id)->firstOrFail();
    expect($statement->generated_by_user_id)->toBe($generator->id);

    // من ولّده لا يعتمده — الطلب يرتد بخطأ لا بأثر.
    $this->actingAs($generator, 'admin')
        ->post(route('admin.finance.settlements.approve', $statement))
        ->assertSessionHasErrors('statement');

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_DRAFT);

    $this->actingAs($approver, 'admin')
        ->post(route('admin.finance.settlements.approve', $statement))
        ->assertRedirect();

    // مرجع التحويل إلزامي.
    $this->actingAs($approver, 'admin')
        ->post(route('admin.finance.settlements.pay', $statement), [])
        ->assertSessionHasErrors('payout_reference');

    $this->actingAs($approver, 'admin')
        ->post(route('admin.finance.settlements.pay', $statement), ['payout_reference' => 'BANK-1'])
        ->assertRedirect();

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_PAID);

    Carbon::setTestNow();
});

test('a platform admin without the financial permission is refused', function () {
    fakeMessages();

    $platform = User::factory()->create();
    $platform->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($platform->fresh(), 'admin')
        ->get(route('admin.finance.settlements.index'))
        ->assertForbidden();

    $this->actingAs($platform->fresh(), 'admin')
        ->get(route('admin.finance.invoices.index'))
        ->assertForbidden();
});

test('the correction endpoint demands a written reason', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $statement = a11StatementFor($partner);

    $service = app(SettlementStatementService::class);
    $service->approve($statement, a11FinanceAdmin('المعتمِد'));
    $service->markPaid($statement->fresh(), a11FinanceAdmin('الصارف'), 'REF-1');

    $item = SettlementItem::where('settlement_statement_id', $statement->id)->firstOrFail();

    $this->actingAs(a11FinanceAdmin('المصحِّح'), 'admin')
        ->post(route('admin.finance.settlement-items.correct', $item), ['corrected_gross' => 250])
        ->assertSessionHasErrors('reason');

    $this->actingAs(a11FinanceAdmin('المصحِّح2'), 'admin')
        ->post(route('admin.finance.settlement-items.correct', $item), [
            'corrected_gross' => 250,
            'reason' => 'السعر المتفق عليه 250',
        ])
        ->assertRedirect();

    expect(SettlementItem::where('type', SettlementItem::TYPE_CORRECTION)->count())->toBe(1);
});

test('the invoices panel generates and marks a cycle invoice paid', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);
    a11CompletedEvent(['company' => $company, 'attendees' => 2, 'completed_at' => Carbon::parse('2026-08-10 20:00')]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));

    $finance = a11FinanceAdmin('المالي');

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.invoices.generate'))
        ->assertRedirect();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();

    $this->actingAs($finance, 'admin')
        ->get(route('admin.finance.invoices.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/finance/invoices')
            ->where('realInvoicesEnabled', false)
            ->has('invoices.data', 1)
        );

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.invoices.pay', $invoice), ['payment_reference' => 'PAY-1'])
        ->assertRedirect();

    expect($invoice->fresh()->status)->toBe(PlatformFeeInvoice::STATUS_PAID);

    Carbon::setTestNow();
});

test('scheduling future financial terms is refused for past dates through the panel', function () {
    fakeMessages();

    $partner = Partner::factory()->create(['commission_rate' => 12.00]);
    $finance = a11FinanceAdmin('المالي');

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.commission-rates.store'), [
            'partner_id' => $partner->id,
            'rate_percent' => 15,
            'effective_from' => now()->subDay()->toDateString(),
        ])
        ->assertSessionHasErrors('effective_from');

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.commission-rates.store'), [
            'partner_id' => $partner->id,
            'rate_percent' => 15,
            'effective_from' => now()->addDays(10)->toDateString(),
        ])
        ->assertRedirect();

    expect(ProviderCommissionRate::where('partner_id', $partner->id)->count())->toBe(1);
});

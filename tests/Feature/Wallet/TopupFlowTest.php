<?php

use App\Enums\Role;
use App\Enums\TopupRequestStatus;
use App\Enums\WalletTransactionType;
use App\Models\Company;
use App\Models\Notification;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTopupRequest;
use App\Models\WalletTransaction;
use App\Services\Wallet\TopupRequestService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

// شحن المحفظة بتحويل بنكي (H §12.5): مسؤول الحساب يرفع الطلب، الأدمن المالي
// يعتمده (لا اعتماد ذاتي)، القيد الفريد (المرجع + المبلغ) يمنع التكرار،
// الرفض بسبب موثَّق يُشعر مسؤول الحساب، وإلغاء الاعتماد حركة عكسية مرتبطة.

function makeTopup(Company $company, array $overrides = []): WalletTopupRequest
{
    return WalletTopupRequest::create(array_merge([
        'company_id' => $company->id,
        'wallet_id' => Wallet::mainFor($company)->id,
        'amount_halalas' => 50_000_00,
        'transfer_date' => now()->subDay()->toDateString(),
        'sender_account_last4' => '1234',
        'bank_reference' => 'TRF-'.uniqid(),
        'receipt_path' => 'topup-receipts/test.pdf',
        'status' => TopupRequestStatus::Submitted,
        'created_by_user_id' => null,
    ], $overrides));
}

function financeAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::FinanceAdmin);

    return $user;
}

test('the account manager submits a bank-transfer request with a receipt on the private disk', function () {
    Storage::fake();
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->post(route('company.wallet.topup'), [
            'amount' => 1500,
            'transfer_date' => now()->subDay()->toDateString(),
            'sender_account_last4' => '9876',
            'bank_reference' => 'TRF-001-A',
            'receipt' => a15FakePdf('receipt.pdf'),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $request = WalletTopupRequest::query()->withoutGlobalScopes()->firstOrFail();

    expect($request->status)->toBe(TopupRequestStatus::Submitted)
        ->and($request->amount_halalas)->toBe(150_000)
        ->and($request->bank_reference)->toBe('TRF-001-A');

    Storage::assertExists($request->receipt_path);

    // لا يتحرك أي رصيد قبل الاعتماد — لا شحن ذاتياً فورياً بعد الآن.
    expect(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(0)
        ->and(WalletTransaction::query()->count())->toBe(0);
});

test('the old instant self-credit route is gone', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->post('/company/wallet/charge', ['amount' => 99999])
        ->assertNotFound();
});

test('a duplicate (reference + amount) is rejected', function () {
    Storage::fake();
    $company = Company::factory()->create();
    makeTopup($company, ['bank_reference' => 'TRF-DUP', 'amount_halalas' => 150_000]);

    $this->actingAs($company, 'company')
        ->post(route('company.wallet.topup'), [
            'amount' => 1500,
            'transfer_date' => now()->subDay()->toDateString(),
            'sender_account_last4' => '9876',
            'bank_reference' => 'TRF-DUP',
            'receipt' => a15FakePdf('receipt.pdf'),
        ])
        ->assertSessionHasErrors('bank_reference');

    expect(WalletTopupRequest::query()->withoutGlobalScopes()->count())->toBe(1);
});

test('finance-admin approval creates the top_up ledger entry with actor and reference', function () {
    $company = Company::factory()->create();
    $request = makeTopup($company);
    $finance = financeAdmin();

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.topups.approve', $request))
        ->assertRedirect()
        ->assertSessionHas('success');

    $request->refresh();
    $entry = $request->approvalTransaction;

    expect($request->status)->toBe(TopupRequestStatus::Approved)
        ->and($request->reviewed_by_user_id)->toBe($finance->id)
        ->and($entry->type)->toBe(WalletTransactionType::TopUp)
        ->and($entry->direction)->toBe(WalletTransaction::DIRECTION_CREDIT)
        ->and($entry->amount_halalas)->toBe(50_000_00)
        ->and($entry->actor_user_id)->toBe($finance->id)
        ->and($entry->reference_type)->toBe(WalletTopupRequest::class)
        ->and($entry->reference_id)->toBe($request->id)
        ->and(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(50_000_00);
});

test('no one approves a request they created themselves', function () {
    $company = Company::factory()->create();
    $finance = financeAdmin();
    $request = makeTopup($company, ['created_by_user_id' => $finance->id]);

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.topups.approve', $request))
        ->assertForbidden();

    expect($request->fresh()->status)->toBe(TopupRequestStatus::Submitted)
        ->and(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(0);
});

test('a platform admin cannot reach the finance approval surface', function () {
    $company = Company::factory()->create();
    $request = makeTopup($company);
    $platform = User::factory()->create();
    $platform->assignRole(Role::PlatformAdmin);

    $this->actingAs($platform, 'admin')
        ->get(route('admin.finance.topups.index'))
        ->assertForbidden();

    $this->actingAs($platform, 'admin')
        ->post(route('admin.finance.topups.approve', $request))
        ->assertForbidden();
});

test('rejection requires a documented reason and notifies the account manager', function () {
    $company = Company::factory()->create();
    $request = makeTopup($company);
    $finance = financeAdmin();

    // بلا سبب — يُرفض الطلب نفسه.
    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.topups.reject', $request))
        ->assertSessionHasErrors('reason');

    $this->actingAs($finance, 'admin')
        ->post(route('admin.finance.topups.reject', $request), ['reason' => 'المبلغ لا يطابق كشف البنك'])
        ->assertRedirect();

    $request->refresh();

    expect($request->status)->toBe(TopupRequestStatus::Rejected)
        ->and($request->rejection_reason)->toBe('المبلغ لا يطابق كشف البنك');

    expect(Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('title', 'تم رفض طلب الشحن')
        ->exists())->toBeTrue();
});

test('the state machine refuses approving a rejected request', function () {
    $company = Company::factory()->create();
    $finance = financeAdmin();
    $request = makeTopup($company);

    app(TopupRequestService::class)->reject($request, $finance, 'سبب');

    expect(fn () => app(TopupRequestService::class)->approve($request->fresh(), financeAdmin()))
        ->toThrow(ValidationException::class);
});

test('un-approval reverses with a linked entry, a reason, and a different finance admin', function () {
    $company = Company::factory()->create();
    $request = makeTopup($company);
    $financeA = financeAdmin();
    $financeB = financeAdmin();

    app(TopupRequestService::class)->approve($request, $financeA);
    expect(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(50_000_00);

    $approvalEntry = $request->fresh()->approvalTransaction;

    // المعتمد الأصلي لا يلغي اعتماده بنفسه.
    $this->actingAs($financeA, 'admin')
        ->post(route('admin.finance.topups.unapprove', $request), ['reason' => 'خطأ'])
        ->assertForbidden();

    // بلا سبب — مرفوض.
    $this->actingAs($financeB, 'admin')
        ->post(route('admin.finance.topups.unapprove', $request))
        ->assertSessionHasErrors('reason');

    $this->actingAs($financeB, 'admin')
        ->post(route('admin.finance.topups.unapprove', $request), ['reason' => 'التحويل لم يظهر في كشف البنك'])
        ->assertRedirect();

    $request->refresh();

    expect($request->status)->toBe(TopupRequestStatus::UnderReview)
        ->and($request->unapproved_by_user_id)->toBe($financeB->id)
        ->and($request->unapproval_reason)->toBe('التحويل لم يظهر في كشف البنك')
        ->and(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(0);

    $reversal = $request->reversalTransaction;
    expect($reversal->type)->toBe(WalletTransactionType::Adjustment)
        ->and($reversal->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($reversal->related_transaction_id)->toBe($approvalEntry->id)
        ->and($approvalEntry->fresh()->amount_halalas)->toBe(50_000_00);
});

test('re-approval after un-approval credits the wallet again as a new entry', function () {
    $company = Company::factory()->create();
    $request = makeTopup($company);
    $financeA = financeAdmin();
    $financeB = financeAdmin();
    $service = app(TopupRequestService::class);

    $service->approve($request, $financeA);
    $service->unapprove($request->fresh(), $financeB, 'مراجعة إضافية');
    $service->approve($request->fresh(), $financeA);

    expect(Wallet::mainFor($company)->refresh()->balance_halalas)->toBe(50_000_00)
        ->and(WalletTransaction::query()->where('type', WalletTransactionType::TopUp)->count())->toBe(2);
});

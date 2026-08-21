<?php

use App\Enums\Role;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\User;

// A9 — الحساب البنكي (H §11 + §19): اعتماد يدوي من أدمن تيمات شرط لأي صرف؛
// أي تغيير بعد الاعتماد يعيد الحالة إلى pending ويُسجَّل حدثاً أمنياً.

function platformAdmin(): User
{
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    return $admin;
}

const VALID_IBAN = 'SA0380000000608010167519';

test('submitting bank details puts the account in pending and blocks payouts', function () {
    $partner = Partner::factory()->create();
    expect($partner->bank_status)->toBe('missing')
        ->and($partner->payoutsBlocked())->toBeTrue();

    $this->actingAs($partner, 'partner')
        ->put(route('partner.bank.update'), [
            'account_holder' => 'شركة الملاعب المتحدة',
            'iban' => VALID_IBAN,
        ])->assertRedirect()->assertSessionHasNoErrors();

    $partner->refresh();
    expect($partner->bank_status)->toBe('pending')
        ->and($partner->bank_iban)->toBe(VALID_IBAN)
        ->and($partner->payoutsBlocked())->toBeTrue();
});

test('an invalid Saudi IBAN is rejected', function () {
    $partner = Partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->put(route('partner.bank.update'), [
            'account_holder' => 'شركة',
            'iban' => 'GB29NWBK60161331926819',
        ])->assertSessionHasErrors();

    expect($partner->fresh()->bank_status)->toBe('missing');
});

test('platform admin approves the pending account — payouts unblock and the provider is notified', function () {
    $partner = Partner::factory()->create([
        'bank_account_holder' => 'شركة الملاعب',
        'bank_iban' => VALID_IBAN,
        'bank_status' => 'pending',
    ]);
    $admin = platformAdmin();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.providers.bank.approve', $partner))
        ->assertRedirect()->assertSessionHasNoErrors();

    $partner->refresh();
    expect($partner->bank_status)->toBe('approved')
        ->and($partner->bank_approved_by)->toBe($admin->id)
        ->and($partner->bank_approved_at)->not->toBeNull()
        ->and($partner->payoutsBlocked())->toBeFalse();

    expect(Notification::where('notifiable_type', Partner::class)
        ->where('notifiable_id', $partner->id)
        ->where('title', 'اعتُمد حسابك البنكي')->exists())->toBeTrue();
});

test('any change AFTER approval resets the account to pending and logs a security event', function () {
    $admin = platformAdmin();
    $partner = Partner::factory()->create([
        'bank_account_holder' => 'شركة الملاعب',
        'bank_iban' => VALID_IBAN,
        'bank_status' => 'approved',
        'bank_approved_at' => now(),
        'bank_approved_by' => $admin->id,
    ]);

    $this->actingAs($partner, 'partner')
        ->put(route('partner.bank.update'), [
            'account_holder' => 'شركة الملاعب',
            'iban' => 'SA4420000001234567891234',
        ])->assertRedirect()->assertSessionHasNoErrors();

    $partner->refresh();
    expect($partner->bank_status)->toBe('pending')
        ->and($partner->bank_approved_at)->toBeNull()
        ->and($partner->bank_approved_by)->toBeNull()
        ->and($partner->payoutsBlocked())->toBeTrue();

    // حدث أمني مسجَّل (H §19: تغيير بيانات بنكية)
    $log = ActivityLog::where('type', 'security_bank_account_changed')->first();
    expect($log)->not->toBeNull()
        ->and($log->data['security_event'])->toBeTrue()
        ->and($log->data['iban_last4'])->toBe('1234');
});

test('an unchanged resubmission does not reset an approved account', function () {
    $partner = Partner::factory()->create([
        'bank_account_holder' => 'شركة الملاعب',
        'bank_iban' => VALID_IBAN,
        'bank_status' => 'approved',
        'bank_approved_at' => now(),
    ]);

    $this->actingAs($partner, 'partner')
        ->put(route('partner.bank.update'), [
            'account_holder' => 'شركة الملاعب',
            'iban' => VALID_IBAN,
        ])->assertRedirect();

    expect($partner->fresh()->bank_status)->toBe('approved');
});

test('only a pending account can be approved and only by an admin', function () {
    // مزوّد لا يعتمد حسابه بنفسه — مساره محمي بحارس الأدمن
    $pending = Partner::factory()->create(['bank_status' => 'pending', 'bank_iban' => VALID_IBAN, 'bank_account_holder' => 'x']);
    $this->actingAs($pending, 'partner')
        ->post(route('admin.providers.bank.approve', $pending))
        ->assertRedirect(route('admin.login'));

    expect($pending->fresh()->bank_status)->toBe('pending');

    // حساب غير معلّق لا يُعتمد
    $partner = Partner::factory()->create(['bank_status' => 'missing']);
    $admin = platformAdmin();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.providers.bank.approve', $partner))
        ->assertSessionHasErrors();

    expect($partner->fresh()->bank_status)->toBe('missing');
});

test('an accountant can view the bank page but cannot change the account', function () {
    $owner = Partner::factory()->create(['bank_status' => 'pending', 'bank_iban' => VALID_IBAN, 'bank_account_holder' => 'x']);
    $accountant = Partner::factory()->create(['role' => 'accountant', 'parent_id' => $owner->id]);

    $this->actingAs($accountant, 'partner')
        ->get(route('partner.bank.edit'))
        ->assertOk();

    $this->actingAs($accountant, 'partner')
        ->put(route('partner.bank.update'), [
            'account_holder' => 'تغيير غير مخوَّل',
            'iban' => 'SA4420000001234567891234',
        ])->assertForbidden();

    expect($owner->fresh()->bank_iban)->toBe(VALID_IBAN);
});

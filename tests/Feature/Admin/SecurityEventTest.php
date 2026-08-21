<?php

use App\Enums\Role;
use App\Exceptions\AppendOnlyException;
use App\Models\AuditLog;
use App\Models\Partner;
use App\Models\PermissionReview;
use App\Models\RoleAssignment;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Services\Audit\SecurityEventService;
use App\Services\Provider\BankAccountService;
use App\Support\Audit\AuditAction;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

/**
 * H §19 — «سجل أحداث أمنية **منفصل** (دخول فاشل، تغيير صلاحية، تغيير بيانات
 * بنكية)». A9 asked for the table explicitly; these are its guarantees.
 */
test('the security log is a separate table from the audit log', function () {
    expect(Schema::hasTable('security_events'))->toBeTrue()
        ->and(Schema::hasTable('audit_logs'))->toBeTrue();
});

test('security events are append-only at the model and at the database', function () {
    $event = SecurityEventService::record(
        event: SecurityEvent::SECRET_SENSITIVE,
        context: ['what' => 'rotation'],
    );

    expect(fn () => $event->update(['severity' => 'info']))->toThrow(AppendOnlyException::class)
        ->and(fn () => $event->delete())->toThrow(AppendOnlyException::class)
        ->and(fn () => DB::table('security_events')->where('id', $event->id)->update(['severity' => 'info']))
        ->toThrow(QueryException::class)
        ->and(fn () => DB::table('security_events')->where('id', $event->id)->delete())
        ->toThrow(QueryException::class);

    expect(DB::table('security_events')->where('id', $event->id)->exists())->toBeTrue();
});

// ── دخول فاشل ────────────────────────────────────────────────────────────

test('a failed admin login is recorded as a security event with a masked identifier', function () {
    User::factory()->create(['email' => 'admin@teamat.com', 'password' => Hash::make('correct-password')]);

    $this->post('/admin/login', ['email' => 'admin@teamat.com', 'password' => 'wrong-password']);

    $event = SecurityEvent::query()->where('event', SecurityEvent::LOGIN_FAILED)->latest('id')->first();

    expect($event)->not->toBeNull()
        ->and($event->guard)->toBe('admin')
        ->and($event->severity)->toBe(SecurityEvent::SEVERITY_WARNING)
        // «لا تنقل رقم جوال أو بيانات موظف خارج القناة الرسمية» — the raw
        // identifier is never stored in full.
        ->and($event->actor_identifier)->not->toBe('admin@teamat.com')
        ->and($event->actor_identifier)->toContain('***')
        ->and($event->actor_user_id)->toBeNull();
});

test('the identifier masking keeps only enough to correlate attempts', function () {
    expect(SecurityEventService::mask('966512345678'))->toBe('********5678')
        ->and(SecurityEventService::mask('someone@example.com'))->toBe('so***@example.com')
        ->and(SecurityEventService::mask('123'))->toBe('***')
        ->and(SecurityEventService::mask(null))->toBeNull();
});

// ── تغيير صلاحية ─────────────────────────────────────────────────────────

test('granting and revoking an elevated role each raise a security event', function () {
    $user = User::factory()->create();

    $assignment = $user->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $granted = SecurityEvent::query()->where('event', SecurityEvent::PERMISSION_CHANGED)->latest('id')->first();

    expect($granted)->not->toBeNull()
        ->and($granted->context['role'])->toBe('platform_admin');

    $assignment->delete();

    expect(SecurityEvent::query()->where('event', SecurityEvent::PERMISSION_CHANGED)->count())->toBe(2);
});

// ── تغيير بيانات بنكية ──────────────────────────────────────────────────

test('changing an approved provider bank account is a critical security event', function () {
    $partner = Partner::factory()->create([
        'bank_account_holder' => 'مرافق الرياض',
        'bank_iban' => 'SA0380000000608010167519',
        'bank_status' => 'approved',
        'bank_approved_at' => now(),
    ]);

    app(BankAccountService::class)->update($partner, 'مرافق الرياض', 'SA4420000001234567891234');

    $event = SecurityEvent::query()->where('event', SecurityEvent::BANK_ACCOUNT_CHANGED)->latest('id')->firstOrFail();

    expect($event->severity)->toBe(SecurityEvent::SEVERITY_CRITICAL)
        ->and($event->context['was_approved'])->toBeTrue()
        ->and($event->context['payouts_blocked'])->toBeTrue()
        // الآيبان الكامل لا يُخزَّن في سجل الأحداث — آخر أربعة فقط.
        ->and($event->context['iban_last4'])->toBe('1234')
        ->and($partner->fresh()->bank_status)->toBe('pending');
});

test('a first-time bank submission is informational, not critical', function () {
    $partner = Partner::factory()->create(['bank_status' => 'pending', 'bank_iban' => null]);

    app(BankAccountService::class)->update($partner, 'مرافق جدة', 'SA4420000001234567891234');

    $event = SecurityEvent::query()->where('event', SecurityEvent::BANK_ACCOUNT_CHANGED)->latest('id')->firstOrFail();

    expect($event->severity)->toBe(SecurityEvent::SEVERITY_INFO);
});

test('approving a bank account raises its own security event', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $partner = Partner::factory()->create(['bank_status' => 'pending', 'bank_iban' => 'SA4420000001234567891234']);

    app(BankAccountService::class)->approve($partner, $admin->fresh());

    expect(SecurityEvent::query()->where('event', SecurityEvent::BANK_ACCOUNT_APPROVED)->exists())->toBeTrue();
});

// ── الشاشة ───────────────────────────────────────────────────────────────

test('the platform admin can read the security log and its 24h counters', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    SecurityEventService::loginFailed('966512345678', 'employee');
    SecurityEventService::record(event: SecurityEvent::SECRET_SENSITIVE, severity: SecurityEvent::SEVERITY_CRITICAL);

    $this->actingAs($admin->fresh(), 'admin')
        ->get('/admin/security/events')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/security/events')
            ->where('stats.failed_logins_24h', 1)
            ->where('stats.critical_24h', 1));
});

test('the security screen filters by event type and severity', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    SecurityEventService::loginFailed('966512345678', 'employee');
    SecurityEventService::record(event: SecurityEvent::SECRET_SENSITIVE, severity: SecurityEvent::SEVERITY_CRITICAL);

    $this->actingAs($admin->fresh(), 'admin')
        ->get('/admin/security/events?severity=critical')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('events.total', 1));
});

// ── مراجعة الصلاحيات الربع سنوية ─────────────────────────────────────────

test('a documented quarterly permission review is recorded and audited', function () {
    $admin = User::factory()->create(['name' => 'أدمن تيمات']);
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin->fresh(), 'admin')
        ->post('/admin/security/permission-review', ['notes' => 'رُوجعت كل الإسنادات — سُحب دوران لموظفين غادرا.'])
        ->assertSessionHas('success');

    $review = PermissionReview::query()->latest('id')->firstOrFail();

    expect($review->period)->toMatch('/^\d{4}-Q[1-4]$/')
        ->and($review->reviewed_by_name)->toBe('أدمن تيمات')
        ->and($review->notes)->toContain('رُوجعت')
        ->and(AuditLog::query()->where('action', AuditAction::PERMISSION_REVIEWED)->exists())
        ->toBeTrue();
});

test('the quarterly review refuses an undocumented sign-off', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin->fresh(), 'admin')
        ->post('/admin/security/permission-review', ['notes' => ''])
        ->assertSessionHasErrors('notes');

    expect(PermissionReview::query()->count())->toBe(0);
});

<?php

use App\Enums\Role;
use App\Exceptions\AppendOnlyException;
use App\Http\Controllers\Company\AuditLogController;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Event;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * H §19 — «جدول `audit_logs` للكتابة فقط — لا تعديل ولا حذف. الحقول: الفاعل،
 * دوره، النطاق، الإجراء، الكيان، القيمة قبل وبعد، IP، المتصفح، الوقت».
 */
function a15AuditRow(array $overrides = []): AuditLog
{
    return AuditLog::create(array_merge([
        'actor_name' => 'أدمن الاختبار',
        'actor_role' => Role::PlatformAdmin->value,
        'scope_type' => RoleAssignment::SCOPE_PLATFORM,
        'action' => AuditAction::EVENT_STATE_FORCED,
        'reason' => 'سبب موثَّق',
    ], $overrides));
}

// ── Append-only: model level ─────────────────────────────────────────────

test('an audit row cannot be updated through the model', function () {
    $log = a15AuditRow();

    expect(fn () => $log->update(['reason' => 'محاولة تحوير']))
        ->toThrow(AppendOnlyException::class);

    expect($log->fresh()->reason)->toBe('سبب موثَّق');
});

test('an audit row cannot be deleted through the model', function () {
    $log = a15AuditRow();

    expect(fn () => $log->delete())->toThrow(AppendOnlyException::class);

    expect(AuditLog::query()->whereKey($log->id)->exists())->toBeTrue();
});

// ── Append-only: raw SQL, past Eloquent entirely ─────────────────────────

test('a raw update on audit_logs is refused by the database trigger', function () {
    $log = a15AuditRow();

    expect(fn () => DB::table('audit_logs')->where('id', $log->id)->update(['reason' => 'تحوير خام']))
        ->toThrow(QueryException::class);

    expect(DB::table('audit_logs')->where('id', $log->id)->value('reason'))->toBe('سبب موثَّق');
});

test('a raw delete on audit_logs is refused by the database trigger', function () {
    $log = a15AuditRow();

    expect(fn () => DB::table('audit_logs')->where('id', $log->id)->delete())
        ->toThrow(QueryException::class);

    expect(DB::table('audit_logs')->where('id', $log->id)->exists())->toBeTrue();
});

test('audit_logs has no updated_at to write — created_at only', function () {
    $log = a15AuditRow();

    expect(AuditLog::UPDATED_AT)->toBeNull()
        ->and($log->created_at)->not->toBeNull()
        ->and(Schema::hasColumn('audit_logs', 'updated_at'))->toBeFalse();
});

// ── The actor — the gap-analysis defect ──────────────────────────────────

test('every entry records the actor, their role, the scope, IP and user agent', function () {
    $admin = User::factory()->create(['name' => 'أدمن تيمات']);
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $event = Event::factory()->create();

    $this->actingAs($admin->fresh(), 'admin')
        ->withServerVariables(['REMOTE_ADDR' => '203.0.113.9', 'HTTP_USER_AGENT' => 'PestBrowser/1.0'])
        ->post("/admin/events/{$event->id}/force-status", [
            'status' => 'confirmed',
            'reason' => 'ثبت أن الفعالية لم تُقم — إرجاع يدوي',
        ])
        ->assertSessionHas('success');

    $log = AuditLog::query()->where('action', AuditAction::EVENT_STATE_FORCED)->latest('id')->first();

    expect($log)->not->toBeNull()
        ->and($log->actor_user_id)->toBe($admin->id)
        ->and($log->actor_name)->toBe('أدمن تيمات')
        ->and($log->actor_role)->toBe(Role::PlatformAdmin->value)
        ->and($log->actor_guard)->toBe('admin')
        ->and($log->scope_type)->toBe(RoleAssignment::SCOPE_PLATFORM)
        ->and($log->entity_type)->toBe($event->getMorphClass())
        ->and($log->entity_id)->toBe($event->id)
        ->and($log->reason)->toContain('لم تُقم')
        ->and($log->ip_address)->toBe('203.0.113.9')
        ->and($log->user_agent)->toBe('PestBrowser/1.0');
});

test('the before and after values are both captured on a manual state change', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $event = Event::factory()->create();
    $event->forceFill(['status' => 'completed'])->save();

    $this->actingAs($admin->fresh(), 'admin')
        ->post("/admin/events/{$event->id}/force-status", [
            'status' => 'confirmed',
            'reason' => 'تصحيح يدوي موثَّق',
        ]);

    $log = AuditLog::query()->where('action', AuditAction::EVENT_STATE_FORCED)->latest('id')->firstOrFail();

    expect($log->before_values)->toBe(['status' => 'completed'])
        ->and($log->after_values)->toBe(['status' => 'confirmed']);
});

// ── The mandatory catalog (H §19) ────────────────────────────────────────

test('the mandatory catalog of H 19 is fully represented', function () {
    $labels = AuditAction::labels();

    // تغيير الصلاحيات · حركة مالية واعتماد واسترداد · الحساب البنكي · تغيير
    // حالة يدوياً · الحضور بعد الاكتمال · تصحيح النتائج · تجاوز الاقتراح ·
    // التصدير والتنزيل · تعطيل حساب · تبديل سياق الشركة.
    foreach ([
        AuditAction::PERMISSION_GRANTED,
        AuditAction::PERMISSION_REVOKED,
        AuditAction::TOPUP_APPROVED,
        AuditAction::REFUND_ISSUED,
        AuditAction::SETTLEMENT_APPROVED,
        AuditAction::INVOICE_ISSUED,
        AuditAction::BANK_ACCOUNT_CHANGED,
        AuditAction::EVENT_STATE_FORCED,
        AuditAction::ATTENDANCE_POST_WINDOW_EDITED,
        AuditAction::RESULT_CORRECTED,
        AuditAction::PROVIDER_SUGGESTION_OVERRIDDEN,
        AuditAction::REPORT_EXPORTED,
        AuditAction::FILE_DOWNLOADED,
        AuditAction::ACCOUNT_DEACTIVATED,
        AuditAction::COMPANY_CONTEXT_SWITCHED,
    ] as $action) {
        expect($labels)->toHaveKey($action);
    }
});

test('financial actions are flagged so the 10-year slice is separable', function () {
    expect(AuditAction::isFinancial(AuditAction::TOPUP_APPROVED))->toBeTrue()
        ->and(AuditAction::isFinancial(AuditAction::SETTLEMENT_PAID))->toBeTrue()
        ->and(AuditAction::isFinancial(AuditAction::REFUND_ISSUED))->toBeTrue()
        ->and(AuditAction::isFinancial(AuditAction::BANK_ACCOUNT_CHANGED))->toBeTrue()
        ->and(AuditAction::isFinancial(AuditAction::EVENT_STATE_FORCED))->toBeFalse();

    $log = AuditLogService::record(action: AuditAction::TOPUP_APPROVED, reason: 'اعتماد');

    expect($log->is_financial)->toBeTrue();
});

test('an activity type in the catalog is mirrored into the audit log', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);

    ActivityLogService::log(
        $company->id,
        $event,
        'wallet_topup_approved',
        'اعتماد تحويل بنكي',
        ['before' => ['status' => 'submitted'], 'after' => ['status' => 'approved'], 'reason' => 'طابق الكشف'],
    );

    $log = AuditLog::query()->where('action', AuditAction::TOPUP_APPROVED)->latest('id')->first();

    expect($log)->not->toBeNull()
        ->and($log->before_values)->toBe(['status' => 'submitted'])
        ->and($log->after_values)->toBe(['status' => 'approved'])
        ->and($log->is_financial)->toBeTrue()
        ->and($log->company_id)->toBe($company->id);
});

test('an ordinary activity type stays out of the audit log', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);

    $before = AuditLog::query()->count();

    ActivityLogService::log($company->id, $event, 'template_event_generated', 'توليد من قالب');

    // لا صف تدقيق جديد — النوع خارج الكتالوج الإلزامي.
    expect(AuditLog::query()->count())->toBe($before);
});

test('a permission grant and revocation both land in the audit log', function () {
    $company = Company::factory()->create();
    $user = User::factory()->create();

    $assignment = $user->assignRole(Role::AccountManager, RoleAssignment::SCOPE_COMPANY, $company->id);

    expect(AuditLog::query()->where('action', AuditAction::PERMISSION_GRANTED)->exists())->toBeTrue();

    $assignment->delete();

    expect(AuditLog::query()->where('action', AuditAction::PERMISSION_REVOKED)->exists())->toBeTrue();
});

test('the baseline employee provisioning grant is not logged as a permission change', function () {
    $company = Company::factory()->create();
    $before = AuditLog::query()->where('action', AuditAction::PERMISSION_GRANTED)->count();

    $user = User::factory()->create();
    $user->assignRole(Role::Employee, RoleAssignment::SCOPE_COMPANY, $company->id);

    expect(AuditLog::query()->where('action', AuditAction::PERMISSION_GRANTED)->count())->toBe($before);
});

test('the export mechanism A13 calls records the report and the company', function () {
    $company = Company::factory()->create();

    AuditLogService::export('company.activation', $company->id, ['rows' => 42], 'xlsx');

    $log = AuditLog::query()->where('action', AuditAction::REPORT_EXPORTED)->latest('id')->firstOrFail();

    expect($log->company_id)->toBe($company->id)
        ->and($log->after_values['report'])->toBe('company.activation')
        ->and($log->after_values['format'])->toBe('xlsx')
        ->and($log->after_values['rows'])->toBe(42);
});

test('an account deactivation is audited and the user row survives', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $target = User::factory()->create(['status' => 'active']);
    $target->assignRole(Role::SupportAgent, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin->fresh(), 'admin')
        ->delete("/admin/admins/{$target->id}")
        ->assertSessionHas('success');

    expect(User::query()->whereKey($target->id)->exists())->toBeTrue()
        ->and($target->fresh()->status)->toBe('inactive')
        ->and(AuditLog::query()->where('action', AuditAction::ACCOUNT_DEACTIVATED)->exists())->toBeTrue();
});

// ── Visibility: admin sees all, AM sees a company-scoped summary ─────────

test('the admin audit screen shows the full log', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $company = Company::factory()->create();
    a15AuditRow(['company_id' => $company->id, 'action' => AuditAction::TOPUP_APPROVED]);
    a15AuditRow(['action' => AuditAction::PLATFORM_SETTING_UPDATED]);

    $total = AuditLog::query()->count();

    // أدمن تيمات يرى السجل **كاملاً** — بما فيه صفوف نطاق المنصة التي لا
    // يراها مسؤول الحساب أبداً.
    $this->actingAs($admin->fresh(), 'admin')
        ->get('/admin/audit')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit/index')
            ->where('logs.total', $total)
            ->where('total', $total));
});

test('the account manager sees a company-scoped summary and never another company', function () {
    $mine = Company::factory()->create();
    $theirs = Company::factory()->create();

    a15AuditRow(['company_id' => $mine->id, 'action' => AuditAction::TOPUP_APPROVED]);
    a15AuditRow(['company_id' => $theirs->id, 'action' => AuditAction::TOPUP_APPROVED]);
    // A platform-only row: never visible to any company.
    a15AuditRow(['action' => AuditAction::PLATFORM_SETTING_UPDATED]);

    $expected = AuditLog::query()
        ->forCompany($mine->id)
        ->whereIn('action', AuditLogController::visibleActions())
        ->count();

    $this->actingAs($mine, 'company')
        ->get('/company/audit')
        ->assertOk()
        ->assertInertia(function ($page) use ($expected, $mine, $theirs) {
            $page->component('company/audit/index')->where('logs.total', $expected);

            $ids = collect($page->toArray()['props']['logs']['data'])->pluck('id');

            // ولا صف واحد يخص الشركة الأخرى، ولا صف نطاق منصة.
            $foreign = AuditLog::query()
                ->where(fn ($query) => $query->where('company_id', $theirs->id)->orWhereNull('company_id'))
                ->pluck('id');

            expect($ids->intersect($foreign))->toBeEmpty()
                ->and(AuditLog::query()->whereIn('id', $ids)->pluck('company_id')->unique()->all())
                ->toBe([$mine->id]);
        });
});

test('the company summary withholds IP, user agent and raw before/after values', function () {
    $company = Company::factory()->create();
    a15AuditRow([
        'company_id' => $company->id,
        'action' => AuditAction::TOPUP_APPROVED,
        'ip_address' => '198.51.100.7',
        'user_agent' => 'SecretBrowser/9',
        'before_values' => ['secret' => 'قيمة داخلية'],
    ]);

    $this->actingAs($company, 'company')
        ->get('/company/audit')
        ->assertOk()
        ->assertInertia(function ($page) {
            $row = $page->toArray()['props']['logs']['data'][0];

            expect($row)->not->toHaveKey('ip_address')
                ->and($row)->not->toHaveKey('user_agent')
                ->and($row)->not->toHaveKey('before_values');
        });
});

test('company-scoped audit rows never leak into another company via the model scope', function () {
    $mine = Company::factory()->create();
    $theirs = Company::factory()->create();

    $mineBefore = AuditLog::query()->forCompany($mine->id)->count();

    a15AuditRow(['company_id' => $mine->id]);
    a15AuditRow(['company_id' => $theirs->id]);

    expect(AuditLog::query()->forCompany($mine->id)->count())->toBe($mineBefore + 1)
        ->and(AuditLog::query()->forCompany($mine->id)->get()->pluck('company_id')->unique()->all())->toBe([$mine->id]);
});

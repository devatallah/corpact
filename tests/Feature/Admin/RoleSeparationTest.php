<?php

use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Models\User;

/**
 * H §16 / G («دليل أدمن تيمات» + «دليل الأدمن المالي» + «دليل وكيل الدعم»):
 *
 *   أدمن المنصة: كل شيء عدا الاعتماد المالي · الأدمن المالي: الاعتمادات
 *   المالية وحدها · وكيل الدعم: قراءة وتدخل محدود.
 */
function a15Staff(Role $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role, RoleAssignment::SCOPE_PLATFORM);

    return $user->fresh();
}

test('the three Teamat staff roles exist with the spec labels', function () {
    expect(Role::tryFrom('platform_admin'))->not->toBeNull()
        ->and(Role::tryFrom('finance_admin'))->not->toBeNull()
        ->and(Role::tryFrom('support_agent'))->not->toBeNull()
        ->and(Role::SupportAgent->label())->toBe('وكيل الدعم')
        ->and(Role::platformRoles())->toContain(Role::SupportAgent);
});

test('the platform admin holds everything except the financial approvals', function () {
    $permissions = Role::PlatformAdmin->permissions();

    // «كل شيء عدا الاعتماد المالي»
    expect($permissions)->toContain('platform.manage')
        ->and($permissions)->toContain('event.force_state')
        ->and($permissions)->toContain('catalog.manage')
        ->and($permissions)->toContain('audit.view')
        ->and($permissions)->toContain('security.events.view')
        ->and($permissions)->not->toContain('wallet.topup.approve')
        ->and($permissions)->not->toContain('settlement.approve')
        ->and($permissions)->not->toContain('invoice.approve')
        ->and($permissions)->not->toContain('refund.approve');
});

test('the finance admin holds the financial approvals and nothing operational', function () {
    $permissions = Role::FinanceAdmin->permissions();

    expect($permissions)->toContain('wallet.topup.approve')
        ->and($permissions)->toContain('settlement.approve')
        ->and($permissions)->toContain('invoice.approve')
        ->and($permissions)->toContain('refund.approve')
        ->and($permissions)->not->toContain('platform.manage')
        ->and($permissions)->not->toContain('event.force_state')
        ->and($permissions)->not->toContain('catalog.manage')
        ->and($permissions)->not->toContain('admins.manage');
});

test('the support agent holds read + limited intervention only', function () {
    $permissions = Role::SupportAgent->permissions();

    // ما يفعله
    expect($permissions)->toContain('support.search')
        ->and($permissions)->toContain('event.history.view')
        ->and($permissions)->toContain('notifications.logs.view')
        ->and($permissions)->toContain('support.resend')
        ->and($permissions)->toContain('support.messages.manage');

    // ما لا يفعله — كل بند في مصفوفة التصعيد
    foreach (array_keys(Role::escalationMatrix()) as $forbidden) {
        expect($permissions)->not->toContain($forbidden);
    }
});

test('A14 granted notifications.logs.view to the support agent as promised', function () {
    expect(Role::SupportAgent->hasPermission('notifications.logs.view'))->toBeTrue();

    $support = a15Staff(Role::SupportAgent);

    $this->actingAs($support, 'admin')->get('/admin/notification-logs')->assertOk();
});

test('the support agent may search, read event state history and resend', function () {
    $support = a15Staff(Role::SupportAgent);
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $event = Event::factory()->create(['company_id' => $company->id, 'community_id' => $community->id]);

    $this->actingAs($support, 'admin')->get('/admin/support-console')->assertOk();
    $this->actingAs($support, 'admin')->get('/admin/support-console?search='.$event->id)->assertOk();
    $this->actingAs($support, 'admin')->get("/admin/support-console/events/{$event->id}")->assertOk();
    $this->actingAs($support, 'admin')->get('/admin/support')->assertOk();
});

/**
 * G — «ما لا تفعله — يُصعَّد فوراً»: one denial per row of the escalation
 * matrix, exercised through the real routes.
 */
test('every support-agent escalation row is refused at the route', function () {
    $support = a15Staff(Role::SupportAgent);

    // Real records, so route-model binding resolves and the 403 comes from the
    // permission gate — not from a missing id.
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $event = Event::factory()->create(['company_id' => $company->id, 'community_id' => $community->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $partner = Partner::factory()->create();

    $blocked = [
        'تغيير حالة فعالية يدوياً' => ['post', "/admin/events/{$event->id}/force-status"],
        'تعديل الحضور بعد النافذة' => ['post', "/admin/events/{$event->id}/attendance/{$employee->id}"],
        'إلغاء فعالية' => ['post', "/admin/events/{$event->id}/cancel"],
        'اعتماد تحويل بنكي' => ['get', '/admin/finance/topups'],
        'اعتماد كشف تسوية' => ['get', '/admin/finance/settlements'],
        'الفواتير الشهرية' => ['get', '/admin/finance/invoices'],
        'فشل المدفوعات والاستردادات' => ['get', '/admin/payments/failures'],
        'تعديل مؤشر الموثوقية' => ['post', "/admin/providers/{$partner->id}/reliability"],
        'اعتماد الحساب البنكي' => ['post', "/admin/providers/{$partner->id}/bank/approve"],
        'تغيير صلاحية أو دور' => ['post', '/admin/admins'],
        'مراجعة الصلاحيات' => ['get', '/admin/security/permission-review'],
        'شجرة الفئات' => ['get', '/admin/categories'],
        'إعدادات المنصة' => ['get', '/admin/settings/platform'],
        'الشركات والعقود' => ['get', '/admin/companies'],
        'سجل التدقيق الكامل' => ['get', '/admin/audit'],
        'الأحداث الأمنية' => ['get', '/admin/security/events'],
        'الإيرادات' => ['get', '/admin/revenue'],
        'قوالب الرسائل' => ['get', '/admin/notification-templates'],
    ];

    foreach ($blocked as $label => [$method, $uri]) {
        $this->actingAs($support, 'admin')
            ->call($method, $uri)
            ->assertForbidden("«{$label}» يجب أن يُصعَّد لا أن ينفّذه الدعم");
    }
});

test('the finance admin cannot reach the operational screens', function (string $method, string $uri) {
    $finance = a15Staff(Role::FinanceAdmin);

    $this->actingAs($finance, 'admin')->call($method, $uri)->assertForbidden();
})->with([
    'الشركات' => ['get', '/admin/companies'],
    'الفعاليات' => ['get', '/admin/events'],
    'إعدادات المنصة' => ['get', '/admin/settings/platform'],
    'سجل التدقيق' => ['get', '/admin/audit'],
    'الأحداث الأمنية' => ['get', '/admin/security/events'],
    'مركز الدعم' => ['get', '/admin/support-console'],
    'المشرفون' => ['get', '/admin/admins'],
]);

test('the platform admin cannot approve money', function (string $method, string $uri) {
    $admin = a15Staff(Role::PlatformAdmin);

    $this->actingAs($admin, 'admin')->call($method, $uri)->assertForbidden();
})->with([
    'اعتماد التحويلات' => ['get', '/admin/finance/topups'],
    'كشوف التسوية' => ['get', '/admin/finance/settlements'],
    'الفواتير' => ['get', '/admin/finance/invoices'],
    'فشل المدفوعات' => ['get', '/admin/payments/failures'],
]);

test('the platform admin reaches the audit, security, settings and support screens', function () {
    $admin = a15Staff(Role::PlatformAdmin);

    $this->actingAs($admin, 'admin')->get('/admin/audit')->assertOk();
    $this->actingAs($admin, 'admin')->get('/admin/security/events')->assertOk();
    $this->actingAs($admin, 'admin')->get('/admin/security/permission-review')->assertOk();
    $this->actingAs($admin, 'admin')->get('/admin/settings/platform')->assertOk();
    $this->actingAs($admin, 'admin')->get('/admin/support-console')->assertOk();
});

test('a user holding two staff roles is served the union of both permission sets', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);
    $user->assignRole(Role::FinanceAdmin, RoleAssignment::SCOPE_PLATFORM);
    $user = $user->fresh();

    $permissions = $user->platformPermissions();

    expect($permissions)->toContain('platform.manage')
        ->and($permissions)->toContain('wallet.topup.approve')
        ->and($user->platformRoles())->toHaveCount(2);
});

test('the escalation matrix names the right owner for every blocked action', function () {
    $matrix = Role::escalationMatrix();

    expect($matrix['event.force_state'])->toBe(Role::PlatformAdmin)
        ->and($matrix['attendance.edit_post_window'])->toBe(Role::PlatformAdmin)
        ->and($matrix['provider.reliability.adjust'])->toBe(Role::PlatformAdmin)
        ->and($matrix['admins.manage'])->toBe(Role::PlatformAdmin)
        ->and($matrix['refund.approve'])->toBe(Role::FinanceAdmin)
        ->and($matrix['wallet.topup.approve'])->toBe(Role::FinanceAdmin)
        ->and($matrix['settlement.approve'])->toBe(Role::FinanceAdmin)
        ->and(Role::escalatesTo('event.force_state'))->toBe(Role::PlatformAdmin)
        ->and(Role::escalatesTo('event.join'))->toBeNull();
});

test('the finance admin cannot force an event state even though it is a real event', function () {
    $finance = a15Staff(Role::FinanceAdmin);
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);

    $this->actingAs($finance, 'admin')
        ->post("/admin/events/{$event->id}/force-status", ['status' => 'confirmed', 'reason' => 'محاولة غير مخوَّلة'])
        ->assertForbidden();
});

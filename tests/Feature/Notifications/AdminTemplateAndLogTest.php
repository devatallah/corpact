<?php

use App\Enums\Role;
use App\Models\AdminAlert;
use App\Models\Company;
use App\Models\Employee;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\Partner;
use App\Models\User;
use App\Services\Notifications\CriticalAlertService;
use App\Support\Notify;

/**
 * H §14 — «القوالب يديرها أدمن تيمات فقط».
 * G (وكيل الدعم) — «قراءة سجل الإشعارات وحالات التسليم».
 */
function platformAdminUser(): User
{
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    return $admin;
}

function financeAdminUser(): User
{
    $admin = User::factory()->create();
    $admin->assignRole(Role::FinanceAdmin);

    return $admin;
}

it('lets a platform admin browse the template catalogue', function () {
    $this->actingAs(platformAdminUser(), 'admin')
        ->get('/admin/notification-templates')
        ->assertOk();
});

it('lets a platform admin rewrite a message without touching code', function () {
    $template = NotificationTemplate::query()->where('key', 'event.reminder.2h')->first();

    $this->actingAs(platformAdminUser(), 'admin')
        ->put("/admin/notification-templates/{$template->id}", [
            'title_ar' => 'تذكير محدث',
            'body_ar' => 'فعالية {community} تبدأ الساعة {time}. لا تتأخر!',
            'active' => true,
        ])
        ->assertSessionHas('success');

    $template->refresh();

    expect($template->title_ar)->toBe('تذكير محدث')
        ->and($template->variables)->toBe(['community', 'time']);

    // والنص الجديد هو ما يصل فعلاً.
    $employee = Employee::factory()->create();
    $notification = Notify::send('event.reminder.2h', $employee, ['community' => 'البادل', 'time' => '19:00']);

    expect($notification->body)->toBe('فعالية البادل تبدأ الساعة 19:00. لا تتأخر!');
});

it('refuses to deactivate a mandatory template even when the request says so', function () {
    $template = NotificationTemplate::query()->where('key', 'payment.demand')->first();

    $this->actingAs(platformAdminUser(), 'admin')
        ->put("/admin/notification-templates/{$template->id}", [
            'title_ar' => $template->title_ar,
            'body_ar' => $template->body_ar,
            'active' => false,
        ])
        ->assertSessionHas('success');

    expect($template->fresh()->active)->toBeTrue();
});

it('lets an optional template be switched off by the admin', function () {
    $template = NotificationTemplate::query()->where('key', 'community.poll')->first();

    $this->actingAs(platformAdminUser(), 'admin')
        ->put("/admin/notification-templates/{$template->id}", [
            'title_ar' => $template->title_ar,
            'body_ar' => $template->body_ar,
            'active' => false,
        ])
        ->assertSessionHas('success');

    expect($template->fresh()->active)->toBeFalse();
});

it('rejects an empty Arabic body — a template with no text is a silent outage', function () {
    $template = NotificationTemplate::query()->where('key', 'community.poll')->first();

    $this->actingAs(platformAdminUser(), 'admin')
        ->put("/admin/notification-templates/{$template->id}", ['title_ar' => 'x', 'body_ar' => ''])
        ->assertSessionHasErrors('body_ar');
});

it('blocks a finance admin from managing templates — H §14 says platform admin only', function () {
    $template = NotificationTemplate::query()->first();

    $this->actingAs(financeAdminUser(), 'admin')
        ->get('/admin/notification-templates')
        ->assertForbidden();

    $this->actingAs(financeAdminUser(), 'admin')
        ->put("/admin/notification-templates/{$template->id}", ['title_ar' => 'x', 'body_ar' => 'y'])
        ->assertForbidden();
});

it('keeps the template screens out of the other portals entirely', function () {
    $this->actingAs(Company::factory()->create(), 'company')->get('/admin/notification-templates')->assertRedirect();
    $this->actingAs(Partner::factory()->create(), 'partner')->get('/admin/notification-templates')->assertRedirect();
    $this->actingAs(Employee::factory()->create(), 'employee')->get('/admin/notification-templates')->assertRedirect();
    $this->get('/admin/notification-templates')->assertRedirect();
});

it('gives support the delivery log — the first thing to open on «nothing reached me»', function () {
    $employee = Employee::factory()->create(['phone' => '0551234567']);
    Notify::send('payment.demand', $employee, [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    $this->actingAs(platformAdminUser(), 'admin')
        ->get('/admin/notification-logs?search=0551234567')
        ->assertOk();

    expect(NotificationLog::query()->where('recipient_phone', '966551234567')->exists())->toBeTrue();
});

it('gates the delivery log behind its own permission so A15 can grant it to support alone', function () {
    $this->actingAs(financeAdminUser(), 'admin')
        ->get('/admin/notification-logs')
        ->assertForbidden();
});

it('lets a platform admin read and acknowledge critical alerts but never delete them', function () {
    $alert = AdminAlert::query()->create([
        'key' => 'payments.webhook_failed',
        'level' => 'critical',
        'title' => 'فشلت معالجة ويبهوك دفع',
        'occurrences' => 1,
        'last_seen_at' => now(),
    ]);

    $admin = platformAdminUser();

    $this->actingAs($admin, 'admin')->get('/admin/alerts')->assertOk();

    $this->actingAs($admin, 'admin')
        ->post("/admin/alerts/{$alert->id}/acknowledge")
        ->assertSessionHas('success');

    $alert->refresh();

    expect($alert->acknowledged_at)->not->toBeNull()
        ->and($alert->acknowledged_by)->toBe($admin->id)
        ->and(AdminAlert::query()->count())->toBe(1);
});

it('groups a repeated alert instead of flooding the admin inbox', function () {
    $alerts = app(CriticalAlertService::class);

    $alerts->raise('payments.webhook_failed', 'فشل ويبهوك', context: ['webhook_id' => 3]);
    $alerts->raise('payments.webhook_failed', 'فشل ويبهوك', context: ['webhook_id' => 3]);
    $alerts->raise('payments.webhook_failed', 'فشل ويبهوك', context: ['webhook_id' => 9]);

    expect(AdminAlert::query()->count())->toBe(2)
        ->and(AdminAlert::query()->orderBy('id')->first()->occurrences)->toBe(2);
});

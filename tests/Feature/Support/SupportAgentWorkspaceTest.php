<?php

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Event;
use App\Models\RoleAssignment;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * مساحة عمل وكيل الدعم — خمس مهام، خمس شاشات.
 *
 * دليل وكيل الدعم يصف خمس مهام متمايزة، وكانت ثلاث منها مكدّسة في شاشة
 * «مركز الدعم». هذه الاختبارات تثبّت أن لكل مهمة مساراً يفتحه الوكيل
 * بصلاحيته وحدها — لا بصلاحية أدمن المنصة.
 */
function workspaceAgent(): User
{
    $agent = User::factory()->create();
    $agent->assignRole(Role::SupportAgent, RoleAssignment::SCOPE_PLATFORM);

    return $agent->fresh();
}

test('a support agent opens every screen its guide names', function (string $uri) {
    $this->actingAs(workspaceAgent(), 'admin')->get($uri)->assertOk();
})->with([
    'البحث والاستعلام' => '/admin/support-console',
    'سجل الفعاليات والحالات' => '/admin/support/events',
    'سجل الإشعارات والتسليم' => '/admin/notification-logs',
    'إعادة إرسال الدعوات' => '/admin/support/resend',
    'توثيق البلاغات والتصعيد' => '/admin/support',
]);

test('the events log paginates at 20 and filters by status', function () {
    Event::factory()->count(3)->create(['status' => 'completed']);
    Event::factory()->create(['status' => 'open']);

    $agent = workspaceAgent();

    $this->actingAs($agent, 'admin')
        ->get('/admin/support/events')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('events.per_page', 20)
            ->has('events.data', 4)
        );

    $this->actingAs($agent, 'admin')
        ->get('/admin/support/events?status=completed')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('events.data', 3));
});

test('an escalation is documented in the append-only audit log and routed to the right role', function () {
    $company = Company::factory()->create();

    $this->actingAs(workspaceAgent(), 'admin')
        ->post('/admin/support/escalations', [
            'company_id' => $company->id,
            'action' => 'refund.approve',
            'summary' => 'العميل يطلب استرداد حصته بعد إلغاء المرفق.',
        ])
        ->assertSessionHasNoErrors()
        // الوجهة تُقرأ من مصفوفة التصعيد لا من اختيار الوكيل.
        ->assertSessionHas('success', fn (string $message) => str_contains($message, 'الأدمن المالي'));

    $log = AuditLog::query()->latest('id')->first();

    expect($log->after_values['report'])->toBe('support.escalation')
        ->and($log->after_values['escalated_to'])->toBe('finance_admin')
        ->and($log->company_id)->toBe($company->id);
});

test('leaving the optional fields blank does not fail the escalation', function () {
    // `validate()` يُسقط المفاتيح غير المُرسَلة؛ قراءتها مباشرة كانت تُنتج
    // خطأ خادم يبتلعه النموذج بلا رسالة.
    $this->actingAs(workspaceAgent(), 'admin')
        ->post('/admin/support/escalations', [
            'action' => 'event.force_state',
            'summary' => 'حالة الفعالية عالقة بعد قبول المزوّد.',
        ])
        ->assertSessionHasNoErrors();

    expect(AuditLog::query()->latest('id')->first()->after_values['event_id'])->toBeNull();
});

test('an escalation without a summary is refused — an undocumented report is not a report', function () {
    $this->actingAs(workspaceAgent(), 'admin')
        ->post('/admin/support/escalations', ['action' => 'refund.approve'])
        ->assertSessionHasErrors('summary');
});

test('a platform admin without support permissions cannot reach the agent screens', function () {
    // الصلاحيات لا الأدوار: من لا يملك `support.resend` لا يفتح شاشتها.
    $stranger = User::factory()->create();
    $stranger->assignRole(Role::FinanceAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($stranger->fresh(), 'admin')
        ->get('/admin/support/resend')
        ->assertForbidden();
});

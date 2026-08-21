<?php

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\CoordinatorMonthlyReport;
use App\Models\Employee;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\Employee\EmployeeReportService;
use App\Support\Audit\AuditAction;
use Illuminate\Support\Carbon;

// H §18 — خرائط الصفحات، وH §4 — «خارج النطاق 404 لا 403».
// وH §15 — التصدير يمر بنفس فحص الصلاحيات ونطاق الشركة (فهو داخل مجموعة
// المسارات نفسها، وهذا ما تثبته الاختبارات أدناه).

test('the company reports page renders on the KPI dictionary', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    a13Event($community, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $this->actingAs($company, 'company')
        ->get('/company/reports?period=2026-08')
        ->assertOk();

    $this->actingAs($company, 'company')->get('/company/dash')->assertOk();

    Carbon::setTestNow();
});

test('the reports page and its exports are behind the same guard', function () {
    $company = Company::factory()->create();

    // ضيف: الشاشة والتصدير كلاهما يعيد التوجيه لتسجيل الدخول.
    $this->get('/company/reports')->assertRedirect(route('company.login'));
    $this->get('/company/reports/export/employees_activation')->assertRedirect(route('company.login'));

    // حارس آخر لا يصل أياً منهما.
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $this->actingAs($employee, 'employee')->get('/company/reports')->assertRedirect();
    $this->actingAs($employee, 'employee')->get('/company/reports/export/invoices')->assertRedirect();
});

test('an account manager export over HTTP downloads a file and leaves an audit row', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id, 'phone' => '0500000000']);
    a13Event($community, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $response = $this->actingAs($company, 'company')
        ->get('/company/reports/export/employees_activation?format=xlsx&period=2026-08');

    $response->assertOk();

    expect($response->headers->get('X-Export-Rows'))->toBe('1')
        ->and(AuditLog::query()->where('action', AuditAction::REPORT_EXPORTED)->where('company_id', $company->id)->count())->toBe(1);

    Carbon::setTestNow();
});

test('a community leader exports their own community only, and a non-leader cannot', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($leader->id, ['status' => 'active', 'joined_at' => now()->subMonth()]);
    $leader->fresh()->user->assignRole(Role::CommunityLeader, RoleAssignment::SCOPE_COMMUNITY, $community->id, true);

    $member = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($member->id, ['status' => 'active', 'joined_at' => now()->subMonth()]);

    a13Event($community, [$member->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $this->actingAs($leader->fresh(), 'employee')
        ->get("/employee/community/{$community->id}/exports/events_results?format=xlsx&period=2026-08")
        ->assertOk();

    // القائد ممنوع من دفتر المحفظة أصلاً.
    $this->actingAs($leader->fresh(), 'employee')
        ->get("/employee/community/{$community->id}/exports/wallet_transactions?format=xlsx")
        ->assertForbidden();

    // عضو ليس قائداً لا يصدّر شيئاً.
    $this->actingAs($member->fresh(), 'employee')
        ->get("/employee/community/{$community->id}/exports/events_results?format=xlsx")
        ->assertForbidden();

    Carbon::setTestNow();
});

test('a company cannot open another company monthly report — 404, not 403', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    $mine = Company::factory()->create();
    $theirs = Company::factory()->create();

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $theirReport = CoordinatorMonthlyReport::query()->where('company_id', $theirs->id)->firstOrFail();
    $myReport = CoordinatorMonthlyReport::query()->where('company_id', $mine->id)->firstOrFail();

    $this->actingAs($mine, 'company')->get("/company/reports/monthly/{$myReport->id}")->assertOk();
    $this->actingAs($mine, 'company')->get("/company/reports/monthly/{$theirReport->id}")->assertNotFound();

    Carbon::setTestNow();
});

test('a coordinator sees only the companies assigned to them', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    $assigned = Company::factory()->create(['name' => 'شركة مسندة']);
    $other = Company::factory()->create(['name' => 'شركة أخرى']);

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $coordinator = User::factory()->create(['name' => 'المنسّق']);
    $coordinator->assignRole(Role::Coordinator, RoleAssignment::SCOPE_COMPANY, $assigned->id);

    $mine = CoordinatorMonthlyReport::query()->where('company_id', $assigned->id)->firstOrFail();
    $theirs = CoordinatorMonthlyReport::query()->where('company_id', $other->id)->firstOrFail();

    $this->actingAs($coordinator->fresh(), 'admin')->get('/coordinator/reports')->assertOk();
    $this->actingAs($coordinator->fresh(), 'admin')->get("/coordinator/reports/{$mine->id}")->assertOk();
    // شركة غير مسندة = غير موجودة (H §4).
    $this->actingAs($coordinator->fresh(), 'admin')->get("/coordinator/reports/{$theirs->id}")->assertNotFound();

    // مستخدم بلا إسناد ولا صلاحية منصة لا يصل أصلاً.
    $stranger = User::factory()->create();
    $this->actingAs($stranger, 'admin')->get('/coordinator/reports')->assertForbidden();

    Carbon::setTestNow();
});

test('a coordinator saves closed-list recommendations through the page and free text is rejected', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();
    $report = CoordinatorMonthlyReport::query()->where('company_id', $company->id)->firstOrFail();

    $coordinator = User::factory()->create();
    $coordinator->assignRole(Role::Coordinator, RoleAssignment::SCOPE_COMPANY, $company->id);

    $this->actingAs($coordinator->fresh(), 'admin')
        ->post("/coordinator/reports/{$report->id}/recommendations", [
            'recommendations' => [
                ['cause' => 'community_dormant', 'action' => 'appoint_leader', 'community_id' => $community->id],
            ],
            'note' => 'ملاحظة واحدة.',
        ])
        ->assertSessionHas('success');

    expect($report->fresh()->recommendations)->toHaveCount(1)
        ->and($report->fresh()->note)->toBe('ملاحظة واحدة.');

    // النص الحر مرفوض بالتحقق قبل أن يلمس الخدمة.
    $this->actingAs($coordinator->fresh(), 'admin')
        ->post("/coordinator/reports/{$report->id}/recommendations", [
            'recommendations' => [['cause' => 'الفريق مشغول', 'action' => 'نتكلم معهم']],
        ])
        ->assertSessionHasErrors(['recommendations.0.cause', 'recommendations.0.action']);

    Carbon::setTestNow();
});

test('the ghost-event monitor renders weekly rows for the platform admin only', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin->fresh(), 'admin')
        ->get('/admin/monitoring/ghost-events')
        ->assertOk();

    $stranger = User::factory()->create();
    $this->actingAs($stranger, 'admin')
        ->get('/admin/monitoring/ghost-events')
        ->assertForbidden();

    Carbon::setTestNow();
});

test('no company-facing report exposes another company for comparison', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $mine = Company::factory()->create(['name' => 'شركتي']);
    $rival = Company::factory()->create(['name' => 'الشركة المنافسة']);

    $rivalCommunity = Community::factory()->create(['company_id' => $rival->id, 'name' => 'مجتمع المنافس']);
    $rivalEmployee = Employee::factory()->create(['company_id' => $rival->id, 'name' => 'موظف المنافس']);
    a13Event($rivalCommunity, [$rivalEmployee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $myCommunity = Community::factory()->create(['company_id' => $mine->id, 'name' => 'مجتمعي']);
    $myEmployee = Employee::factory()->create(['company_id' => $mine->id, 'name' => 'موظفي']);
    a13Event($myCommunity, [$myEmployee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    // «المقارنة بين الشركات» مستثناة نصاً من الإصدار الأول (G/الشركة §7).
    foreach (['/company/reports?period=2026-08', '/company/dash'] as $url) {
        $content = $this->actingAs($mine, 'company')->get($url)->assertOk()->getContent();

        expect($content)->not->toContain('الشركة المنافسة')
            ->not->toContain('مجتمع المنافس')
            ->not->toContain('موظف المنافس');
    }

    Carbon::setTestNow();
});

test('the employee report shows only that employee own history and achievements', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $me = Employee::factory()->create(['company_id' => $company->id, 'name' => 'أنا']);
    $colleague = Employee::factory()->create(['company_id' => $company->id, 'name' => 'زميل لم أشاركه']);

    $community->members()->attach($me->id, ['status' => 'active', 'joined_at' => now()->subMonth()]);

    a13Event($community, [$me->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);
    a13Event($community, [$colleague->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-11 18:00')]);

    $content = $this->actingAs($me, 'employee')->get('/employee/reports')->assertOk()->getContent();

    expect($content)->not->toContain('زميل لم أشاركه');

    $achievements = app(EmployeeReportService::class)->achievements($me);

    expect($achievements['attended_events'])->toBe(1)
        ->and($achievements['activated'])->toBeTrue()
        ->and($achievements['absences_this_period'])->toBe(0);

    Carbon::setTestNow();
});

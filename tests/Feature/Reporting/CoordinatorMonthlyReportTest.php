<?php

use App\Enums\EventStatus;
use App\Enums\ReportAction;
use App\Enums\ReportCause;
use App\Enums\Role;
use App\Exceptions\ImmutableReportSnapshotException;
use App\Models\Community;
use App\Models\Company;
use App\Models\CoordinatorMonthlyReport;
use App\Models\Employee;
use App\Models\EventStatusHistory;
use App\Models\Notification;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\Reporting\CoordinatorReportService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

// H §15 + G/المنسّق §3 — «يُولَّد آلياً في اليوم الثاني من كل شهر: الفعاليات
// المكتملة، معدل التفعيل، المجتمعات الخاملة، أسباب الإلغاء، ومقارنة بالشهر
// السابق… التوصيات تُختار من قائمة أسباب وإجراءات مغلقة لا نص حر، مع حقل
// ملاحظة واحد اختياري… يستلمه مسؤول الحساب ونسخة لأدمن تيمات، ويُحفظ نسخة
// ثابتة لكل شهر».

function a13ReportFixture(): array
{
    $company = Company::factory()->create(['name' => 'شركة التقرير']);
    $community = Community::factory()->create(['company_id' => $company->id, 'name' => 'مجتمع نشط']);
    $dormant = Community::factory()->create(['company_id' => $company->id, 'name' => 'مجتمع خامل']);

    $employees = Employee::factory()->count(4)->create(['company_id' => $company->id]);

    // يوليو: موظف واحد فُعِّل (خط المقارنة).
    a13Event($community, [$employees[0]->id => 'attended'], [
        'completed_at' => Carbon::parse('2026-07-15 18:00'),
        'created_at' => Carbon::parse('2026-07-01 09:00'),
    ]);

    // أغسطس: موظفان فُعِّلا وثالث غاب.
    a13Event($community, [
        $employees[0]->id => 'attended',
        $employees[1]->id => 'attended',
        $employees[2]->id => 'absent',
    ], [
        'completed_at' => Carbon::parse('2026-08-12 18:00'),
        'created_at' => Carbon::parse('2026-08-02 09:00'),
    ]);

    // فعالية أُنشئت وأُلغيت في أغسطس لعدم بلوغ الحد الأدنى.
    $cancelled = a13Event($community, [], [
        'status' => EventStatus::CancelledMinNotMet->value,
        'completed_at' => null,
        'starts_at' => Carbon::parse('2026-08-20 18:00'),
        'created_at' => Carbon::parse('2026-08-05 09:00'),
    ]);

    EventStatusHistory::create([
        'event_id' => $cancelled->id,
        'from_status' => 'open',
        'to_status' => EventStatus::CancelledMinNotMet->value,
        'created_at' => Carbon::parse('2026-08-19 10:00'),
    ]);

    return ['company' => $company, 'community' => $community, 'dormant' => $dormant, 'employees' => $employees];
}

test('the day-2 command generates the previous month snapshot with all five mandated sections', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    ['company' => $company] = a13ReportFixture();

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $report = CoordinatorMonthlyReport::query()->where('company_id', $company->id)->firstOrFail();

    expect($report->period_key)->toBe('2026-08')
        // ① الفعاليات المكتملة
        ->and($report->metric('completed_events'))->toBe(1)
        // ② معدل التفعيل — موظفان من أربعة
        ->and($report->metric('activation_rate.numerator'))->toBe(2)
        ->and($report->metric('activation_rate.denominator'))->toBe(4)
        ->and($report->metric('activation_rate.rate'))->toEqual(50.0)
        // ③ المجتمعات الخاملة
        ->and(collect($report->metric('communities.dormant'))->pluck('name')->all())->toBe(['مجتمع خامل'])
        ->and(collect($report->metric('communities.active'))->pluck('name')->all())->toBe(['مجتمع نشط'])
        // ④ أسباب الإلغاء — من القائمة المغلقة (حالات آلة الحالات)
        ->and(collect($report->metric('cancellation_reasons'))->firstWhere('status', EventStatus::CancelledMinNotMet->value)['count'])->toBe(1)
        ->and($report->metric('cancellation_rate.numerator'))->toBe(1)
        ->and($report->metric('cancellation_rate.denominator'))->toBe(2)
        // ⑤ المقارنة بالشهر السابق: يوليو 1 من 4 = 25% ⟶ أغسطس 50%
        ->and($report->metric('month_over_month.activation_rate.previous'))->toEqual(25.0)
        ->and($report->metric('month_over_month.activation_rate.current'))->toEqual(50.0)
        ->and($report->metric('month_over_month.activation_rate.change'))->toEqual(25.0);

    Carbon::setTestNow();
});

test('running the command twice produces exactly one snapshot and one delivery', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    ['company' => $company] = a13ReportFixture();

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $before = Notification::query()->count();

    Carbon::setTestNow(Carbon::parse('2026-09-02 05:00'));
    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    Carbon::setTestNow(Carbon::parse('2026-09-04 04:00'));
    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    expect(CoordinatorMonthlyReport::query()->where('company_id', $company->id)->count())->toBe(1)
        ->and(Notification::query()->count())->toBe($before);

    Carbon::setTestNow();
});

test('the stored snapshot is immutable — later attendance edits never rewrite a closed month', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    ['company' => $company, 'community' => $community, 'employees' => $employees] = a13ReportFixture();

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $report = CoordinatorMonthlyReport::query()->where('company_id', $company->id)->firstOrFail();

    // تعديل متأخر على أغسطس: موظف رابع يُسجَّل حاضراً بعد إصدار التقرير.
    a13Event($community, [$employees[3]->id => 'attended'], [
        'completed_at' => Carbon::parse('2026-08-25 18:00'),
        'created_at' => Carbon::parse('2026-08-25 09:00'),
    ]);

    // اللقطة كما هي — لا يُعاد حسابها.
    expect($report->fresh()->metric('activation_rate.numerator'))->toBe(2);

    // وتعديلها مباشرةً ممنوع.
    $report->snapshot = ['tampered' => true];
    expect(fn () => $report->save())
        ->toThrow(ImmutableReportSnapshotException::class, 'snapshot');

    $fresh = CoordinatorMonthlyReport::query()->findOrFail($report->id);
    $fresh->period_key = '2026-01';
    expect(fn () => $fresh->save())->toThrow(ImmutableReportSnapshotException::class);

    // ولا يُحذف.
    expect(fn () => CoordinatorMonthlyReport::query()->findOrFail($report->id)->delete())
        ->toThrow(ImmutableReportSnapshotException::class);

    expect(CoordinatorMonthlyReport::query()->where('company_id', $company->id)->count())->toBe(1);

    Carbon::setTestNow();
});

test('the report is delivered to the account manager with a copy to the platform admin', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    $admin = User::factory()->create(['name' => 'أدمن تيمات']);
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    ['company' => $company] = a13ReportFixture();

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $report = CoordinatorMonthlyReport::query()->where('company_id', $company->id)->firstOrFail();

    $toCompany = Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->get();

    // نسخة الأدمن لهذا التقرير بعينه — المهمة تولّد تقريراً لكل شركة، فالنسخ
    // تُفرز بمعرّف التقرير لا بعددها الكلي.
    $toAdmin = Notification::query()
        ->where('notifiable_type', User::class)
        ->where('notifiable_id', $admin->id)
        ->get()
        ->filter(fn ($notification) => (int) data_get($notification->data, 'report_id') === (int) $report->id);

    expect($report->delivered_at)->not->toBeNull()
        ->and($toCompany)->toHaveCount(1)
        ->and($toCompany->first()->title)->toContain('2026-08')
        ->and($toAdmin)->toHaveCount(1)
        ->and($toAdmin->first()->title)->toContain('شركة التقرير');

    Carbon::setTestNow();
});

test('recommendations accept only closed-list values and exactly one note field', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    ['company' => $company, 'community' => $community] = a13ReportFixture();
    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $report = CoordinatorMonthlyReport::query()->where('company_id', $company->id)->firstOrFail();
    $coordinator = User::factory()->create(['name' => 'المنسّق']);
    $coordinator->assignRole(Role::Coordinator, RoleAssignment::SCOPE_COMPANY, $company->id);

    $service = app(CoordinatorReportService::class);

    $saved = $service->saveRecommendations($report, [
        ['cause' => ReportCause::CommunityDormant->value, 'action' => ReportAction::AppointLeader->value, 'community_id' => $community->id],
        ['cause' => ReportCause::MinimumNotMet->value, 'action' => ReportAction::LowerMinimum->value, 'community_id' => null],
    ], 'الفريق يسافر في الربع الأخير.', $coordinator);

    expect($saved->recommendations)->toHaveCount(2)
        ->and($saved->note)->toBe('الفريق يسافر في الربع الأخير.')
        ->and($saved->status)->toBe(CoordinatorMonthlyReport::STATUS_SUBMITTED)
        ->and($saved->submitted_at)->not->toBeNull();

    // نص حر خارج القائمة يُرفض عند العتبة — لا صف يُكتب.
    expect(fn () => $service->saveRecommendations($report->fresh(), [
        ['cause' => 'المجتمع يحتاج حماساً أكثر', 'action' => ReportAction::AwarenessCampaign->value],
    ], null, $coordinator))->toThrow(ValueError::class);

    expect(fn () => $service->saveRecommendations($report->fresh(), [
        ['cause' => ReportCause::LowActivation->value, 'action' => 'نتكلم مع المدير'],
    ], null, $coordinator))->toThrow(ValueError::class);

    // ولا يوجد سوى حقل ملاحظة واحد على التقرير كله — لا حقل لكل توصية.
    expect(Schema::hasColumn('coordinator_report_recommendations', 'note'))->toBeFalse()
        ->and(Schema::hasColumn('coordinator_monthly_reports', 'note'))->toBeTrue();

    Carbon::setTestNow();
});

test('a recommendation cannot point at a community from another company', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    ['company' => $company] = a13ReportFixture();
    $foreign = Community::factory()->create(['company_id' => Company::factory()->create()->id]);

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();
    $report = CoordinatorMonthlyReport::query()->where('company_id', $company->id)->firstOrFail();

    expect(fn () => app(CoordinatorReportService::class)->saveRecommendations($report, [
        ['cause' => ReportCause::CommunityDormant->value, 'action' => ReportAction::PauseCommunity->value, 'community_id' => $foreign->id],
    ], null, null))->toThrow(RuntimeException::class, 'لا يتبع شركة هذا التقرير');

    Carbon::setTestNow();
});

test('the closed lists are enumerations, not editable data', function () {
    expect(ReportCause::values())->toHaveCount(12)
        ->and(ReportAction::values())->toHaveCount(15)
        ->and(ReportCause::options()[0])->toHaveKeys(['value', 'label'])
        ->and(ReportCause::tryFrom('anything_else'))->toBeNull()
        ->and(ReportAction::tryFrom('anything_else'))->toBeNull();
});

<?php

use App\Enums\EventStatus;
use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Company;
use App\Models\Department;
use App\Models\DepartmentHistory;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Models\Wallet;
use App\Services\Reporting\KpiDictionary;
use App\Services\Reporting\ReportPeriod;
use App\Services\Wallet\LedgerService;
use Illuminate\Support\Carbon;

// H §15 + G/الشركة §9 — قاموس المؤشرات: كل مؤشر بتوقيت الرياض، بفترة شهرية
// افتراضياً، ويستثني الفعاليات الملغاة. كل اختبار هنا يثبت **رقماً بعينه**
// من بيانات مبنية باليد، لا نطاقاً ولا «أكبر من صفر».

function a13Kpi(): KpiDictionary
{
    return app(KpiDictionary::class);
}

test('activation rate counts employees who attended at least one completed event, once each', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    // 5 موظفين نشطين + 1 معطّل (خارج المقام).
    $employees = Employee::factory()->count(5)->create(['company_id' => $company->id]);
    Employee::factory()->create(['company_id' => $company->id, 'status' => 'inactive']);

    // فعاليتان: الموظف الأول يحضر كليهما (يُحتسب مرة واحدة)، والثاني يحضر
    // واحدة، والثالث يُسجَّل غائباً فلا يُفعَّل.
    a13Event($community, [
        $employees[0]->id => 'attended',
        $employees[1]->id => 'attended',
        $employees[2]->id => 'absent',
    ], ['completed_at' => Carbon::parse('2026-08-05 18:00')]);

    a13Event($community, [
        $employees[0]->id => 'attended',
    ], ['completed_at' => Carbon::parse('2026-08-12 18:00')]);

    $metric = a13Kpi()->activationRate($company, ReportPeriod::month(2026, 8));

    expect($metric->numerator)->toBe(2)          // الأول والثاني — الأول مرة واحدة
        ->and($metric->denominator)->toBe(5)     // النشطون فقط
        ->and($metric->rate())->toBe(40.0);

    Carbon::setTestNow();
});

test('activation rate excludes events completed outside the period', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employees = Employee::factory()->count(4)->create(['company_id' => $company->id]);

    a13Event($community, [$employees[0]->id => 'attended'], ['completed_at' => Carbon::parse('2026-07-28 18:00')]);
    a13Event($community, [$employees[1]->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-03 18:00')]);

    $august = a13Kpi()->activationRate($company, ReportPeriod::month(2026, 8));
    $july = a13Kpi()->activationRate($company, ReportPeriod::month(2026, 7));

    expect($august->numerator)->toBe(1)
        ->and($july->numerator)->toBe(1)
        ->and($august->rate())->toBe(25.0);

    Carbon::setTestNow();
});

test('the monthly period is anchored to Riyadh time, not UTC', function () {
    Carbon::setTestNow(Carbon::parse('2026-09-05 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    // 2026-08-31 22:00 بتوقيت الرياض = 2026-08-31 19:00 UTC — آخر يوم في
    // أغسطس محلياً. حساب الحدود على UTC وحده يُسقطها من أغسطس.
    a13Event($community, [$employee->id => 'attended'], [
        'completed_at' => Carbon::parse('2026-08-31 19:00', 'UTC'),
    ]);

    $august = ReportPeriod::month(2026, 8);

    expect($august->start->toIso8601String())->toBe('2026-07-31T21:00:00+00:00')
        ->and($august->end->toIso8601String())->toBe('2026-08-31T20:59:59+00:00')
        ->and(a13Kpi()->activationRate($company, $august)->numerator)->toBe(1)
        ->and(a13Kpi()->activationRate($company, ReportPeriod::month(2026, 9))->numerator)->toBe(0);

    Carbon::setTestNow();
});

test('attendance rate is attended over reserved seats on completed events', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employees = Employee::factory()->count(5)->create(['company_id' => $company->id]);

    // 4 مقاعد محجوزة: 3 حضروا وواحد غاب.
    a13Event($community, [
        $employees[0]->id => 'attended',
        $employees[1]->id => 'attended',
        $employees[2]->id => 'attended',
        $employees[3]->id => 'absent',
    ], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $metric = a13Kpi()->attendanceRate($company, ReportPeriod::month(2026, 8));

    expect($metric->numerator)->toBe(3)
        ->and($metric->denominator)->toBe(4)
        ->and($metric->rate())->toBe(75.0);

    Carbon::setTestNow();
});

test('cost per participation divides actual wallet spend by attendance count', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employees = Employee::factory()->count(3)->create(['company_id' => $company->id]);

    a13Event($community, [
        $employees[0]->id => 'attended',
        $employees[1]->id => 'attended',
        $employees[2]->id => 'attended',
    ], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $ledger = app(LedgerService::class);
    $wallet = Wallet::subFor($community);

    $ledger->credit($wallet, WalletTransactionType::TopUp, 100_000, 'a13:fund');
    // الاستقطاع الفعلي 45.00 ريال، وتخصيص 200.00 **ليس إنفاقاً** (نقل داخلي).
    $ledger->debit($wallet, WalletTransactionType::Capture, 4_500, 'a13:capture:1');
    $ledger->debit($wallet, WalletTransactionType::Allocation, 20_000, 'a13:allocation:1');

    $cost = a13Kpi()->costPerParticipation($company, ReportPeriod::month(2026, 8));

    expect($cost['spend']->halalas)->toBe(4_500)
        ->and($cost['attendance'])->toBe(3)
        // 4500 ÷ 3 = 1500 هللة = 15.00 ريال (قسمة صحيحة بلا تقريب لأعلى)
        ->and($cost['cost_per_participation_halalas'])->toBe(1_500)
        ->and($cost['cost_per_participation'])->toBe('15.00');

    Carbon::setTestNow();
});

test('company spend nets refunds against captures and never goes negative', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $ledger = app(LedgerService::class);
    $wallet = Wallet::subFor($community);

    $ledger->credit($wallet, WalletTransactionType::TopUp, 100_000, 'a13:fund');
    $ledger->debit($wallet, WalletTransactionType::Capture, 9_000, 'a13:capture:1');
    $ledger->credit($wallet, WalletTransactionType::Refund, 3_000, 'a13:refund:1');

    expect(a13Kpi()->companySpend($company, ReportPeriod::month(2026, 8))->halalas)->toBe(6_000);

    Carbon::setTestNow();
});

test('cancellation rate is events cancelled in the period over events created in it', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    // 4 فعاليات أُنشئت في أغسطس؛ اثنتان أُلغيتا فيه بسببين مختلفين.
    foreach (range(1, 4) as $i) {
        $event = a13Event($community, [], [
            'status' => 'open',
            'completed_at' => null,
            'starts_at' => Carbon::parse('2026-08-1'.$i.' 18:00'),
            'created_at' => Carbon::parse('2026-08-0'.$i.' 09:00'),
        ]);

        if ($i <= 2) {
            $event->forceFill([
                'status' => $i === 1
                    ? EventStatus::CancelledMinNotMet->value
                    : EventStatus::CancelledProvider->value,
            ])->save();

            EventStatusHistory::create([
                'event_id' => $event->id,
                'from_status' => 'open',
                'to_status' => $event->status,
                'created_at' => Carbon::parse('2026-08-1'.$i.' 10:00'),
            ]);
        }
    }

    // فعالية أُنشئت في يوليو ولا تدخل مقام أغسطس.
    a13Event($community, [], [
        'status' => 'open',
        'completed_at' => null,
        'starts_at' => Carbon::parse('2026-07-20 18:00'),
        'created_at' => Carbon::parse('2026-07-15 09:00'),
    ]);

    $period = ReportPeriod::month(2026, 8);
    $metric = a13Kpi()->cancellationRate($company, $period);
    $reasons = a13Kpi()->cancellationReasons($company, $period);

    expect($metric->numerator)->toBe(2)
        ->and($metric->denominator)->toBe(4)
        ->and($metric->rate())->toBe(50.0)
        ->and($reasons[EventStatus::CancelledMinNotMet->value])->toBe(1)
        ->and($reasons[EventStatus::CancelledProvider->value])->toBe(1)
        ->and($reasons[EventStatus::CancelledCompany->value])->toBe(0)
        ->and($reasons[EventStatus::CancelledPaymentFailed->value])->toBe(0);

    Carbon::setTestNow();
});

test('department participation attributes attendees to the department they were in AT EVENT TIME', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-25 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $sales = Department::create(['company_id' => $company->id, 'name' => 'المبيعات']);
    $engineering = Department::create(['company_id' => $company->id, 'name' => 'الهندسة']);

    $mover = Employee::factory()->create(['company_id' => $company->id, 'department_id' => $engineering->id]);
    $stayer = Employee::factory()->create(['company_id' => $company->id, 'department_id' => $engineering->id]);

    // «المُنتقِل» كان في المبيعات وقت الفعالية، ثم نُقل للهندسة بعدها.
    DepartmentHistory::query()->where('employee_id', $mover->id)->delete();
    DepartmentHistory::create([
        'company_id' => $company->id,
        'employee_id' => $mover->id,
        'department_id' => $sales->id,
        'started_at' => Carbon::parse('2026-01-01 00:00'),
        'ended_at' => Carbon::parse('2026-08-15 00:00'),
    ]);
    DepartmentHistory::create([
        'company_id' => $company->id,
        'employee_id' => $mover->id,
        'department_id' => $engineering->id,
        'started_at' => Carbon::parse('2026-08-15 00:00'),
        'ended_at' => null,
    ]);

    DepartmentHistory::query()->where('employee_id', $stayer->id)->delete();
    DepartmentHistory::create([
        'company_id' => $company->id,
        'employee_id' => $stayer->id,
        'department_id' => $engineering->id,
        'started_at' => Carbon::parse('2026-01-01 00:00'),
        'ended_at' => null,
    ]);

    a13Event($community, [
        $mover->id => 'attended',
        $stayer->id => 'attended',
    ], [
        'starts_at' => Carbon::parse('2026-08-10 18:00'),
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    $rows = collect(a13Kpi()->participationByDepartment($company, ReportPeriod::month(2026, 8)))
        ->keyBy('department_name');

    // البسط بالإسناد وقت الحدث: المُنتقِل يُحسب على المبيعات لا الهندسة.
    expect($rows['المبيعات']['attendees'])->toBe(1)
        ->and($rows['الهندسة']['attendees'])->toBe(1)
        // المقام بالإسناد عند نهاية الفترة: كلاهما في الهندسة يوم 31 أغسطس.
        ->and($rows['الهندسة']['employees'])->toBe(2)
        ->and($rows['المبيعات']['employees'])->toBe(0)
        ->and($rows['الهندسة']['rate'])->toBe(50.0);

    Carbon::setTestNow();
});

test('a community is active only with a completed event inside the 30-day window', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-30 12:00'));

    $company = Company::factory()->create();
    $active = Community::factory()->create(['company_id' => $company->id, 'name' => 'نشط']);
    $stale = Community::factory()->create(['company_id' => $company->id, 'name' => 'خامل']);
    $never = Community::factory()->create(['company_id' => $company->id, 'name' => 'بلا فعالية']);

    $employee = Employee::factory()->create(['company_id' => $company->id]);

    a13Event($active, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-20 18:00')]);
    // 45 يوماً — خارج النافذة.
    a13Event($stale, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-07-10 18:00')]);

    $activity = a13Kpi()->communityActivity($company, Carbon::parse('2026-08-30 12:00'));

    expect($activity['window_days'])->toBe(30)
        ->and(collect($activity['active'])->pluck('name')->all())->toBe(['نشط'])
        ->and(collect($activity['dormant'])->pluck('name')->sort()->values()->all())
        ->toBe(['بلا فعالية', 'خامل'])
        ->and($activity['metric']->numerator)->toBe(1)
        ->and($activity['metric']->denominator)->toBe(3)
        ->and($never->fresh()->status)->toBe(Community::STATUS_ACTIVE); // خمول التقرير ≠ عمود الحالة

    Carbon::setTestNow();
});

test('cancelled events are excluded from every completion-anchored metric', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    // فعالية ملغاة بلا `completed_at` — النص: «ويستثني الفعاليات الملغاة».
    a13Event($community, [$employee->id => 'attended'], [
        'status' => EventStatus::CancelledCompany->value,
        'completed_at' => null,
        'starts_at' => Carbon::parse('2026-08-08 18:00'),
        'total_halalas' => 90_000,
    ]);

    $period = ReportPeriod::month(2026, 8);
    $kpi = a13Kpi();

    expect($kpi->activationRate($company, $period)->numerator)->toBe(0)
        ->and($kpi->attendanceRate($company, $period)->denominator)->toBe(0)
        ->and($kpi->completedEventCount($company, $period))->toBe(0)
        ->and($kpi->gmv($company, $period)->halalas)->toBe(0);

    Carbon::setTestNow();
});

test('every metric is scoped to its own company', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $mine = Company::factory()->create();
    $other = Company::factory()->create();

    $myCommunity = Community::factory()->create(['company_id' => $mine->id]);
    $otherCommunity = Community::factory()->create(['company_id' => $other->id]);

    $myEmployee = Employee::factory()->create(['company_id' => $mine->id]);
    $otherEmployees = Employee::factory()->count(9)->create(['company_id' => $other->id]);

    a13Event($myCommunity, [$myEmployee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    foreach ($otherEmployees as $employee) {
        a13Event($otherCommunity, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-11 18:00')]);
    }

    $period = ReportPeriod::month(2026, 8);
    $snapshot = a13Kpi()->companySnapshot($mine, $period);

    expect($snapshot['activation_rate']['numerator'])->toBe(1)
        ->and($snapshot['activation_rate']['denominator'])->toBe(1)
        ->and($snapshot['completed_events'])->toBe(1)
        ->and(Event::withoutGlobalScopes()->count())->toBe(10); // الأخرى موجودة ولم تُحسب

    Carbon::setTestNow();
});

test('the previous period of a month is the preceding calendar month in Riyadh time', function () {
    $march = ReportPeriod::month(2026, 3);

    expect($march->previous()->key)->toBe('2026-02')
        ->and(ReportPeriod::month(2026, 1)->previous()->key)->toBe('2025-12')
        ->and(ReportPeriod::fromKey('2026-08')->label)->toBe('أغسطس 2026');
});

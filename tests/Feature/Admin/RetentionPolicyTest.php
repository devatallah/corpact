<?php

use App\Enums\FileCategory;
use App\Models\AuditLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\StoredFile;
use App\Models\WalletTransaction;
use App\Services\Files\FileStorageService;
use App\Services\Retention\RetentionService;
use App\Support\Audit\AuditAction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * H §19 «الخصوصية والاحتفاظ»:
 *
 *   الهوية والاتصال: مدة العلاقة + 12 شهراً · المالية: 10 سنوات ·
 *   الحضور والنتائج: 24 شهراً ثم تجميع إحصائي وإخفاء هوية · التدقيق: 24 شهراً
 *   (المالي 10 سنوات).
 *
 * القاعدة الحاكمة: **«الحذف يتم بإخفاء الهوية لا بحذف السجل المالي»** — كل
 * اختبار هنا يثبت أن الصفوف المالية باقية بعددها ومبالغها.
 */
test('the retention windows match the spec table', function () {
    expect(RetentionService::IDENTITY_MONTHS)->toBe(12)
        ->and(RetentionService::ATTENDANCE_MONTHS)->toBe(24)
        ->and(RetentionService::AUDIT_MONTHS)->toBe(24)
        ->and(RetentionService::FINANCIAL_YEARS)->toBe(10);
});

test('a departed employee past 12 months is anonymized, never deleted', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'name' => 'سعد المطيري',
        'email' => 'saad@example.com',
        'phone' => '966512345678',
    ]);

    CompanyMembership::query()
        ->where('employee_id', $employee->id)
        ->update(['status' => 'inactive', 'left_at' => Carbon::now()->subMonths(18)]);

    $anonymized = app(RetentionService::class)->anonymizeDepartedIdentities();

    $employee = $employee->fresh();

    expect($anonymized)->toBe(1)
        // الصف باقٍ بمعرّفه — لم يُحذف.
        ->and($employee)->not->toBeNull()
        ->and($employee->anonymized_at)->not->toBeNull()
        ->and($employee->name)->not->toBe('سعد المطيري')
        ->and($employee->email)->not->toBe('saad@example.com')
        ->and($employee->phone)->toBeNull()
        ->and($employee->status)->toBe('inactive');
});

test('anonymization is recorded in the audit log', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    app(RetentionService::class)->anonymizeEmployee($employee);

    $log = AuditLog::query()->where('action', AuditAction::ACCOUNT_ANONYMIZED)->latest('id')->first();

    expect($log)->not->toBeNull()
        ->and($log->entity_id)->toBe($employee->id)
        ->and($log->company_id)->toBe($company->id)
        // The audit row itself must not re-leak what it just scrubbed.
        ->and($log->before_values['name'])->toBe('(محجوب)');
});

test('an employee still active in another company is left alone', function () {
    $companyA = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $companyA->id]);

    // Left one company 18 months ago…
    CompanyMembership::query()
        ->where('employee_id', $employee->id)
        ->update(['status' => 'inactive', 'left_at' => Carbon::now()->subMonths(18)]);

    // …but is still active somewhere (a second membership row).
    CompanyMembership::create([
        'user_id' => $employee->user_id,
        'company_id' => Company::factory()->create()->id,
        'employee_id' => $employee->id,
        'status' => 'active',
        'joined_at' => Carbon::now()->subYear(),
    ]);

    expect(app(RetentionService::class)->anonymizeDepartedIdentities())->toBe(0)
        ->and($employee->fresh()->anonymized_at)->toBeNull();
});

test('a recent departure is inside the window and untouched', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    CompanyMembership::query()
        ->where('employee_id', $employee->id)
        ->update(['status' => 'inactive', 'left_at' => Carbon::now()->subMonths(3)]);

    expect(app(RetentionService::class)->anonymizeDepartedIdentities())->toBe(0)
        ->and($employee->fresh()->anonymized_at)->toBeNull();
});

test('anonymization preserves every financial row, count and amount', function () {
    ['event' => $event, 'company' => $company, 'employees' => $employees] = a10Event([
        'total' => 300.0,
        'min' => 2,
        'joiners' => 2,
        'wallet' => 100_000,
    ]);

    $employee = $employees[0];

    $transactionsBefore = WalletTransaction::query()->count();
    $sumBefore = (int) WalletTransaction::query()->sum('amount_halalas');
    $participantsBefore = EventParticipant::query()->count();

    app(RetentionService::class)->anonymizeEmployee($employee->fresh());

    expect(WalletTransaction::query()->count())->toBe($transactionsBefore)
        ->and((int) WalletTransaction::query()->sum('amount_halalas'))->toBe($sumBefore)
        // مشاركة الموظف باقية بمفتاحها — التاريخ لم يُمس.
        ->and(EventParticipant::query()->count())->toBe($participantsBefore)
        ->and(EventParticipant::query()->where('employee_id', $employee->id)->exists())->toBeTrue()
        ->and($event->fresh())->not->toBeNull()
        ->and($company->fresh())->not->toBeNull();
});

test('attendance beyond 24 months is rolled up into a statistical aggregate', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'event_date' => Carbon::now()->subMonths(30)->toDateString(),
    ]);
    $event->forceFill(['status' => 'completed'])->save();

    foreach (range(1, 3) as $i) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => 'reserved',
            'payment_status' => 'paid',
            'attendance_status' => $i === 3 ? 'absent' : 'attended',
            'joined_at' => Carbon::now()->subMonths(31),
        ]);
    }

    $written = app(RetentionService::class)->aggregateAttendance();

    $aggregate = DB::table('attendance_aggregates')->where('company_id', $company->id)->first();

    expect($written)->toBe(1)
        ->and($aggregate)->not->toBeNull()
        ->and((int) $aggregate->events_count)->toBe(1)
        ->and((int) $aggregate->attended_count)->toBe(2)
        ->and((int) $aggregate->absent_count)->toBe(1)
        ->and((int) $aggregate->distinct_participants)->toBe(3)
        ->and($aggregate->anonymized_at)->not->toBeNull()
        // الصفوف نفسها باقية — التجميع لا يحذف.
        ->and(EventParticipant::query()->where('event_id', $event->id)->count())->toBe(3);
});

test('attendance inside the 24-month window is not aggregated', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create([
        'company_id' => $company->id,
        'event_date' => Carbon::now()->subMonths(6)->toDateString(),
    ]);
    $event->forceFill(['status' => 'completed'])->save();

    EventParticipant::create([
        'event_id' => $event->id,
        'employee_id' => Employee::factory()->create(['company_id' => $company->id])->id,
        'seat_status' => 'reserved',
        'payment_status' => 'paid',
        'attendance_status' => 'attended',
        'joined_at' => Carbon::now()->subMonths(7),
    ]);

    expect(app(RetentionService::class)->aggregateAttendance())->toBe(0)
        ->and(DB::table('attendance_aggregates')->count())->toBe(0);
});

test('the audit purge is reported and never executed — the log stays append-only', function () {
    $company = Company::factory()->create();

    // Backdated rows: `created_at` is not fillable on an append-only model,
    // so they are seeded at the table level.
    $oldId = DB::table('audit_logs')->insertGetId([
        'action' => AuditAction::EVENT_STATE_FORCED,
        'scope_type' => 'platform',
        'is_financial' => false,
        'created_at' => Carbon::now()->subMonths(30),
    ]);
    $oldFinancialId = DB::table('audit_logs')->insertGetId([
        'action' => AuditAction::TOPUP_APPROVED,
        'scope_type' => 'platform',
        'company_id' => $company->id,
        'is_financial' => true,
        'created_at' => Carbon::now()->subMonths(30),
    ]);

    $service = app(RetentionService::class);

    // The non-financial row is *eligible*…
    expect($service->auditPurgeCandidates())->toBe(1);

    $service->apply();

    // …but nothing was removed: H §19 «للكتابة فقط — لا تعديل ولا حذف» wins.
    expect(AuditLog::query()->whereKey($oldId)->exists())->toBeTrue()
        ->and(AuditLog::query()->whereKey($oldFinancialId)->exists())->toBeTrue();
});

test('contracts and financial files are counted as protected and never purged', function () {
    Storage::fake();

    $company = Company::factory()->create();
    app(FileStorageService::class)
        ->store(a15FakePdf(), FileCategory::Contract, $company);

    $report = app(RetentionService::class)->apply();

    expect($report['financial_files_protected'])->toBe(1)
        ->and(StoredFile::query()->count())->toBe(1);
});

test('the scheduled command is safe by default and reports what it did', function () {
    $this->artisan('app:apply-retention --dry-run')
        ->expectsOutputToContain('محاكاة سياسة الاحتفاظ')
        ->assertSuccessful();

    $this->artisan('app:apply-retention')
        ->expectsOutputToContain('نُفِّذت سياسة الاحتفاظ')
        ->assertSuccessful();

    expect(AuditLog::query()->where('action', AuditAction::RETENTION_APPLIED)->exists())->toBeTrue();
});

test('a dry run writes nothing at all', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    CompanyMembership::query()
        ->where('employee_id', $employee->id)
        ->update(['status' => 'inactive', 'left_at' => Carbon::now()->subMonths(18)]);

    $report = app(RetentionService::class)->apply(dryRun: true);

    expect($report['identities_anonymized'])->toBe(1)
        ->and($employee->fresh()->anonymized_at)->toBeNull()
        ->and(AuditLog::query()->where('action', AuditAction::RETENTION_APPLIED)->count())->toBe(0);
});

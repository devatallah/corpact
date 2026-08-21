<?php

use App\Models\AuditLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportFormat;
use App\Services\Reporting\Export\ExportService;
use App\Support\Audit\AuditAction;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpKernel\Exception\HttpException;

// H §15 — التصدير: «كل تصدير يمر بنفس فحص الصلاحيات ونطاق الشركة، ويُسجَّل في
// سجل التدقيق (من، ماذا، متى، كم سجلاً)» · «أرقام جوال الموظفين لا تظهر في أي
// تصدير إلا لمسؤول الحساب» · «القائد يصدّر بيانات مجتمعه بلا أي بيانات مالية».

function a13ExportFixture(string $label = 'أ'): array
{
    $company = Company::factory()->create(['name' => "شركة الاختبار {$label}"]);
    $community = Community::factory()->create(['company_id' => $company->id, 'name' => "مجتمع التنس {$label}"]);

    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'name' => "سعد الحربي {$label}",
        'phone' => '0501234567',
    ]);

    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()->subMonth()]);

    a13Event($community, [$employee->id => 'attended'], [
        'completed_at' => Carbon::parse('2026-08-10 18:00'),
        'starts_at' => Carbon::parse('2026-08-10 16:00'),
        'total_halalas' => 90_000,
    ]);

    return ['company' => $company, 'community' => $community, 'employee' => $employee];
}

test('employee phone numbers appear only in the account manager export', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $company, 'community' => $community] = a13ExportFixture();
    $exports = app(ExportService::class);

    $forManager = $exports->prepare(
        'employees_activation',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    )['dataset'];

    expect($forManager->columnKeys())->toContain('phone')
        ->and($forManager->rows[0]['phone'])->toBe('0501234567');

    // القائد والمنسّق وأدمن المنصة — المنع مطلق، ولا استثناء للأدمن.
    foreach ([ExportAudience::CommunityLeader, ExportAudience::Coordinator, ExportAudience::PlatformAdmin] as $audience) {
        $dataset = $exports->prepare(
            'employees_activation',
            a13Context($company, $audience, $audience === ExportAudience::CommunityLeader ? $community : null),
            ExportFormat::Xlsx,
        )['dataset'];

        expect($dataset->columnKeys())->not->toContain('phone')
            ->and(array_keys($dataset->rows[0]))->not->toContain('phone');
    }

    Carbon::setTestNow();
});

test('the community leader export carries no financial column at all', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $company, 'community' => $community] = a13ExportFixture();
    $exports = app(ExportService::class);

    $leaderDataset = $exports->prepare(
        'events_results',
        a13Context($company, ExportAudience::CommunityLeader, $community),
        ExportFormat::Xlsx,
    )['dataset'];

    $managerDataset = $exports->prepare(
        'events_results',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    )['dataset'];

    // مسؤول الحساب يرى المال، والقائد لا يرى منه شيئاً — لا عموداً ولا مفتاحاً.
    expect($managerDataset->columnKeys())->toContain('total_amount', 'subsidy', 'employee_share')
        ->and($leaderDataset->columnKeys())->not->toContain('total_amount')
        ->and($leaderDataset->columnKeys())->not->toContain('subsidy')
        ->and($leaderDataset->columnKeys())->not->toContain('employee_share')
        // ويبقى الجدول نافعاً له: الحضور والغياب والسعة.
        ->and($leaderDataset->columnKeys())->toContain('attended', 'absent', 'capacity');

    foreach ($leaderDataset->rows as $row) {
        expect(array_keys($row))->not->toContain('total_amount')
            ->and(array_keys($row))->not->toContain('subsidy');
    }

    // والأثر في الملف نفسه: النص «90000» لا يظهر في XLSX القائد.
    $leaderXlsx = $exports->download(
        'events_results',
        a13Context($company, ExportAudience::CommunityLeader, $community),
        ExportFormat::Xlsx,
    );

    expect($leaderXlsx->getContent())->not->toContain('900.00');

    Carbon::setTestNow();
});

test('wallet transactions and invoices are not offered to the community leader at all', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $company, 'community' => $community] = a13ExportFixture();
    $exports = app(ExportService::class);

    $leaderKeys = collect($exports->availableFor(ExportAudience::CommunityLeader))->pluck('key')->all();
    $managerKeys = collect($exports->availableFor(ExportAudience::AccountManager))->pluck('key')->all();

    expect($leaderKeys)->toBe(['employees_activation', 'events_results'])
        ->and($managerKeys)->toBe(['employees_activation', 'events_results', 'wallet_transactions', 'invoices']);

    // ومحاولة الوصول مباشرة تُرفض — القائمة ليست تجميلاً في الواجهة.
    expect(fn () => $exports->prepare(
        'wallet_transactions',
        a13Context($company, ExportAudience::CommunityLeader, $community),
        ExportFormat::Xlsx,
    ))->toThrow(HttpException::class);

    Carbon::setTestNow();
});

test('every export writes an audit row with who, what, when and the row count', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $company] = a13ExportFixture();

    app(ExportService::class)->download(
        'employees_activation',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    );

    $audit = AuditLog::query()->where('action', AuditAction::REPORT_EXPORTED)->latest('id')->first();

    expect($audit)->not->toBeNull()
        ->and($audit->company_id)->toBe($company->id)
        ->and($audit->after_values['report'])->toBe('employees_activation')
        ->and($audit->after_values['format'])->toBe('xlsx')
        ->and($audit->after_values['row_count'])->toBe(1)
        ->and($audit->after_values['period'])->toBe('2026-08')
        ->and($audit->after_values['audience'])->toBe('account_manager')
        ->and($audit->created_at)->not->toBeNull();

    Carbon::setTestNow();
});

test('the PDF export is audited too — no format escapes the log', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $company] = a13ExportFixture();

    $before = AuditLog::query()->where('action', AuditAction::REPORT_EXPORTED)->count();

    app(ExportService::class)->download(
        'events_results',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Pdf,
    );

    $audit = AuditLog::query()->where('action', AuditAction::REPORT_EXPORTED)->latest('id')->first();

    expect(AuditLog::query()->where('action', AuditAction::REPORT_EXPORTED)->count())->toBe($before + 1)
        ->and($audit->after_values['format'])->toBe('pdf');

    Carbon::setTestNow();
});

test('an export never reaches beyond its own company scope', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $mine] = a13ExportFixture('أ');
    ['company' => $theirs, 'employee' => $theirEmployee] = a13ExportFixture('ب');

    $dataset = app(ExportService::class)->prepare(
        'employees_activation',
        a13Context($mine, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    )['dataset'];

    expect($dataset->rowCount())->toBe(1)
        ->and(collect($dataset->rows)->pluck('name')->all())->not->toContain($theirEmployee->name)
        ->and($theirs->id)->not->toBe($mine->id);

    Carbon::setTestNow();
});

test('the leader export is narrowed to the members of their own community', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    ['company' => $company, 'community' => $community] = a13ExportFixture();

    // موظف في الشركة لكنه ليس عضواً في مجتمع القائد.
    $outsider = Employee::factory()->create(['company_id' => $company->id, 'name' => 'خارج المجتمع']);

    $leaderDataset = app(ExportService::class)->prepare(
        'employees_activation',
        a13Context($company, ExportAudience::CommunityLeader, $community),
        ExportFormat::Xlsx,
    )['dataset'];

    $managerDataset = app(ExportService::class)->prepare(
        'employees_activation',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    )['dataset'];

    expect(collect($leaderDataset->rows)->pluck('name')->all())->not->toContain($outsider->name)
        ->and(collect($managerDataset->rows)->pluck('name')->all())->toContain($outsider->name);

    Carbon::setTestNow();
});

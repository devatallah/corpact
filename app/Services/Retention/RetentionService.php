<?php

namespace App\Services\Retention;

use App\Models\AuditLog;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\StoredFile;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * A15 — H §19 «الخصوصية والاحتفاظ», implemented as a scheduled-but-safe
 * policy:
 *
 * | بيانات الهوية والاتصال            | مدة العلاقة + 12 شهراً |
 * | السجلات المالية والفواتير والتسويات | 10 سنوات              |
 * | سجلات الحضور والنتائج             | 24 شهراً ثم تجميع إحصائي وإخفاء هوية |
 * | ملفات العقود                      | مدة العقد + 10 سنوات   |
 * | سجل التدقيق                       | 24 شهراً (المالي 10 سنوات) |
 *
 * Two rules govern every path here:
 *
 * 1. «الحذف يتم بإخفاء الهوية لا بحذف السجل المالي» — nothing financial is
 *    ever removed. Identity is scrubbed in place; the rows that reference the
 *    person keep their keys, counts and amounts.
 * 2. The audit log is append-only (H §19). Its 24-month line therefore
 *    **reports** what is eligible instead of deleting it — see
 *    {@see self::auditPurgeCandidates()} and the divergences note.
 */
class RetentionService
{
    public const IDENTITY_MONTHS = 12;      // after the relationship ends

    public const ATTENDANCE_MONTHS = 24;

    public const AUDIT_MONTHS = 24;

    public const FINANCIAL_YEARS = 10;

    /**
     * Run every non-destructive-to-financial-data pass.
     *
     * @return array<string, int>
     */
    public function apply(bool $dryRun = false): array
    {
        $report = [
            'aggregates_written' => 0,
            'identities_anonymized' => 0,
            'audit_purge_candidates' => $this->auditPurgeCandidates(),
            'financial_files_protected' => $this->protectedFileCount(),
        ];

        $report['aggregates_written'] = $this->aggregateAttendance(dryRun: $dryRun);
        $report['identities_anonymized'] = $this->anonymizeDepartedIdentities(dryRun: $dryRun);

        if (! $dryRun) {
            AuditLogService::record(
                action: AuditAction::RETENTION_APPLIED,
                after: $report,
                reason: 'تنفيذ جدول الاحتفاظ المجدول (H §19)',
            );
        }

        return $report;
    }

    /**
     * «سجلات الحضور والنتائج: 24 شهراً ثم **تجميع إحصائي** وإخفاء هوية».
     *
     * Builds the statistical roll-up that survives the identities. The rows
     * themselves are never deleted — the billing history counts on them —
     * and their identity dissolves through {@see self::anonymizeEmployee()}.
     */
    public function aggregateAttendance(?Carbon $before = null, bool $dryRun = false): int
    {
        $before ??= now()->subMonths(self::ATTENDANCE_MONTHS);

        $rows = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.status', 'completed')
            ->where('events.event_date', '<', $before->toDateString())
            ->selectRaw('events.company_id as company_id')
            ->selectRaw('events.community_id as community_id')
            ->selectRaw('substr(events.event_date, 1, 7) as period')
            ->selectRaw('count(distinct events.id) as events_count')
            ->selectRaw("sum(case when event_participants.attendance_status = 'attended' then 1 else 0 end) as attended_count")
            ->selectRaw("sum(case when event_participants.attendance_status = 'absent' then 1 else 0 end) as absent_count")
            ->selectRaw('count(distinct event_participants.employee_id) as distinct_participants')
            ->groupBy('events.company_id', 'events.community_id', 'period')
            ->get();

        if ($dryRun) {
            return $rows->count();
        }

        $written = 0;

        foreach ($rows as $row) {
            $resultsCount = DB::table('competition_results')
                ->where('company_id', $row->company_id)
                ->where('community_id', $row->community_id)
                ->whereRaw('substr(recorded_at, 1, 7) = ?', [$row->period])
                ->count();

            DB::table('attendance_aggregates')->updateOrInsert(
                [
                    'company_id' => $row->company_id,
                    'community_id' => $row->community_id,
                    'period' => $row->period,
                ],
                [
                    'events_count' => (int) $row->events_count,
                    'attended_count' => (int) $row->attended_count,
                    'absent_count' => (int) $row->absent_count,
                    'distinct_participants' => (int) $row->distinct_participants,
                    'results_count' => $resultsCount,
                    'anonymized_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );

            $written++;
        }

        return $written;
    }

    /**
     * «بيانات الهوية والاتصال: مدة العلاقة التعاقدية + 12 شهراً».
     *
     * An employee whose membership ended more than 12 months ago, and who
     * holds no other active membership, is de-identified. Every attendance,
     * result, participation and financial row keeps its foreign key and its
     * amounts — only the person behind it stops being nameable.
     */
    public function anonymizeDepartedIdentities(?Carbon $before = null, bool $dryRun = false): int
    {
        $before ??= now()->subMonths(self::IDENTITY_MONTHS);

        $candidates = Employee::query()
            ->withoutGlobalScopes()
            ->whereNull('anonymized_at')
            ->whereIn('id', function ($query) use ($before) {
                $query->select('employee_id')
                    ->from('company_memberships')
                    ->whereNotNull('employee_id')
                    ->whereNotNull('left_at')
                    ->where('left_at', '<', $before);
            })
            ->whereNotIn('id', function ($query) {
                $query->select('employee_id')
                    ->from('company_memberships')
                    ->whereNotNull('employee_id')
                    ->where('status', 'active');
            })
            ->get();

        if ($dryRun) {
            return $candidates->count();
        }

        $count = 0;

        foreach ($candidates as $employee) {
            $this->anonymizeEmployee($employee);
            $count++;
        }

        return $count;
    }

    /**
     * Scrub the personal identifiers of one employee in place.
     *
     * Deliberately **not** a delete: H §19 «الحذف يتم بإخفاء الهوية لا بحذف
     * السجل المالي». The row, its id and every reference to it survive.
     */
    public function anonymizeEmployee(Employee $employee): Employee
    {
        $before = [
            'name' => $employee->name,
            'email' => $employee->email,
            'phone' => $employee->phone,
        ];

        $token = 'anon-'.$employee->id;

        $employee->forceFill([
            'name' => 'موظف مُخفى الهوية #'.$employee->id,
            'email' => $token.'@anonymized.invalid',
            'phone' => null,
            'avatar' => null,
            'employee_number' => null,
            'status' => 'inactive',
            'anonymized_at' => now(),
        ])->saveQuietly();

        // The global account is scrubbed only when nothing else still needs
        // it (another company, a provider or a platform role).
        $user = $employee->user;

        if ($user !== null
            && ! CompanyMembership::query()->where('user_id', $user->id)->where('status', 'active')->exists()
            && $user->roleAssignments()->count() <= 1) {
            $user->forceFill([
                'name' => 'مستخدم مُخفى الهوية #'.$user->id,
                'email' => 'anon-user-'.$user->id.'@anonymized.invalid',
                'phone' => null,
                'avatar' => null,
                'status' => 'inactive',
            ])->saveQuietly();
        }

        AuditLogService::record(
            action: AuditAction::ACCOUNT_ANONYMIZED,
            entity: $employee,
            before: ['name' => '(محجوب)', 'had_email' => $before['email'] !== null, 'had_phone' => $before['phone'] !== null],
            after: ['anonymized_at' => now()->toIso8601String()],
            reason: 'انقضاء مدة الاحتفاظ ببيانات الهوية (العلاقة + 12 شهراً — H §19)',
            companyId: $employee->company_id,
        );

        return $employee->refresh();
    }

    /**
     * How many audit rows are past 24 months and outside the financial
     * 10-year window. **Reported, never deleted**: the table is append-only
     * at the model and the trigger, and H §19's «لا تعديل ولا حذف» is the
     * stronger rule. Archiving is an owner/DBA decision — see divergences.
     */
    public function auditPurgeCandidates(?Carbon $now = null): int
    {
        $now ??= now();

        return AuditLog::query()
            ->where('is_financial', false)
            ->where('created_at', '<', $now->copy()->subMonths(self::AUDIT_MONTHS))
            ->count();
    }

    /**
     * Contract + financial files: «10 سنوات» and «لا حذف نهائي». Counted so
     * the run reports what it is deliberately leaving alone.
     */
    public function protectedFileCount(): int
    {
        return StoredFile::query()
            ->whereIn('category', ['contract', 'bank_receipt'])
            ->count();
    }

    /**
     * Attendance rows currently older than the 24-month window — the input
     * side of {@see self::aggregateAttendance()}.
     */
    public function attendanceRowsBeyondWindow(?Carbon $before = null): int
    {
        $before ??= now()->subMonths(self::ATTENDANCE_MONTHS);

        return EventParticipant::query()
            ->whereHas('event', fn ($query) => $query
                ->withoutGlobalScopes()
                ->where('status', 'completed')
                ->where('event_date', '<', $before->toDateString()))
            ->count();
    }
}

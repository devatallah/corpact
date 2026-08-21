<?php

namespace App\Services\Reporting\Export\Definitions;

use App\Models\CommunityMember;
use App\Models\Employee;
use App\Services\Attendance\ActivationService;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportColumn;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportDataset;
use App\Services\Reporting\Export\ExportDefinition;
use App\Services\Reporting\Export\ExportSensitivity;
use App\Services\Reporting\KpiDictionary;
use Illuminate\Support\Facades\DB;

/**
 * H §15 — «قائمة الموظفين والتفعيل».
 *
 * عمود الجوال مصنّف {@see ExportSensitivity::Phone}
 * فيسقط تلقائياً عن كل جمهور غير مسؤول الحساب، وعمود الإدارة **منسوب لنهاية
 * الفترة** بالمنطق نفسه الذي تستعمله المشاركة حسب الإدارة كي يتطابق الملف مع
 * الشاشة. لا عمود مالياً في هذا المُصدِّر أصلاً.
 */
class EmployeeActivationExport implements ExportDefinition
{
    public function __construct(
        private ActivationService $activation,
        private KpiDictionary $kpi,
    ) {}

    public function key(): string
    {
        return 'employees_activation';
    }

    public function title(): string
    {
        return 'الموظفون والتفعيل';
    }

    public function audiences(): array
    {
        return [
            ExportAudience::AccountManager,
            ExportAudience::CommunityLeader,
            ExportAudience::Coordinator,
            ExportAudience::PlatformAdmin,
        ];
    }

    public function build(ExportContext $context): ExportDataset
    {
        $employees = Employee::withoutGlobalScopes()
            ->where('company_id', $context->companyId())
            ->when($context->communityId() !== null, function ($query) use ($context) {
                // تصدير القائد: أعضاء مجتمعه النشطون وحدهم.
                $query->whereIn('id', CommunityMember::query()
                    ->where('community_id', $context->communityId())
                    ->where('status', CommunityMember::STATUS_ACTIVE)
                    ->select('employee_id'));
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'employee_number', 'status']);

        $activatedIds = $this->activation
            ->activatedEmployeeIds($context->companyId(), $context->period->start, $context->period->end)
            ->flip();

        $attendedCounts = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $context->companyId())
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$context->period->start, $context->period->end])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', 'attended')
            ->groupBy('event_participants.employee_id')
            ->selectRaw('event_participants.employee_id, COUNT(*) as total')
            ->pluck('total', 'employee_id');

        $absenceCounts = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $context->companyId())
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$context->period->start, $context->period->end])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', 'absent')
            ->groupBy('event_participants.employee_id')
            ->selectRaw('event_participants.employee_id, COUNT(*) as total')
            ->pluck('total', 'employee_id');

        $departments = $this->kpi->departmentNamesAt(
            $context->company,
            $context->period->end,
            $employees->pluck('id')->map(fn ($id) => (int) $id)->all(),
        );

        $rows = [];

        foreach ($employees as $employee) {
            $rows[] = [
                'name' => (string) $employee->name,
                'employee_number' => (string) ($employee->employee_number ?? ''),
                'email' => (string) $employee->email,
                'phone' => (string) ($employee->phone ?? ''),
                'department' => $departments[(int) $employee->id] ?? 'بلا إدارة',
                'status' => $this->statusLabel((string) $employee->status),
                'activated' => $activatedIds->has((int) $employee->id) ? 'نعم' : 'لا',
                'attended_events' => (int) ($attendedCounts[$employee->id] ?? 0),
                'absences' => (int) ($absenceCounts[$employee->id] ?? 0),
            ];
        }

        return new ExportDataset(
            key: $this->key(),
            title: $this->title(),
            columns: [
                ExportColumn::plain('name', 'الاسم'),
                ExportColumn::plain('employee_number', 'الرقم الوظيفي'),
                ExportColumn::plain('email', 'البريد'),
                ExportColumn::phone('phone', 'الجوال'),
                ExportColumn::plain('department', 'الإدارة (نهاية الفترة)'),
                ExportColumn::plain('status', 'حالة الحساب'),
                ExportColumn::plain('activated', 'مفعّل في الدورة'),
                ExportColumn::plain('attended_events', 'فعاليات حضرها', numeric: true),
                ExportColumn::plain('absences', 'مرات الغياب', numeric: true),
            ],
            rows: $rows,
        );
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'active' => 'نشط',
            'inactive' => 'معطّل',
            'pending_verification' => 'بانتظار التحقق',
            default => $status,
        };
    }
}

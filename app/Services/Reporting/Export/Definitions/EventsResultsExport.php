<?php

namespace App\Services\Reporting\Export\Definitions;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportColumn;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportDataset;
use App\Services\Reporting\Export\ExportDefinition;
use App\Services\Reporting\Export\ExportSensitivity;
use App\Services\Reporting\ReportPeriod;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

/**
 * H §15 — «الفعاليات ونتائجها».
 *
 * أعمدة المال هنا مصنّفة {@see ExportSensitivity::Financial}
 * فتسقط كلها عن تصدير القائد («بلا أي بيانات مالية») بينما يبقى الجدول نافعاً
 * له: الحضور والغياب والسعة والمزوّد والحالة.
 *
 * النطاق الزمني `starts_at` داخل الفترة (لا `completed_at`) كي تظهر الملغاة
 * والمنتهية أيضاً — وهي بالضبط ما يريد قارئ التقرير تفسيره.
 */
class EventsResultsExport implements ExportDefinition
{
    public function key(): string
    {
        return 'events_results';
    }

    public function title(): string
    {
        return 'الفعاليات ونتائجها';
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
        $events = Event::withoutGlobalScopes()
            ->where('company_id', $context->companyId())
            ->when($context->communityId() !== null, fn ($q) => $q->where('community_id', $context->communityId()))
            ->whereBetween('starts_at', [$context->period->start, $context->period->end])
            ->with(['community:id,name', 'partner:id,name', 'category:id,name'])
            ->orderBy('starts_at')
            ->get();

        $seats = DB::table('event_participants')
            ->whereIn('event_id', $events->pluck('id'))
            ->groupBy('event_id')
            ->selectRaw('event_id')
            ->selectRaw("SUM(CASE WHEN seat_status = 'reserved' THEN 1 ELSE 0 END) as reserved")
            ->selectRaw("SUM(CASE WHEN seat_status = 'waitlisted' THEN 1 ELSE 0 END) as waitlisted")
            ->selectRaw("SUM(CASE WHEN attendance_status = 'attended' THEN 1 ELSE 0 END) as attended")
            ->selectRaw("SUM(CASE WHEN attendance_status = 'absent' THEN 1 ELSE 0 END) as absent")
            ->get()
            ->keyBy('event_id');

        $results = DB::table('competition_results')
            ->whereIn('event_id', $events->pluck('id'))
            ->groupBy('event_id')
            ->selectRaw('event_id, COUNT(*) as total')
            ->pluck('total', 'event_id');

        $rows = [];

        foreach ($events as $event) {
            $counts = $seats[$event->id] ?? null;
            $reserved = (int) ($counts->reserved ?? 0);
            $attended = (int) ($counts->attended ?? 0);

            $rows[] = [
                'id' => (int) $event->id,
                'title' => (string) $event->title,
                'community' => (string) ($event->community->name ?? ''),
                'category' => (string) ($event->category->name ?? ''),
                'starts_at' => $event->starts_at?->timezone(ReportPeriod::TIMEZONE)->format('Y-m-d H:i') ?? '',
                'status' => EventStatus::tryFrom((string) $event->status)?->label() ?? (string) $event->status,
                'provider' => (string) ($event->partner->name ?? ''),
                'capacity' => (int) $event->capacity,
                'min_participants' => (int) $event->min_participants,
                'reserved' => $reserved,
                'waitlisted' => (int) ($counts->waitlisted ?? 0),
                'attended' => $attended,
                'absent' => (int) ($counts->absent ?? 0),
                'attendance_rate' => $reserved === 0 ? '' : round(($attended / $reserved) * 100, 1),
                'results_entered' => (int) ($results[$event->id] ?? 0),
                'total_amount' => Money::format((int) $event->total_amount_halalas),
                'subsidy' => Money::format((int) ($event->subsidy_halalas ?? 0)),
                'employee_share' => Money::format((int) ($event->final_share_halalas ?? $event->max_share_halalas ?? 0)),
            ];
        }

        return new ExportDataset(
            key: $this->key(),
            title: $this->title(),
            columns: [
                ExportColumn::plain('id', 'الرقم', numeric: true),
                ExportColumn::plain('title', 'العنوان'),
                ExportColumn::plain('community', 'المجتمع'),
                ExportColumn::plain('category', 'الفئة'),
                ExportColumn::plain('starts_at', 'الموعد (الرياض)'),
                ExportColumn::plain('status', 'الحالة'),
                ExportColumn::plain('provider', 'المزوّد'),
                ExportColumn::plain('capacity', 'السعة', numeric: true),
                ExportColumn::plain('min_participants', 'الحد الأدنى', numeric: true),
                ExportColumn::plain('reserved', 'مقاعد محجوزة', numeric: true),
                ExportColumn::plain('waitlisted', 'قائمة الانتظار', numeric: true),
                ExportColumn::plain('attended', 'حضروا', numeric: true),
                ExportColumn::plain('absent', 'غابوا', numeric: true),
                ExportColumn::plain('attendance_rate', 'معدل الحضور %', numeric: true),
                ExportColumn::plain('results_entered', 'نتائج مسجّلة', numeric: true),
                ExportColumn::financial('total_amount', 'القيمة الإجمالية (ريال)'),
                ExportColumn::financial('subsidy', 'الدعم (ريال)'),
                ExportColumn::financial('employee_share', 'حصة الموظف (ريال)'),
            ],
            rows: $rows,
        );
    }
}

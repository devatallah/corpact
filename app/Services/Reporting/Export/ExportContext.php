<?php

namespace App\Services\Reporting\Export;

use App\Models\Community;
use App\Models\Company;
use App\Services\Reporting\ReportPeriod;

/**
 * نطاق تصدير واحد: **الشركة إلزامية دائماً** (لا تصدير بلا نطاق شركة — H §15
 * «مسؤول الحساب يصدّر في نطاق شركته فقط»)، والمجتمع يضيّق النطاق أكثر لتصدير
 * القائد.
 */
final class ExportContext
{
    public function __construct(
        public readonly Company $company,
        public readonly ExportAudience $audience,
        public readonly ReportPeriod $period,
        public readonly ?Community $community = null,
    ) {}

    public function companyId(): int
    {
        return (int) $this->company->id;
    }

    public function communityId(): ?int
    {
        return $this->community === null ? null : (int) $this->community->id;
    }

    /**
     * @return array<string, string>
     */
    public function metaHeader(string $exportTitle, ?string $actorName): array
    {
        $meta = [
            'التقرير' => $exportTitle,
            'الشركة' => (string) $this->company->name,
            'الفترة' => $this->period->label,
            'صدّره' => $actorName ?? 'غير معروف',
            'بصفة' => $this->audience->label(),
            'وقت التصدير' => now()->timezone(ReportPeriod::TIMEZONE)->format('Y-m-d H:i').' (الرياض)',
            'period_key' => $this->period->key,
        ];

        if ($this->community !== null) {
            $meta = ['المجتمع' => (string) $this->community->name] + $meta;
        }

        return $meta;
    }
}

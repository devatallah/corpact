<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Company;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportFormat;
use App\Services\Reporting\Export\ExportService;
use App\Services\Reporting\ReportPeriod;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * A13 — تصدير قائد المجتمع (H §15: «القائد يصدّر بيانات مجتمعه **بلا أي
 * بيانات مالية**»).
 *
 * قيدان يعملان معاً:
 * - **النطاق**: `{community}` يمر بربط النماذج داخل سياق الشركة، فمجتمع شركة
 *   أخرى 404 قبل أن يصل هنا؛ وغير القائد 403.
 * - **الحجب**: الجمهور {@see ExportAudience::CommunityLeader} فتسقط كل
 *   الأعمدة المالية، ويُمنع أصلاً من «حركات المحفظة» و«الفواتير».
 *
 * والجوال لا يخرج له كذلك — المنع مقصور على مسؤول الحساب وحده.
 */
class CommunityExportController extends Controller
{
    public function __construct(
        private ExportService $exports,
    ) {}

    public function __invoke(Request $request, Community $community, string $exportKey): HttpResponse
    {
        $employee = auth('employee')->user();

        abort_unless($community->isLeader($employee), 403, 'التصدير من صلاحيات قائد المجتمع.');

        $format = ExportFormat::tryFrom((string) $request->query('format', 'xlsx'));

        if ($format === null) {
            throw new HttpException(404, 'صيغة تصدير غير مدعومة.');
        }

        $company = Company::query()->withoutGlobalScopes()->findOrFail($community->company_id);

        $context = new ExportContext(
            company: $company,
            audience: ExportAudience::CommunityLeader,
            period: $this->resolvePeriod($request),
            community: $community,
        );

        return $this->exports->download($exportKey, $context, $format);
    }

    private function resolvePeriod(Request $request): ReportPeriod
    {
        $key = (string) $request->query('period', '');

        return preg_match('/^\d{4}-\d{2}$/', $key) === 1
            ? ReportPeriod::fromKey($key)
            : ReportPeriod::currentMonth();
    }
}

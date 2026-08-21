<?php

namespace App\Services\Reporting\Export;

use App\Models\AuditLog;
use App\Services\Audit\AuditLogService;
use App\Services\Reporting\Export\Definitions\EmployeeActivationExport;
use App\Services\Reporting\Export\Definitions\EventsResultsExport;
use App\Services\Reporting\Export\Definitions\InvoicesExport;
use App\Services\Reporting\Export\Definitions\WalletTransactionsExport;
use App\Support\Identity\CurrentActor;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * A13 — **الطريق الوحيد إلى أي ملف تصدير** (H §15).
 *
 * ثلاثة شروط تفرضها المواصفة على كل تصدير، وتُنفَّذ هنا موضعاً واحداً لا في
 * كل مسار:
 *
 * 1. **«كل تصدير يمر بنفس فحص الصلاحيات ونطاق الشركة»** — النطاق في
 *    {@see ExportContext} (شركة إلزامية)، والصلاحية يفحصها المستدعي قبلنا
 *    ونؤكدها هنا بقائمة جماهير كل مُصدِّر.
 * 2. **الحجب** — الجوال لمسؤول الحساب وحده، ولا مالية للقائد
 *    ({@see ExportDataset::redactFor()}).
 * 3. **«ويُسجَّل في سجل التدقيق (من، ماذا، متى، كم سجلاً)»** — صف
 *    `export.report` يُكتب **قبل** بناء الاستجابة، فلا ملف يخرج بلا أثر ولو
 *    انقطع التنزيل. الآلية يملكها A15
 *    ({@see AuditLogService::export()}) ولا نعيد بناءها.
 *
 * ترتيب مقصود: التصريح ← البناء ← الحجب ← **التدقيق** ← الملف.
 */
class ExportService
{
    /** @var array<string, class-string<ExportDefinition>> */
    private const DEFINITIONS = [
        'employees_activation' => EmployeeActivationExport::class,
        'events_results' => EventsResultsExport::class,
        'wallet_transactions' => WalletTransactionsExport::class,
        'invoices' => InvoicesExport::class,
    ];

    public function __construct(
        private XlsxWriter $xlsx,
        private PdfWriter $pdf,
    ) {}

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::DEFINITIONS);
    }

    /**
     * المُصدِّرات المتاحة لجمهور معيّن — تغذّي أزرار الصفحة، فلا يُعرض زر
     * سيُرفض ضغطه.
     *
     * @return list<array{key: string, title: string}>
     */
    public function availableFor(ExportAudience $audience): array
    {
        $available = [];

        foreach (self::DEFINITIONS as $key => $class) {
            $definition = app($class);

            if (in_array($audience, $definition->audiences(), true)) {
                $available[] = ['key' => $key, 'title' => $definition->title()];
            }
        }

        return $available;
    }

    public function definition(string $key): ExportDefinition
    {
        $class = self::DEFINITIONS[$key] ?? null;

        if ($class === null) {
            throw new HttpException(404, 'تصدير غير معروف.');
        }

        return app($class);
    }

    /**
     * بناء المجموعة منقّاةً + كتابة صف التدقيق. تُستعمل مباشرةً في الاختبارات
     * وتفصل «ما خرج» عن «كيف كُتب الملف».
     *
     * @return array{dataset: ExportDataset, audit: AuditLog}
     */
    public function prepare(string $key, ExportContext $context, ExportFormat $format): array
    {
        $definition = $this->definition($key);

        if (! in_array($context->audience, $definition->audiences(), true)) {
            throw new HttpException(403, 'هذا التصدير غير متاح لصفتك.');
        }

        $dataset = $definition->build($context)->redactFor($context->audience);

        ['name' => $actorName] = CurrentActor::resolve();

        $dataset = new ExportDataset(
            key: $dataset->key,
            title: $dataset->title,
            columns: $dataset->columns,
            rows: $dataset->rows,
            meta: $context->metaHeader($definition->title(), $actorName),
        );

        // «من، ماذا، متى، كم سجلاً» — الوقت والفاعل يضيفهما A15 تلقائياً.
        $audit = AuditLogService::export(
            report: $dataset->key,
            companyId: $context->companyId(),
            context: [
                'row_count' => $dataset->rowCount(),
                'columns' => $dataset->columnKeys(),
                'period' => $context->period->key,
                'audience' => $context->audience->value,
                'community_id' => $context->communityId(),
            ],
            format: $format->value,
        );

        return ['dataset' => $dataset, 'audit' => $audit];
    }

    /**
     * التصدير كاملاً: تصريح ← بناء ← حجب ← تدقيق ← ملف.
     */
    public function download(string $key, ExportContext $context, ExportFormat $format): Response
    {
        ['dataset' => $dataset] = $this->prepare($key, $context, $format);

        [$body, $filename] = match ($format) {
            ExportFormat::Xlsx => [$this->xlsx->write($dataset), $this->xlsx->filename($dataset)],
            ExportFormat::Pdf => [$this->pdf->write($dataset), $this->pdf->filename($dataset)],
        };

        $disposition = $format->isAttachment() ? 'attachment' : 'inline';

        return new Response($body, 200, [
            'Content-Type' => $format->contentType(),
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
            'X-Export-Rows' => (string) $dataset->rowCount(),
            'Cache-Control' => 'no-store, private',
        ]);
    }
}

<?php

namespace App\Services\Reporting\Export;

/**
 * مُصدِّر واحد من الأربعة المنصوصة (H §15): قائمة الموظفين والتفعيل ·
 * الفعاليات ونتائجها · حركات المحفظة · الفواتير.
 *
 * المُصدِّر **لا يفحص صلاحية ولا يكتب تدقيقاً ولا يحجب عموداً** — يبني
 * البيانات فقط، ويصنّف أعمدته. الفحص والحجب والتدقيق في
 * {@see ExportService} موضعاً واحداً لا أربعة.
 */
interface ExportDefinition
{
    public function key(): string;

    public function title(): string;

    /**
     * الجماهير المسموح لها بهذا التصدير أصلاً — طبقة أولى فوق حجب الأعمدة:
     * «حركات المحفظة» و«الفواتير» لا تُنقّى للقائد بل **لا تُتاح له**.
     *
     * @return list<ExportAudience>
     */
    public function audiences(): array;

    public function build(ExportContext $context): ExportDataset;
}

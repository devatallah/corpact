<?php

namespace App\Services\Reporting\Export;

use App\Services\Company\EmployeeImportFileReader;
use RuntimeException;
use ZipArchive;

/**
 * A13 — كاتب XLSX أصلي بلا اعتمادية (H §15: «بصيغتي Excel وPDF»).
 *
 * **قرار الاعتمادية:** المستودع لا يحمل PhpSpreadsheet ولا ينبغي أن يحمله من
 * أجل أربعة جداول. A4 كتب **قارئ** XLSX أصلياً
 * ({@see EmployeeImportFileReader}) على `ZipArchive` و
 * `SimpleXML`؛ هذا نظيره في اتجاه الكتابة: ملف `.xlsx` حقيقي
 * (OOXML SpreadsheetML) في ~150 سطراً وبلا حزمة جديدة.
 *
 * قرارات التبسيط المقصودة:
 * - **`inlineStr` بدل `sharedStrings`** — لا جدول نصوص مشترك: الملف أكبر
 *   قليلاً والكاتب أبسط كثيراً، والعربية تمر UTF-8 سليمة.
 * - **`rightToLeft="1"`** على `sheetView` كي تفتح الورقة من اليمين.
 * - نمطان فقط: عادي وعريض للترويسة.
 * - الأرقام تُكتب خلايا رقمية (`t` محذوف) فتُجمَع وتُرتَّب في Excel؛ وما عداها
 *   نص، **بما فيها المبالغ النصية بالريال** (منزلتان بلا تقريب — قيمة عرض).
 */
class XlsxWriter
{
    public function write(ExportDataset $dataset): string
    {
        $path = tempnam(sys_get_temp_dir(), 'teamat-xlsx-');

        if ($path === false) {
            throw new RuntimeException('تعذّر إنشاء ملف مؤقت للتصدير.');
        }

        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::OVERWRITE | ZipArchive::CREATE) !== true) {
            throw new RuntimeException('تعذّر فتح أرشيف التصدير.');
        }

        $zip->addFromString('[Content_Types].xml', $this->contentTypes());
        $zip->addFromString('_rels/.rels', $this->rootRels());
        $zip->addFromString('xl/workbook.xml', $this->workbook($dataset->title));
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRels());
        $zip->addFromString('xl/styles.xml', $this->styles());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->sheet($dataset));
        $zip->close();

        $contents = file_get_contents($path);
        @unlink($path);

        if ($contents === false) {
            throw new RuntimeException('تعذّر قراءة ملف التصدير.');
        }

        return $contents;
    }

    public function filename(ExportDataset $dataset): string
    {
        return $this->baseFilename($dataset).'.xlsx';
    }

    public function baseFilename(ExportDataset $dataset): string
    {
        $period = $dataset->meta['period_key'] ?? date('Y-m-d');

        return 'teamat-'.$dataset->key.'-'.preg_replace('/[^A-Za-z0-9\-@]/', '', $period);
    }

    private function sheet(ExportDataset $dataset): string
    {
        $rows = [];
        $rowIndex = 1;

        // **الشبكة تبدأ بصف العناوين في السطر الأول** ولا شيء قبله: ورقة
        // Excel تُقرأ آلياً وتُبنى عليها الجداول المحورية، وكتلة «من صدّر
        // ومتى» فوق الشبكة تكسر ذلك (وتكسر قارئ الاستيراد نفسه — A4). سياق
        // التصدير مكانه سجل التدقيق (وهو مفروض نصاً) واسم الملف، ووثيقة
        // الطباعة تحمله ترويسةً لأنها مستند يُقرأ بالعين لا بيانات تُعالَج.
        $rows[] = $this->row($rowIndex, array_map(
            fn (ExportColumn $column) => ['value' => $column->label, 'numeric' => false, 'bold' => true],
            $dataset->columns,
        ));
        $rowIndex++;

        foreach ($dataset->rows as $dataRow) {
            $cells = [];

            foreach ($dataset->columns as $column) {
                $value = $dataRow[$column->key] ?? null;
                $cells[] = [
                    'value' => $value,
                    'numeric' => $column->numeric && is_numeric($value),
                    'bold' => false,
                ];
            }

            $rows[] = $this->row($rowIndex, $cells);
            $rowIndex++;
        }

        $body = implode('', $rows);

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews>'
            ."<sheetData>{$body}</sheetData>"
            .'</worksheet>';
    }

    /**
     * @param  list<array{value: mixed, numeric: bool, bold: bool}>  $cells
     */
    private function row(int $rowIndex, array $cells): string
    {
        $xml = '<row r="'.$rowIndex.'">';

        foreach ($cells as $index => $cell) {
            $reference = $this->columnLetter($index).$rowIndex;
            $style = $cell['bold'] ? ' s="1"' : '';

            if ($cell['numeric']) {
                $xml .= '<c r="'.$reference.'"'.$style.'><v>'.(0 + $cell['value']).'</v></c>';

                continue;
            }

            $value = $cell['value'];

            if ($value === null || $value === '') {
                $xml .= '<c r="'.$reference.'"'.$style.'/>';

                continue;
            }

            $xml .= '<c r="'.$reference.'"'.$style.' t="inlineStr"><is><t xml:space="preserve">'
                .$this->escape((string) $value)
                .'</t></is></c>';
        }

        return $xml.'</row>';
    }

    private function columnLetter(int $index): string
    {
        $letter = '';

        for ($i = $index; $i >= 0; $i = intdiv($i, 26) - 1) {
            $letter = chr(65 + ($i % 26)).$letter;
        }

        return $letter;
    }

    /**
     * XML 1.0 لا يقبل محارف التحكم — تُزال قبل الهروب كي لا يُفسد صفٌّ واحد
     * الملف كله.
     */
    private function escape(string $value): string
    {
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? $value;

        return htmlspecialchars($clean, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private function contentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>';
    }

    private function rootRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    private function workbook(string $title): string
    {
        // اسم الورقة محدود بـ31 محرفاً ولا يقبل : \ / ? * [ ]
        $name = mb_substr(preg_replace('/[:\\\\\/\?\*\[\]]/u', ' ', $title) ?? 'التقرير', 0, 31);

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            .'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="'.$this->escape($name).'" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
    }

    private function workbookRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    private function styles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
            .'<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            .'<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
            .'<borders count="1"><border/></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
            .'</styleSheet>';
    }
}

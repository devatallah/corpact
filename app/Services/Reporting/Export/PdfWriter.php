<?php

namespace App\Services\Reporting\Export;

/**
 * A13 — مخرج PDF (H §15: «بصيغتي Excel وPDF»).
 *
 * **قرار الاعتمادية — موثَّق في `docs/divergences.md`:**
 *
 * توليد PDF عربي **من الخادم** يحتاج ثلاثة أشياء مجتمعة: محرّك PDF، وخط
 * TrueType عربي مرخّص مضمَّناً في الملف (خطوط PDF الأساسية WinAnsi ولا تحمل
 * حرفاً عربياً واحداً)، ومُشكِّل عربي يحوّل الحروف إلى صورها السياقية ويعكس
 * ترتيبها. المستودع اليوم بلا محرّك PDF وبلا ملف خط، وإدخال حزمة + خط بحجم
 * ميغابايت لأربعة جداول مخالف لقيد «لا اعتمادية ثقيلة إن أمكن تفاديها».

 * فالمُخرَج هنا **وثيقة طباعة مكتفية بذاتها** (HTML + CSS `@page`، RTL،
 * `window.print()` تلقائياً) يحوّلها متصفح المستخدم إلى PDF بمحرّكه هو —
 * فتخرج العربية مشكولة الاتصال ومضبوطة الاتجاه بلا خط مضمَّن ولا حزمة.
 *
 * ما يبقى **غير منقوص** في هذا الطريق: التصدير يمر بنفس فحص الصلاحيات ونطاق
 * الشركة، ونفس الحجب (جوال/مالية)، **ويُكتب له صف تدقيق على الخادم** قبل أن
 * يصل المستخدم شيء. أي أن الشرط الأمني في المواصفة مُستوفى كاملاً، والمتغيّر
 * هو من يرسم الصفحة.
 *
 * الاستبدال لاحقاً تغيير صنف واحد: هذا الصنف يكتب من {@see ExportDataset}
 * نفسها التي يكتب منها {@see XlsxWriter}، فمحرّك PDF حقيقي (عند شراء خط عربي
 * مرخّص) يحلّ محله بلا مساس بالمُصدِّرات ولا بالتدقيق ولا بالمسارات.
 */
class PdfWriter
{
    public function write(ExportDataset $dataset): string
    {
        $head = '';

        foreach ($dataset->columns as $column) {
            $head .= '<th>'.$this->escape($column->label).'</th>';
        }

        $body = '';

        foreach ($dataset->rows as $row) {
            $body .= '<tr>';

            foreach ($dataset->columns as $column) {
                $value = $row[$column->key] ?? '';
                $body .= '<td>'.$this->escape((string) $value).'</td>';
            }

            $body .= '</tr>';
        }

        if ($dataset->rows === []) {
            $body = '<tr><td colspan="'.max(1, count($dataset->columns)).'" class="empty">'
                .'لا توجد بيانات في هذه الفترة.</td></tr>';
        }

        $meta = '';

        foreach ($dataset->meta as $label => $value) {
            if ($label === 'period_key') {
                continue;
            }

            $meta .= '<div><span>'.$this->escape($label).':</span> '.$this->escape($value).'</div>';
        }

        $title = $this->escape($dataset->title);
        $count = $dataset->rowCount();

        return <<<HTML
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
        <meta charset="utf-8">
        <title>{$title}</title>
        <style>
        @page { size: A4 landscape; margin: 14mm; }
        * { box-sizing: border-box; }
        body { font-family: "Readex Pro", "Segoe UI", Tahoma, sans-serif; color: #0A0A0A; margin: 0; font-size: 12px; }
        h1 { font-size: 18px; margin: 0 0 6px; }
        .meta { font-size: 11px; color: #555; margin-bottom: 14px; line-height: 1.9; }
        .meta span { color: #888; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #DDD; padding: 6px 8px; text-align: right; }
        th { background: #F4F4F4; font-weight: 700; }
        tr { page-break-inside: avoid; }
        thead { display: table-header-group; }
        td.empty { text-align: center; color: #888; padding: 24px; }
        .count { margin-top: 10px; font-size: 11px; color: #555; }
        .hint { margin-top: 16px; font-size: 11px; color: #888; }
        @media print { .hint { display: none; } }
        </style>
        </head>
        <body>
        <h1>{$title}</h1>
        <div class="meta">{$meta}</div>
        <table><thead><tr>{$head}</tr></thead><tbody>{$body}</tbody></table>
        <div class="count">عدد السجلات: {$count}</div>
        <div class="hint">اختر «حفظ بصيغة PDF» من نافذة الطباعة.</div>
        <script>window.addEventListener('load', function () { window.print(); });</script>
        </body>
        </html>
        HTML;
    }

    public function filename(ExportDataset $dataset): string
    {
        $period = $dataset->meta['period_key'] ?? date('Y-m-d');

        return 'teamat-'.$dataset->key.'-'.preg_replace('/[^A-Za-z0-9\-@]/', '', $period).'.pdf';
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}

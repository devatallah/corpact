<?php

namespace App\Services\Reporting\Export;

/**
 * الصيغتان المنصوصتان في H §15 — لا ثالث لهما (JSON الذي كان يخرج من
 * `Company\ReportController::export` لم يكن أياً منهما وأُزيل).
 */
enum ExportFormat: string
{
    case Xlsx = 'xlsx';
    case Pdf = 'pdf';

    public function label(): string
    {
        return match ($this) {
            self::Xlsx => 'Excel',
            self::Pdf => 'PDF',
        };
    }

    public function contentType(): string
    {
        return match ($this) {
            self::Xlsx => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // انظر {@see PdfWriter}: وثيقة طباعة يحوّلها المتصفح إلى PDF.
            self::Pdf => 'text/html; charset=UTF-8',
        };
    }

    /**
     * هل يُنزَّل الملف أم يُفتح في نافذة (وثيقة الطباعة تُفتح لتُطبع)؟
     */
    public function isAttachment(): bool
    {
        return $this === self::Xlsx;
    }
}

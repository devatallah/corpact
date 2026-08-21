<?php

namespace App\Services\Reporting\Export;

/**
 * عمود واحد في مجموعة تصدير: المفتاح في الصف، العنوان العربي، تصنيف
 * الحساسية (يقرر الحجب)، وهل القيمة رقمية (يقرر نوع الخلية في XLSX).
 */
final class ExportColumn
{
    public function __construct(
        public readonly string $key,
        public readonly string $label,
        public readonly ExportSensitivity $sensitivity = ExportSensitivity::Plain,
        public readonly bool $numeric = false,
    ) {}

    public static function plain(string $key, string $label, bool $numeric = false): self
    {
        return new self($key, $label, ExportSensitivity::Plain, $numeric);
    }

    public static function phone(string $key, string $label): self
    {
        return new self($key, $label, ExportSensitivity::Phone);
    }

    public static function financial(string $key, string $label): self
    {
        return new self($key, $label, ExportSensitivity::Financial);
    }

    public function isVisibleTo(ExportAudience $audience): bool
    {
        return match ($this->sensitivity) {
            ExportSensitivity::Phone => $audience->allowsPhone(),
            ExportSensitivity::Financial => $audience->allowsFinancial(),
            ExportSensitivity::Plain => true,
        };
    }
}

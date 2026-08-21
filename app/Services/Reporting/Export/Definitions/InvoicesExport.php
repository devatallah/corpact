<?php

namespace App\Services\Reporting\Export\Definitions;

use App\Models\PlatformFeeInvoice;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportColumn;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportDataset;
use App\Services\Reporting\Export\ExportDefinition;
use App\Services\Reporting\ReportPeriod;
use App\Support\Money;

/**
 * H §15 — «الفواتير» (فواتير رسوم النظام الشهرية — A11).
 *
 * ليست مقصورة على فترة التقرير: مسؤول الحساب يريد سجل فواتيره كله، فالفترة
 * تُستعمل سقفاً أعلى (كل ما صدر حتى نهايتها) لا نافذةً ضيّقة. قائد المجتمع
 * ممنوع أصلاً (بيانات مالية بحتة).
 */
class InvoicesExport implements ExportDefinition
{
    public function key(): string
    {
        return 'invoices';
    }

    public function title(): string
    {
        return 'الفواتير';
    }

    public function audiences(): array
    {
        return [
            ExportAudience::AccountManager,
            ExportAudience::Coordinator,
            ExportAudience::PlatformAdmin,
        ];
    }

    public function build(ExportContext $context): ExportDataset
    {
        $invoices = PlatformFeeInvoice::query()
            ->where('company_id', $context->companyId())
            ->where(fn ($q) => $q->whereNull('issued_at')->orWhere('issued_at', '<=', $context->period->end))
            ->orderByDesc('period_key')
            ->get();

        $rows = [];

        foreach ($invoices as $invoice) {
            $rows[] = [
                'serial' => (string) ($invoice->serial ?? ''),
                'period_key' => (string) $invoice->period_key,
                'status' => $this->statusLabel((string) $invoice->status),
                'activated_employees_count' => (int) $invoice->activated_employees_count,
                'fee_per_activated_employee' => Money::format((int) $invoice->fee_per_activated_employee_halalas),
                'fees_subtotal' => Money::format((int) $invoice->fees_subtotal_halalas),
                'minimum_adjustment' => Money::format((int) $invoice->minimum_adjustment_halalas),
                'subtotal' => Money::format((int) $invoice->subtotal_halalas),
                'vat_amount' => Money::format((int) $invoice->vat_amount_halalas),
                'total_amount' => Money::format((int) $invoice->total_amount_halalas),
                'issued_at' => $invoice->issued_at?->timezone(ReportPeriod::TIMEZONE)->format('Y-m-d') ?? '',
                'due_at' => $invoice->due_at?->timezone(ReportPeriod::TIMEZONE)->format('Y-m-d') ?? '',
                'paid_at' => $invoice->paid_at?->timezone(ReportPeriod::TIMEZONE)->format('Y-m-d') ?? '',
                'days_overdue' => $invoice->daysOverdue(),
            ];
        }

        return new ExportDataset(
            key: $this->key(),
            title: $this->title(),
            columns: [
                ExportColumn::plain('serial', 'رقم الفاتورة'),
                ExportColumn::plain('period_key', 'الدورة'),
                ExportColumn::plain('status', 'الحالة'),
                ExportColumn::plain('activated_employees_count', 'موظفون مفعّلون', numeric: true),
                ExportColumn::financial('fee_per_activated_employee', 'الرسم لكل مفعّل (ريال)'),
                ExportColumn::financial('fees_subtotal', 'إجمالي الرسوم (ريال)'),
                ExportColumn::financial('minimum_adjustment', 'تسوية الحد الأدنى (ريال)'),
                ExportColumn::financial('subtotal', 'الإجمالي قبل الضريبة (ريال)'),
                ExportColumn::financial('vat_amount', 'ضريبة القيمة المضافة (ريال)'),
                ExportColumn::financial('total_amount', 'الإجمالي (ريال)'),
                ExportColumn::plain('issued_at', 'تاريخ الإصدار'),
                ExportColumn::plain('due_at', 'تاريخ الاستحقاق'),
                ExportColumn::plain('paid_at', 'تاريخ السداد'),
                ExportColumn::plain('days_overdue', 'أيام التأخر', numeric: true),
            ],
            rows: $rows,
        );
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            PlatformFeeInvoice::STATUS_DRAFT => 'مسودة',
            PlatformFeeInvoice::STATUS_ISSUED => 'مُصدَرة',
            PlatformFeeInvoice::STATUS_PAID => 'مسددة',
            PlatformFeeInvoice::STATUS_VOID => 'ملغاة',
            default => $status,
        };
    }
}

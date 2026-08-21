<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\InvoiceItem;
use App\Models\PlatformFeeInvoice;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * H §18 (مسؤول الحساب): «المالية: … الفواتير». A11 built the invoice engine
 * and the finance-admin screens and left this one to A15.
 *
 * Read-only by design: an invoice is never edited from the company side —
 * «الدفع» is recorded by the finance admin after the real transfer.
 */
class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $company = auth('company')->user();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:64'],
            'status' => ['sometimes', 'nullable', 'string', 'max:16'],
            'sort' => ['sometimes', 'nullable', 'string'],
        ]);

        $direction = ($filters['sort'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $invoices = PlatformFeeInvoice::query()
            ->where('company_id', $company->id)
            ->whereIn('status', [
                PlatformFeeInvoice::STATUS_ISSUED,
                PlatformFeeInvoice::STATUS_PAID,
                PlatformFeeInvoice::STATUS_VOID,
            ])
            ->when(filled($filters['search'] ?? null), fn ($query) => $query->where('serial', 'like', '%'.$filters['search'].'%'))
            ->when(filled($filters['status'] ?? null), fn ($query) => $query->where('status', $filters['status']))
            ->orderBy('period_start', $direction)
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PlatformFeeInvoice $invoice) => $this->present($invoice));

        $outstanding = PlatformFeeInvoice::query()
            ->where('company_id', $company->id)
            ->where('status', PlatformFeeInvoice::STATUS_ISSUED)
            ->sum('total_amount_halalas');

        $overdue = PlatformFeeInvoice::query()
            ->where('company_id', $company->id)
            ->where('status', PlatformFeeInvoice::STATUS_ISSUED)
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->count();

        return Inertia::render('company/invoices/index', [
            'company' => $company,
            'invoices' => $invoices,
            'filters' => $filters,
            'summary' => [
                'outstanding' => Money::format((int) $outstanding),
                'overdue_count' => $overdue,
                'event_creation_blocked' => $company->event_creation_blocked_at !== null,
                'block_reason' => $company->event_creation_block_reason,
            ],
        ]);
    }

    public function show(PlatformFeeInvoice $invoice): Response
    {
        $company = auth('company')->user();

        // H §4: فاتورة شركة أخرى **غير موجودة** لهذه الجلسة.
        abort_if((int) $invoice->company_id !== (int) $company->id, 404);
        abort_if($invoice->status === PlatformFeeInvoice::STATUS_DRAFT, 404);

        return Inertia::render('company/invoices/show', [
            'company' => $company,
            'invoice' => $this->present($invoice),
            'items' => InvoiceItem::query()
                ->where('platform_fee_invoice_id', $invoice->id)
                ->orderBy('id')
                ->get()
                ->map(fn (InvoiceItem $item) => [
                    'id' => $item->id,
                    'type' => $item->type,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_amount' => Money::format((int) $item->unit_amount_halalas),
                    'amount' => Money::format((int) $item->amount_halalas),
                ])
                ->all(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(PlatformFeeInvoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'serial' => $invoice->serial,
            'status' => $invoice->status,
            'issuance_mode' => $invoice->issuance_mode,
            'period_start' => $invoice->period_start?->toDateString(),
            'period_end' => $invoice->period_end?->toDateString(),
            'activated_employees_count' => (int) $invoice->activated_employees_count,
            'departed_activated_count' => (int) $invoice->departed_activated_count,
            'fee_per_activated_employee' => Money::format((int) $invoice->fee_per_activated_employee_halalas),
            'fees_subtotal' => Money::format((int) $invoice->fees_subtotal_halalas),
            'minimum_adjustment' => Money::format((int) $invoice->minimum_adjustment_halalas),
            'subtotal' => Money::format((int) $invoice->subtotal_halalas),
            'vat_rate_percent' => (int) $invoice->vat_rate_percent,
            'vat_amount' => Money::format((int) $invoice->vat_amount_halalas),
            'total_amount' => Money::format((int) $invoice->total_amount_halalas),
            'issued_at' => $invoice->issued_at?->toIso8601String(),
            'due_at' => $invoice->due_at?->toIso8601String(),
            'paid_at' => $invoice->paid_at?->toIso8601String(),
            'is_overdue' => $invoice->status === PlatformFeeInvoice::STATUS_ISSUED
                && $invoice->due_at !== null
                && $invoice->due_at->isPast(),
        ];
    }
}

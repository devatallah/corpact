<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\InvoiceItem;
use App\Models\PlatformFeeInvoice;
use App\Services\Billing\InvoiceArrearsService;
use App\Services\Billing\InvoiceService;
use App\Support\Lists\ListSort;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * لوحة الأدمن المالي — الفواتير الشهرية (G/الأدمن المالي §4): التوليد
 * والمراجعة وتسجيل السداد ومتابعة سلّم التأخر.
 *
 * ⚠️ ما دام `billing.real_invoices_enabled` مغلقاً، كل فاتورة تُصدر بوضع
 * `provisional` — الأرقام تُحسب وتُخزَّن، ولا تُقدَّم مستنداً ضريبياً نهائياً
 * قبل مراجعة المحاسب القانوني (H §12.9).
 */
class FinanceInvoiceController extends Controller
{
    public function __construct(
        private InvoiceService $invoices,
        private InvoiceArrearsService $arrears,
    ) {}

    /**
     * H §18 — الأعمدة المسموح الترتيب بها. كلها معروضة في سطر الفاتورة أصلاً
     * (الدورة · الحالة · الإجمالي · عدد المفعّلين · الاستحقاق)، فالترتيب لا
     * يكشف رقماً لا يراه الأدمن المالي. الافتراضي هو ترتيب الشاشة السابق نفسه:
     * أحدث دورة أولاً ثم المعرّف.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'period_key' => 'period_key',
            'status' => 'status',
            'total_amount' => 'total_amount_halalas',
            'activated_employees_count' => 'activated_employees_count',
            'due_at' => 'due_at',
        ], 'period_key', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $request->validate([
            'status' => ['sometimes', 'nullable', 'string', 'max:40'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort`، لا
            // اسم عمود؛ التحقق هنا يمنع الحشو فقط.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $status = $request->string('status')->toString();
        $search = trim((string) $request->query('search', ''));

        $query = PlatformFeeInvoice::query()
            ->with('company:id,name')
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(fn ($inner) => $inner
                ->where('serial', 'like', '%'.$search.'%')
                ->orWhereHas('company', fn ($company) => $company->where('name', 'like', '%'.$search.'%'))));

        $invoices = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PlatformFeeInvoice $invoice) => $this->present($invoice));

        $cycle = $this->invoices->cycleFor();

        $missingContracts = Company::query()
            ->withoutGlobalScopes()
            ->whereNull('contract_fee_per_activated_employee')
            ->whereDoesntHave('contractTerms')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Company $company) => ['id' => $company->id, 'name' => $company->name])
            ->all();

        return Inertia::render('admin/finance/invoices', [
            'invoices' => $invoices,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'sort' => $request->query('sort'),
                'dir' => $request->query('dir'),
            ],
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
            'cycle' => [
                'key' => $cycle['key'],
                'start' => $cycle['start']->toDateString(),
                'end' => $cycle['end']->toDateString(),
            ],
            'realInvoicesEnabled' => (bool) config('billing.real_invoices_enabled'),
            'missingContracts' => $missingContracts,
        ]);
    }

    public function show(PlatformFeeInvoice $invoice): Response
    {
        $invoice->load(['company:id,name,vat_number', 'items']);

        return Inertia::render('admin/finance/invoice-show', [
            'invoice' => [
                ...$this->present($invoice),
                'items' => $invoice->items->map(fn (InvoiceItem $item) => [
                    'id' => $item->id,
                    'type' => $item->type,
                    'description' => $item->description,
                    'quantity' => (int) $item->quantity,
                    'unit_amount' => Money::format((int) $item->unit_amount_halalas),
                    'amount' => Money::format((int) $item->amount_halalas),
                    'vat_amount' => Money::format((int) $item->vat_amount_halalas),
                    'total_amount' => Money::format((int) $item->total_amount_halalas),
                    'tax_treatment' => $item->tax_treatment,
                    'invoice_issuer' => $item->invoice_issuer,
                ])->all(),
            ],
        ]);
    }

    /**
     * توليد يدوي لفواتير الدورة المنتهية (نفس ما تفعله المهمة المجدولة —
     * `app:generate-monthly-invoices` اليوم 3 من كل شهر 03:00).
     */
    public function generate(): RedirectResponse
    {
        $cycle = $this->invoices->cycleFor();
        $actor = auth('admin')->user();
        $generated = 0;

        foreach (Company::query()->withoutGlobalScopes()->cursor() as $company) {
            if ($this->invoices->generateFor($company, $cycle, $actor) !== null) {
                $generated++;
            }
        }

        return back()->with('success', "صدرت {$generated} فاتورة عن دورة {$cycle['key']}.");
    }

    public function markPaid(Request $request, PlatformFeeInvoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        try {
            $this->invoices->markPaid($invoice, auth('admin')->user(), $validated['payment_reference'] ?? null);
        } catch (Throwable $e) {
            return back()->withErrors(['invoice' => $e->getMessage()]);
        }

        return back()->with('success', 'سُجّل السداد.');
    }

    /**
     * تشغيل سلّم التأخر يدوياً (تنبيه 7 ثم 15 ثم حجب الإنشاء بعد 30).
     */
    public function runArrears(): RedirectResponse
    {
        $result = $this->arrears->process();

        return back()->with('success', "تنبيهات: {$result['reminded_7']} (7 أيام) و{$result['reminded_15']} (15 يوماً)، وحجب إنشاء: {$result['blocked']}.");
    }

    /**
     * @return array<string, mixed>
     */
    private function present(PlatformFeeInvoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'serial' => $invoice->serial,
            'invoice_uuid' => $invoice->invoice_uuid,
            'company' => $invoice->company?->only(['id', 'name']),
            'period_key' => $invoice->period_key,
            'period_start' => $invoice->period_start?->toDateString(),
            'period_end' => $invoice->period_end?->toDateString(),
            'status' => $invoice->status,
            'issuance_mode' => $invoice->issuance_mode,
            'activated_employees_count' => (int) $invoice->activated_employees_count,
            'departed_activated_count' => (int) $invoice->departed_activated_count,
            'fee_per_activated_employee' => Money::format((int) $invoice->fee_per_activated_employee_halalas),
            'fees_subtotal' => Money::format((int) $invoice->fees_subtotal_halalas),
            'monthly_minimum' => $invoice->monthly_minimum_halalas !== null
                ? Money::format((int) $invoice->monthly_minimum_halalas)
                : null,
            'minimum_adjustment' => Money::format((int) $invoice->minimum_adjustment_halalas),
            'subtotal' => Money::format((int) $invoice->subtotal_halalas),
            'vat_amount' => Money::format((int) $invoice->vat_amount_halalas),
            'total_amount' => Money::format((int) $invoice->total_amount_halalas),
            'total_amount_halalas' => (int) $invoice->total_amount_halalas,
            'vat_rate_percent' => (int) $invoice->vat_rate_percent,
            'tax_treatment' => $invoice->tax_treatment,
            'invoice_issuer' => $invoice->invoice_issuer,
            'seller_vat_number' => $invoice->seller_vat_number,
            'buyer_vat_number' => $invoice->buyer_vat_number,
            'qr_payload' => $invoice->qr_payload,
            'issued_at' => $invoice->issued_at?->toIso8601String(),
            'due_at' => $invoice->due_at?->toIso8601String(),
            'paid_at' => $invoice->paid_at?->toIso8601String(),
            'days_overdue' => $invoice->daysOverdue(),
            'reminder_7_sent_at' => $invoice->reminder_7_sent_at?->toIso8601String(),
            'reminder_15_sent_at' => $invoice->reminder_15_sent_at?->toIso8601String(),
            'blocked_at' => $invoice->blocked_at?->toIso8601String(),
        ];
    }
}

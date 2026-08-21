<?php

namespace App\Services\Billing;

use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\InvoiceItem;
use App\Models\PlatformFeeInvoice;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Attendance\ActivationService;
use App\Services\Notifications\CriticalAlertService;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * فوترة رسوم النظام الشهرية (H §12.8/§12.9 + G/الأدمن المالي §4).
 *
 * | البند | القاعدة المطبَّقة |
 * |---|---|
 * | الدورة | شهرية **ميلادية** كاملة: 1 → آخر يوم |
 * | الموظف المفعّل | شارك في فعالية انتقلت إلى `completed` **داخل الدورة** ولم يُسجَّل غائباً — **مرة واحدة** مهما تعددت فعالياته |
 * | موظف غادر خلال الدورة | يُحتسب إن كان قد فُعّل قبل مغادرته (`CompanyMembership::departedBetween`) |
 * | الإصدار | اليوم الثالث من الشهر التالي |
 * | الاستحقاق | 15 يوماً من الإصدار |
 * | الضريبة | 15% **تُضاف** على الرسوم (لا شاملة — بخلاف أسعار الفعاليات) |
 * | الحد الأدنى | من العقد؛ يُفوتر الفرق بنداً مستقلاً حين تقل الرسوم عنه |
 *
 * قيم العقد تُقرأ **بتاريخ نهاية الدورة** عبر {@see FinancialTermsService}،
 * فتعديل العقد اليوم لا يمس فاتورة دورة سابقة أبداً (H §12.10). عقد بلا رسم
 * محدد ⇒ **لا فاتورة** + تنبيه للأدمن؛ لا افتراضات في أرقام العقود.
 */
class InvoiceService
{
    public function __construct(private FinancialTermsService $terms) {}

    /**
     * حدود الدورة الميلادية المفوترة عند تشغيل المهمة في تاريخ ما (الشهر السابق).
     *
     * @return array{key: string, start: Carbon, end: Carbon}
     */
    public function cycleFor(?Carbon $runAt = null): array
    {
        $month = ($runAt ?? Carbon::now())->copy()->startOfMonth()->subMonth();

        return [
            'key' => $month->format('Y-m'),
            'start' => $month->copy()->startOfMonth(),
            'end' => $month->copy()->endOfMonth(),
        ];
    }

    /**
     * عدد الموظفين المفعّلين في الدورة + من غادر منهم خلالها.
     *
     * @param  array{key: string, start: Carbon, end: Carbon}  $cycle
     * @return array{ids: list<int>, count: int, departed_count: int}
     */
    public function activationFor(Company $company, array $cycle): array
    {
        // **دلالة «المفعّل» يملكها A12** (H §13 ⟶ §12.8): حضر فعالية انتقلت
        // إلى `completed` داخل الدورة ولم يُسجَّل غائباً، مرة واحدة. A11 لا
        // يعيد تعريفها هنا — يقرأها من مصدرها ويحوّلها إلى مال.
        $ids = app(ActivationService::class)
            ->activatedEmployeeIds((int) $company->id, $cycle['start'], $cycle['end'])
            ->all();

        // «موظف غادر خلال الدورة يُحتسب إن كان قد فُعّل قبل مغادرته» — صفوف
        // مشاركته باقية فهو داخل العدّ أصلاً؛ هذا الاستعلام يوثّق كم منهم.
        $departedEmployeeIds = CompanyMembership::query()
            ->where('company_id', $company->id)
            ->departedBetween($cycle['start'], $cycle['end'])
            ->pluck('employee_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();

        return [
            'ids' => $ids,
            'count' => count($ids),
            'departed_count' => count(array_intersect($ids, $departedEmployeeIds)),
        ];
    }

    /**
     * توليد فاتورة دورة لشركة. idempotent على (الشركة + الدورة). يعيد null
     * إذا كانت الفاتورة مولَّدة سلفاً أو إذا لم يكن للعقد رسم محدد.
     *
     * @param  array{key: string, start: Carbon, end: Carbon}  $cycle
     */
    public function generateFor(Company $company, array $cycle, ?User $actor = null, ?Carbon $issuedAt = null): ?PlatformFeeInvoice
    {
        $existing = PlatformFeeInvoice::query()
            ->where('company_id', $company->id)
            ->where('period_key', $cycle['key'])
            ->first();

        if ($existing !== null) {
            return null;
        }

        $terms = $this->terms->contractTermsFor($company, $cycle['end']);
        $fee = $terms['fee_per_activated_employee_halalas'];

        if ($fee === null) {
            $this->alertMissingContract($company, $cycle);

            return null;
        }

        $activation = $this->activationFor($company, $cycle);
        $minimum = $terms['monthly_minimum_halalas'];

        $feesSubtotal = $fee * $activation['count'];
        $minimumAdjustment = ($minimum !== null && $feesSubtotal < $minimum) ? $minimum - $feesSubtotal : 0;
        $subtotal = $feesSubtotal + $minimumAdjustment;

        $vatRate = (int) config('billing.vat_rate_percent', 15);
        $feesVat = $this->vatOn($feesSubtotal, $vatRate);
        $minimumVat = $this->vatOn($minimumAdjustment, $vatRate);
        $vat = $feesVat + $minimumVat;

        $issuedAt ??= Carbon::now();
        $dueAt = $issuedAt->copy()->addDays((int) config('billing.invoice.due_days', 15));

        return DB::transaction(function () use ($company, $cycle, $activation, $fee, $minimum, $feesSubtotal, $minimumAdjustment, $subtotal, $feesVat, $minimumVat, $vat, $vatRate, $issuedAt, $dueAt, $actor, $terms): PlatformFeeInvoice {
            $invoice = $this->createWithSerial([
                'company_id' => $company->id,
                'invoice_uuid' => (string) Str::uuid(),
                'period_key' => $cycle['key'],
                'period_start' => $cycle['start']->toDateString(),
                'period_end' => $cycle['end']->toDateString(),
                'status' => PlatformFeeInvoice::STATUS_ISSUED,
                'issuance_mode' => config('billing.real_invoices_enabled')
                    ? PlatformFeeInvoice::MODE_REAL
                    : PlatformFeeInvoice::MODE_PROVISIONAL,
                'activated_employees_count' => $activation['count'],
                'departed_activated_count' => $activation['departed_count'],
                'fee_per_activated_employee_halalas' => $fee,
                'fees_subtotal_halalas' => $feesSubtotal,
                'monthly_minimum_halalas' => $minimum,
                'minimum_adjustment_halalas' => $minimumAdjustment,
                'subtotal_halalas' => $subtotal,
                'vat_amount_halalas' => $vat,
                'total_amount_halalas' => $subtotal + $vat,
                'vat_rate_percent' => $vatRate,
                'tax_treatment' => config('billing.tax.system_fee.treatment', 'principal'),
                'invoice_issuer' => config('billing.tax.system_fee.issuer', 'teamat'),
                'seller_name' => config('billing.invoice.seller_name'),
                'seller_vat_number' => config('billing.invoice.seller_vat_number'),
                'buyer_name' => $company->name,
                'buyer_vat_number' => $company->vat_number,
                'issued_at' => $issuedAt,
                'due_at' => $dueAt,
                'generated_by_user_id' => $actor?->id,
                'metadata' => [
                    'terms_source' => $terms['source'],
                    'activated_employee_ids' => $activation['ids'],
                    'fatoora' => [
                        // «تُبنى بنية الفاتورة بحقول قابلة للتوسعة … حتى لو
                        // تأجل الربط» (H §12.9).
                        'status' => 'pending_integration',
                        'invoice_type' => 'standard',
                    ],
                ],
            ]);

            InvoiceItem::create([
                'platform_fee_invoice_id' => $invoice->id,
                'type' => InvoiceItem::TYPE_ACTIVATION_FEE,
                'description' => "رسوم النظام — {$activation['count']} موظف مفعّل في دورة {$cycle['key']}",
                'quantity' => $activation['count'],
                'unit_amount_halalas' => $fee,
                'amount_halalas' => $feesSubtotal,
                'vat_amount_halalas' => $feesVat,
                'total_amount_halalas' => $feesSubtotal + $feesVat,
                'tax_treatment' => config('billing.tax.system_fee.treatment', 'principal'),
                'invoice_issuer' => config('billing.tax.system_fee.issuer', 'teamat'),
                'metadata' => ['departed_activated_count' => $activation['departed_count']],
            ]);

            if ($minimumAdjustment > 0) {
                InvoiceItem::create([
                    'platform_fee_invoice_id' => $invoice->id,
                    'type' => InvoiceItem::TYPE_MONTHLY_MINIMUM,
                    'description' => 'فرق الحد الأدنى الشهري في العقد ('.Money::format((int) $minimum).' ريال)',
                    'quantity' => 1,
                    'unit_amount_halalas' => $minimumAdjustment,
                    'amount_halalas' => $minimumAdjustment,
                    'vat_amount_halalas' => $minimumVat,
                    'total_amount_halalas' => $minimumAdjustment + $minimumVat,
                    'tax_treatment' => config('billing.tax.system_fee.treatment', 'principal'),
                    'invoice_issuer' => config('billing.tax.system_fee.issuer', 'teamat'),
                ]);
            }

            $invoice->forceFill(['qr_payload' => $this->fatooraQrPayload($invoice)])->save();

            ActivityLogService::log(
                $company->id,
                $invoice,
                'platform_fee_invoice_issued',
                "إصدار فاتورة رسوم النظام {$invoice->serial} عن دورة {$cycle['key']} بإجمالي ".Money::format((int) $invoice->total_amount_halalas).' ريال',
                [
                    'period_key' => $cycle['key'],
                    'activated_employees_count' => $activation['count'],
                    'total_amount_halalas' => (int) $invoice->total_amount_halalas,
                    'issuance_mode' => $invoice->issuance_mode,
                ],
                $actor?->id,
            );

            $this->notifyIssued($company, $invoice);

            return $invoice;
        });
    }

    /**
     * تسجيل سداد فاتورة — الأدمن المالي. يرفع الحجب إن لم يبقَ متأخر 30 يوماً.
     */
    public function markPaid(PlatformFeeInvoice $invoice, User $actor, ?string $reference = null): PlatformFeeInvoice
    {
        if ($invoice->status !== PlatformFeeInvoice::STATUS_ISSUED) {
            throw new RuntimeException('لا يُسجَّل السداد إلا لفاتورة مُصدَرة.');
        }

        return DB::transaction(function () use ($invoice, $actor, $reference): PlatformFeeInvoice {
            $invoice->forceFill([
                'status' => PlatformFeeInvoice::STATUS_PAID,
                'paid_at' => now(),
                'paid_by_user_id' => $actor->id,
                'payment_reference' => $reference,
            ])->save();

            app(InvoiceArrearsService::class)->reevaluateBlock($invoice->company);

            ActivityLogService::log(
                (int) $invoice->company_id,
                $invoice,
                'platform_fee_invoice_paid',
                "تسجيل سداد الفاتورة {$invoice->serial}",
                ['payment_reference' => $reference],
                $actor->id,
            );

            Notify::sendToId('invoice.paid', Company::class, (int) $invoice->company_id, [
                'serial' => $invoice->serial,
                'period' => $invoice->period_key,
            ], [
                'fallback_title' => 'سُجّل سداد فاتورتك',
                'fallback_body' => "سُجّل سداد الفاتورة {$invoice->serial} عن دورة {$invoice->period_key}.",
                'data' => ['invoice_id' => $invoice->id],
            ]);

            return $invoice;
        });
    }

    /**
     * الضريبة **تُضاف** على الرسوم بقسمة صحيحة (بلا تقريب لأعلى — H §12.1).
     */
    private function vatOn(int $amountHalalas, int $ratePercent): int
    {
        return intdiv(max(0, $amountHalalas) * $ratePercent, 100);
    }

    /**
     * رقم متسلسل فريد للفاتورة (متطلب فاتورة: تسلسل لا فجوات دلالية).
     *
     * @param  array<string, mixed>  $attributes
     */
    private function createWithSerial(array $attributes): PlatformFeeInvoice
    {
        $prefix = (string) config('billing.invoice.serial_prefix', 'TMT-INV');

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $next = ((int) PlatformFeeInvoice::query()->max('serial_sequence')) + 1;

            try {
                return PlatformFeeInvoice::create([
                    ...$attributes,
                    'serial_sequence' => $next,
                    'serial' => $prefix.'-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT),
                ]);
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt === 4) {
                    throw $e;
                }
            }
        }

        throw new RuntimeException('تعذّر حجز رقم متسلسل للفاتورة.');
    }

    /**
     * حمولة رمز QR بصيغة TLV المعتمدة في فاتورة (base64). تُبنى فقط حين يُضبط
     * الرقم الضريبي للبائع — وإلا تبقى فارغة بانتظار الربط.
     */
    private function fatooraQrPayload(PlatformFeeInvoice $invoice): ?string
    {
        if (! $invoice->seller_vat_number || ! $invoice->seller_name) {
            return null;
        }

        $tlv = '';
        $fields = [
            1 => (string) $invoice->seller_name,
            2 => (string) $invoice->seller_vat_number,
            3 => $invoice->issued_at?->toIso8601String() ?? now()->toIso8601String(),
            4 => Money::format((int) $invoice->total_amount_halalas),
            5 => Money::format((int) $invoice->vat_amount_halalas),
        ];

        foreach ($fields as $tag => $value) {
            $tlv .= chr($tag).chr(strlen($value)).$value;
        }

        return base64_encode($tlv);
    }

    /**
     * @param  array{key: string, start: Carbon, end: Carbon}  $cycle
     */
    private function alertMissingContract(Company $company, array $cycle): void
    {
        app(CriticalAlertService::class)->warn(
            'billing.contract_terms_missing',
            "فاتورة لم تُصدر — عقد بلا رسوم: {$company->name}",
            "شركة {$company->name} بلا رسم موظف مفعّل في العقد، فلم تُصدَر فاتورة دورة {$cycle['key']}. أدخل قيم العقد ثم أعد التوليد.",
            ['company_id' => $company->id, 'period_key' => $cycle['key']],
        );
    }

    private function notifyIssued(Company $company, PlatformFeeInvoice $invoice): void
    {
        Notify::send('invoice.issued', $company, [
            'period' => $invoice->period_key,
            'amount' => Money::format((int) $invoice->total_amount_halalas),
            'due_date' => $invoice->due_at?->format('Y-m-d') ?? '',
        ], [
            'data' => [
                'invoice_id' => $invoice->id,
                'serial' => $invoice->serial,
                'period_key' => $invoice->period_key,
                'activated_employees_count' => (int) $invoice->activated_employees_count,
                'total_amount_halalas' => (int) $invoice->total_amount_halalas,
                'issuance_mode' => $invoice->issuance_mode,
            ],
        ]);
    }
}

<?php

namespace App\Services\Billing;

use App\Models\EmployeePaymentInvoice;
use App\Models\PaymentIntent;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * إصدار مستند حصة الموظف عند تأكيد السداد (H §12.6 + §12.9).
 *
 * البائع يُشتق من المصفوفة الضريبية لا من افتراض: `activity_value` مصنَّفة
 * **وكالة** ومُصدِرها المزوّد، فالمستند يصدر باسمه ورقمه الضريبي — تيمات
 * تحصّل بصفتها التاجر المسجَّل (Merchant of Record) لا بصفتها المورّد. لو
 * قُلبت المصفوفة إلى `principal/teamat` صدر باسم تيمات بالكود نفسه.
 *
 * كتابة اسم تيمات هنا ثابتاً كانت ستنسب التوريد إلى غير مورّده على المستند
 * الوحيد الذي يهم ضريبياً في هذا التدفق.
 */
class EmployeeInvoiceService
{
    /**
     * مستند واحد لكل مطالبة مدفوعة — يُعاد الموجود ولا يُصدَر ثانٍ.
     */
    public function issueFor(PaymentIntent $intent): ?EmployeePaymentInvoice
    {
        if ($intent->status !== PaymentIntent::STATUS_PAID) {
            return null;
        }

        $existing = EmployeePaymentInvoice::query()
            ->where('payment_intent_id', $intent->id)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $intent->loadMissing(['event.partner', 'employee']);

        $tax = (array) config('billing.tax.activity_value', ['treatment' => 'agent', 'issuer' => 'provider']);
        $partner = $intent->event?->partner;

        // المُصدِر يقرر البائع المعروض. المزوّد بلا رقم ضريبي يبقى بائعاً
        // باسمه ورقمه فارغ — ولا رمز QR بلا رقم ضريبي، فالرمز الناقص أسوأ من
        // غيابه: يُمسح ولا يُقرأ.
        $seller = $tax['issuer'] === 'teamat'
            ? [config('billing.invoice.seller_name'), config('billing.invoice.seller_vat_number')]
            : [$partner?->name, $partner?->vat_number];

        return DB::transaction(function () use ($intent, $tax, $seller, $partner): EmployeePaymentInvoice {
            $next = ((int) EmployeePaymentInvoice::query()->lockForUpdate()->max('serial_sequence')) + 1;
            $prefix = (string) config('billing.invoice.employee_serial_prefix', 'TMT-EMP');
            $issuedAt = $intent->paid_at ?? now();

            $invoice = EmployeePaymentInvoice::query()->create([
                'payment_intent_id' => $intent->id,
                'employee_id' => $intent->employee_id,
                'event_id' => $intent->event_id,
                'company_id' => $intent->company_id,
                'partner_id' => $partner?->id,
                'serial_sequence' => $next,
                'serial' => sprintf('%s-%s-%06d', $prefix, $issuedAt->format('Y'), $next),
                'invoice_uuid' => (string) Str::uuid(),
                'issuance_mode' => config('billing.real_invoices_enabled')
                    ? EmployeePaymentInvoice::MODE_REAL
                    : EmployeePaymentInvoice::MODE_PROVISIONAL,
                'tax_treatment' => $tax['treatment'],
                'invoice_issuer' => $tax['issuer'],
                'seller_name' => $seller[0],
                'seller_vat_number' => $seller[1],
                'buyer_name' => $intent->employee?->name,
                'subtotal_halalas' => (int) $intent->base_amount_halalas,
                'vat_amount_halalas' => (int) $intent->vat_amount_halalas,
                'total_amount_halalas' => (int) $intent->amount_halalas,
                'vat_rate_percent' => (int) config('billing.vat_rate_percent', 15),
                'issued_at' => $issuedAt,
            ]);

            $invoice->forceFill(['qr_payload' => $this->fatooraQrPayload($invoice)])->save();

            return $invoice;
        });
    }

    /**
     * رمز فاتورة (TLV بترميز base64) بحقول ZATCA الخمسة.
     *
     * بلا اسم بائع أو رقم ضريبي لا يُولَّد رمز: رمزٌ ناقص يُمسح فيُقرأ خطأً،
     * وغيابه يقول الحقيقة — المستند لم يكتمل بعد.
     */
    private function fatooraQrPayload(EmployeePaymentInvoice $invoice): ?string
    {
        if (! $invoice->seller_name || ! $invoice->seller_vat_number) {
            return null;
        }

        $fields = [
            1 => (string) $invoice->seller_name,
            2 => (string) $invoice->seller_vat_number,
            3 => $invoice->issued_at?->toIso8601String() ?? now()->toIso8601String(),
            4 => Money::format((int) $invoice->total_amount_halalas),
            5 => Money::format((int) $invoice->vat_amount_halalas),
        ];

        $tlv = '';

        foreach ($fields as $tag => $value) {
            $tlv .= chr($tag).chr(strlen($value)).$value;
        }

        return base64_encode($tlv);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * مستند حصة الموظف.
 *
 * `provisional` يعني: مُحتسب ومعروض، وليس مستنداً ضريبياً نهائياً. القلب إلى
 * `real` قرار مالك ومحاسب عبر `billing.real_invoices_enabled`، لا أثر جانبي
 * لتشغيل ميزة.
 */
#[Fillable([
    'payment_intent_id', 'employee_id', 'event_id', 'company_id', 'partner_id',
    'serial_sequence', 'serial', 'invoice_uuid', 'issuance_mode', 'tax_treatment',
    'invoice_issuer', 'seller_name', 'seller_vat_number', 'buyer_name',
    'subtotal_halalas', 'vat_amount_halalas', 'total_amount_halalas',
    'vat_rate_percent', 'qr_payload', 'issued_at',
])]
class EmployeePaymentInvoice extends Model
{
    public const MODE_PROVISIONAL = 'provisional';

    public const MODE_REAL = 'real';

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'subtotal_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'total_amount_halalas' => 'integer',
            'vat_rate_percent' => 'integer',
        ];
    }

    /** مستند نهائي أم محتسب فقط — الفرق يُعرض للموظف بنصّه. */
    public function isProvisional(): bool
    {
        return $this->issuance_mode !== self::MODE_REAL;
    }

    public function intent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class, 'payment_intent_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }
}

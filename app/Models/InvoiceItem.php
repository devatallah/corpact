<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * بند فاتورة رسوم النظام. كل بند يحمل صفته الضريبية وجهة إصداره (H §12.9)
 * حتى تُعدَّل المعالجة لاحقاً بلا إعادة بناء.
 */
#[Fillable([
    'platform_fee_invoice_id',
    'type',
    'description',
    'quantity',
    'unit_amount_halalas',
    'amount_halalas',
    'vat_amount_halalas',
    'total_amount_halalas',
    'tax_treatment',
    'invoice_issuer',
    'metadata',
])]
class InvoiceItem extends Model
{
    use HasFactory;

    public const TYPE_ACTIVATION_FEE = 'activation_fee';

    public const TYPE_MONTHLY_MINIMUM = 'monthly_minimum';

    public const TYPE_COORDINATOR_SERVICE = 'coordinator_service';

    public const TYPE_CORRECTION = 'correction';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_amount_halalas' => 'integer',
            'amount_halalas' => 'integer',
            'vat_amount_halalas' => 'integer',
            'total_amount_halalas' => 'integer',
            'metadata' => 'array',
        ];
    }

    /**
     * @return BelongsTo<PlatformFeeInvoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(PlatformFeeInvoice::class, 'platform_fee_invoice_id');
    }
}

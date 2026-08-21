<?php

namespace App\Services\Billing;

use App\Exceptions\PaidSettlementImmutableException;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * تصحيح بند تسوية — البديل المعتمد لواجهة النزاع المؤجلة (H §12.7):
 *
 * > «الأدمن المالي يصحّح أي بند يدوياً **بحركة عكسية + بند تصحيحي في الكشف
 * > التالي**، مع سبب إلزامي في سجل التدقيق. ولا يُعدَّل كشف مدفوع إطلاقاً.»
 *
 * ما يحدث في عملية واحدة ذرّية:
 * 1. حركات عكسية مرتبطة لقيدي البند الأصلي (استحقاق + عمولة) — لا حذف ولا
 *    تعديل لأي قيد.
 * 2. قيود جديدة بالقيم المصحَّحة.
 * 3. **بند تصحيحي جديد بحالة `pending`** يحمل الفرق الموقّع، فيلتقطه مولّد
 *    الكشف التالي تلقائياً.
 * 4. البند الأصلي يُختم `adjusted` (الختم الوحيد المسموح على بند مدفوع).
 * 5. سطر في سجل التدقيق بالسبب الإلزامي + إشعار للمزوّد.
 */
class SettlementCorrectionService
{
    public function __construct(private ProviderPayableService $payables) {}

    /**
     * @param  int  $correctedGrossHalalas  الإجمالي الصحيح شامل الضريبة
     * @param  float|null  $correctedRatePercent  نسبة العمولة الصحيحة (null = نسبة البند الأصلي)
     */
    public function correct(
        SettlementItem $original,
        int $correctedGrossHalalas,
        ?float $correctedRatePercent,
        string $reason,
        User $actor,
    ): SettlementItem {
        if (trim($reason) === '') {
            throw new InvalidArgumentException('التصحيح يتطلب سبباً مكتوباً إلزامياً.');
        }

        if ($correctedGrossHalalas < 0) {
            throw new InvalidArgumentException('الإجمالي المصحَّح لا يكون سالباً.');
        }

        if ($original->type !== SettlementItem::TYPE_EVENT) {
            throw new RuntimeException('يُصحَّح بند فعالية فقط — بند تصحيحي يُصحَّح ببند تصحيحي جديد على الأصل.');
        }

        if ($original->settlement_statement_id === null) {
            throw new RuntimeException('البند لم يدخل كشفاً بعد — يُعاد توليده ولا يحتاج بنداً تصحيحياً.');
        }

        if ($original->status === SettlementItem::STATUS_ADJUSTED) {
            throw new PaidSettlementImmutableException('البند مصحَّح سلفاً — التصحيح التالي يبدأ من بنده التصحيحي.');
        }

        $ratePercent = $correctedRatePercent ?? (float) $original->commission_rate_percent;
        $rateBasisPoints = (int) round($ratePercent * 100);
        $correctedCommission = intdiv($correctedGrossHalalas * $rateBasisPoints, 10000);
        $correctedVat = Money::decomposeVat(max(0, $correctedCommission))['vat'];
        $correctedNet = $correctedGrossHalalas - $correctedCommission;

        $delta = [
            'gross' => $correctedGrossHalalas - (int) $original->gross_amount_halalas,
            'commission' => $correctedCommission - (int) $original->commission_amount_halalas,
            'vat' => $correctedVat - (int) $original->vat_amount_halalas,
            'net' => $correctedNet - (int) $original->net_amount_halalas,
        ];

        if ($delta['gross'] === 0 && $delta['commission'] === 0) {
            throw new RuntimeException('لا فرق بين القيم الأصلية والمصحَّحة — لا بند تصحيحي.');
        }

        return DB::transaction(function () use ($original, $correctedGrossHalalas, $correctedCommission, $correctedVat, $correctedNet, $ratePercent, $delta, $reason, $actor): SettlementItem {
            $sequence = SettlementItem::query()->where('corrects_item_id', $original->id)->count() + 1;

            $correction = SettlementItem::create([
                'partner_id' => $original->partner_id,
                'event_id' => $original->event_id,
                'company_id' => $original->company_id,
                'type' => SettlementItem::TYPE_CORRECTION,
                'corrects_item_id' => $original->id,
                'gross_amount_halalas' => $delta['gross'],
                'commission_amount_halalas' => $delta['commission'],
                'vat_amount_halalas' => $delta['vat'],
                'net_amount_halalas' => $delta['net'],
                'activity_vat_amount_halalas' => 0,
                'rounding_remainder_halalas' => 0,
                'commission_rate_percent' => $ratePercent,
                'status' => SettlementItem::STATUS_PENDING,
                'tax_treatment' => $original->tax_treatment,
                'invoice_issuer' => $original->invoice_issuer,
                'snapshot_json' => [
                    'computed_at' => now()->toIso8601String(),
                    'source' => 'correction',
                    'corrects_item_id' => $original->id,
                    'corrects_statement_id' => $original->settlement_statement_id,
                    'reason' => $reason,
                    'corrected_by_user_id' => $actor->id,
                    'original' => $original->snapshot_json,
                    'original_amounts' => [
                        'gross_amount_halalas' => (int) $original->gross_amount_halalas,
                        'commission_amount_halalas' => (int) $original->commission_amount_halalas,
                        'vat_amount_halalas' => (int) $original->vat_amount_halalas,
                        'net_amount_halalas' => (int) $original->net_amount_halalas,
                    ],
                    'corrected_amounts' => [
                        'gross_amount_halalas' => $correctedGrossHalalas,
                        'commission_amount_halalas' => $correctedCommission,
                        'vat_amount_halalas' => $correctedVat,
                        'net_amount_halalas' => $correctedNet,
                        'commission_rate_percent' => $ratePercent,
                    ],
                    'delta' => $delta,
                ],
                'reason' => $reason,
                'created_by_user_id' => $actor->id,
                'idempotency_key' => "settlement-correction:item:{$original->id}:{$sequence}",
                'computed_at' => now(),
            ]);

            // ١) حركات عكسية مرتبطة، ٢) ثم القيود المصحَّحة — لا تصحيح بالحذف.
            $this->payables->reverseItemEntries($original, "تصحيح بند التسوية #{$original->id}: {$reason}", $actor->id);
            $this->payables->recordCorrection($original, $correction, $correctedGrossHalalas, $correctedCommission, $actor->id);

            // الختم الوحيد المسموح على بند مدفوع.
            $original->forceFill(['status' => SettlementItem::STATUS_ADJUSTED])->save();

            ActivityLogService::log(
                $original->company_id !== null ? (int) $original->company_id : null,
                $original,
                'settlement_item_corrected',
                "تصحيح بند التسوية #{$original->id} — السبب: {$reason}",
                [
                    'correction_item_id' => $correction->id,
                    'delta_net_halalas' => $delta['net'],
                    'reason' => $reason,
                ],
                $actor->id,
            );

            $this->notifyProvider($original, $correction, $reason);

            return $correction;
        });
    }

    /**
     * قالب A14 غير موجود بعد لهذا المفتاح — يمر بنص احتياطي معلن ويُسجَّل في
     * `notification_logs` ليضيف الأدمن قالبه لاحقاً بلا تغيير في الكود.
     */
    private function notifyProvider(SettlementItem $original, SettlementItem $correction, string $reason): void
    {
        $deltaNet = Money::format(abs((int) $correction->net_amount_halalas));
        // H §2: «خصم» ممنوعة في كل نص ظاهر — نقص المبلغ يُعبَّر عنه بـ«استقطاع».
        $direction = (int) $correction->net_amount_halalas >= 0 ? 'إضافة' : 'استقطاع';

        Notify::sendToId('settlement.item_corrected', Partner::class, (int) $original->partner_id, [
            'event' => (int) $original->event_id,
            'direction' => $direction,
            'amount' => $deltaNet,
            'reason' => $reason,
        ], [
            'fallback_title' => 'بند تصحيحي في كشفك التالي',
            'fallback_body' => "صُحّح بند الفعالية #{$original->event_id} — {$direction} {$deltaNet} ريال في الكشف التالي. السبب: {$reason}",
            'data' => [
                'settlement_item_id' => $original->id,
                'correction_item_id' => $correction->id,
                'delta_net_halalas' => (int) $correction->net_amount_halalas,
            ],
        ]);
    }
}

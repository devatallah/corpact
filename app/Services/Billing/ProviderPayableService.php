<?php

namespace App\Services\Billing;

use App\Enums\WalletTransactionType;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Wallet\LedgerService;

/**
 * دفتر مستحقات المزوّد — نفس دفتر A6 (H §12.5) لا دفتراً موازياً.
 *
 * لكل مزوّد محفظة `owner = Partner` بلا شركة، رصيدها = **ما تدين به تيمات
 * له الآن**، وكل تغيّر فيها قيد:
 *
 * | اللحظة | القيد | الأثر |
 * |---|---|---|
 * | الفعالية → `completed` | `settlement` **إيداع** بالإجمالي | استحقاق الفعالية |
 * | الفعالية → `completed` | `commission` **سحب** بالعمولة | «تُقتطع من مستحقاته ولا تُضاف على السعر» (H §12.7) |
 * | تسجيل الصرف بعد التحويل | `settlement` **سحب** بالصافي | إفراغ المستحق |
 *
 * فالرصيد بعد كل فعالية مكتملة = الصافي المستحق، وبعد الصرف = صفر. النوعان
 * `commission` و`settlement` من القائمة المغلقة في H §12.5.
 *
 * كل قيد بمفتاح تفرّد مشتق من الكيان: إعادة تشغيل المستمع أو المهمة لا تنتج
 * أثراً مزدوجاً أبداً.
 */
class ProviderPayableService
{
    public function __construct(private LedgerService $ledger) {}

    /**
     * محفظة مستحقات المزوّد (تُنشأ عند أول استخدام).
     */
    public function walletFor(Partner $partner): Wallet
    {
        return Wallet::query()->withoutGlobalScopes()->firstOrCreate(
            ['owner_type' => Partner::class, 'owner_id' => $partner->id],
            ['company_id' => null],
        );
    }

    /**
     * قيدا لحظة الاكتمال: استحقاق الإجمالي ثم اقتطاع العمولة.
     *
     * @return array{accrual: WalletTransaction, commission: ?WalletTransaction}
     */
    public function recordCompletion(Partner $partner, SettlementItem $item): array
    {
        $wallet = $this->walletFor($partner);
        $eventId = (int) $item->event_id;

        $accrual = $this->ledger->credit(
            $wallet,
            WalletTransactionType::Settlement,
            (int) $item->gross_amount_halalas,
            "provider-payable:event:{$eventId}:accrual",
            [
                'reference' => $item,
                'note' => "استحقاق الفعالية #{$eventId} عند الاكتمال",
            ],
        );

        $commission = null;
        if ((int) $item->commission_amount_halalas > 0) {
            $commission = $this->ledger->debit(
                $wallet,
                WalletTransactionType::Commission,
                (int) $item->commission_amount_halalas,
                "provider-payable:event:{$eventId}:commission",
                [
                    'reference' => $item,
                    'relatedTransactionId' => $accrual->id,
                    'note' => "عمولة تيمات على الفعالية #{$eventId} — تُقتطع من المستحقات",
                ],
            );
        }

        return ['accrual' => $accrual, 'commission' => $commission];
    }

    /**
     * قيد الصرف بعد التحويل البنكي الفعلي.
     */
    public function recordPayout(SettlementStatement $statement): ?WalletTransaction
    {
        if ((int) $statement->net_amount_halalas <= 0) {
            return null;
        }

        return $this->ledger->debit(
            $this->walletFor($statement->partner),
            WalletTransactionType::Settlement,
            (int) $statement->net_amount_halalas,
            "provider-payout:statement:{$statement->id}",
            [
                'reference' => $statement,
                'actorUserId' => $statement->paid_by_user_id !== null ? (int) $statement->paid_by_user_id : null,
                'note' => "صرف كشف التسوية #{$statement->id} ({$statement->period_key})",
                // العكس والتصحيح قد يسبقان الاستحقاق زمنياً — الرصيد السالب
                // يلتقطه فحص المطابقة خلال ساعة ولا يُصحَّح آلياً (A6).
                'allowNegative' => true,
            ],
        );
    }

    /**
     * حركة عكسية مرتبطة لقيود بند تُصحَّح (القاعدة: لا تصحيح بالحذف).
     *
     * @return WalletTransaction[]
     */
    public function reverseItemEntries(SettlementItem $item, string $reason, ?int $actorUserId = null): array
    {
        $eventId = (int) $item->event_id;

        $originals = WalletTransaction::query()
            ->whereIn('idempotency_key', [
                "provider-payable:event:{$eventId}:accrual",
                "provider-payable:event:{$eventId}:commission",
            ])
            ->get();

        $reversals = [];

        foreach ($originals as $original) {
            $reversals[] = $this->ledger->reverse(
                $original,
                "settlement-correction:item:{$item->id}:reverse:{$original->id}",
                $reason,
                $actorUserId,
            );
        }

        return $reversals;
    }

    /**
     * قيدا البند المصحَّح — بمفتاح تفرّد مشتق من البند التصحيحي.
     */
    public function recordCorrection(SettlementItem $original, SettlementItem $correction, int $correctedGrossHalalas, int $correctedCommissionHalalas, ?int $actorUserId = null): void
    {
        $wallet = $this->walletFor($correction->partner);

        if ($correctedGrossHalalas > 0) {
            $accrual = $this->ledger->credit(
                $wallet,
                WalletTransactionType::Settlement,
                $correctedGrossHalalas,
                "settlement-correction:item:{$correction->id}:accrual",
                [
                    'reference' => $correction,
                    'actorUserId' => $actorUserId,
                    'note' => "استحقاق مصحَّح للبند #{$original->id}",
                ],
            );

            if ($correctedCommissionHalalas > 0) {
                $this->ledger->debit(
                    $wallet,
                    WalletTransactionType::Commission,
                    $correctedCommissionHalalas,
                    "settlement-correction:item:{$correction->id}:commission",
                    [
                        'reference' => $correction,
                        'actorUserId' => $actorUserId,
                        'relatedTransactionId' => $accrual->id,
                        'note' => "عمولة مصحَّحة للبند #{$original->id}",
                        // تصحيح بند صُرف سلفاً يترك مستحقاً سالباً (زيادة
                        // مصروفة تُخصم من الكشف التالي) — مسموح ومقصود،
                        // ويلتقطه فحص المطابقة ولا يُصحَّح آلياً.
                        'allowNegative' => true,
                    ],
                );
            }
        }
    }
}

<?php

namespace Tests\Support;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Support\Money;
use PHPUnit\Framework\Assert;

/**
 * الثوابت المالية التي يجب أن تصدق في **نهاية كل سيناريو قبول يمس المال**
 * (H §12.5 + خلاصة H §25: «إن كانت آلة الحالات صحيحة والدفتر المالي متوازناً
 * وعزل الشركات محكماً، فبقية المنتج شاشات»).
 *
 * ثلاثة ثوابت لا استثناء لها:
 *
 * 1. **الرصيد = Σ الدفتر** لكل محفظة بلا استثناء — عمود `balance_halalas`
 *    ذاكرةٌ مؤقتة لا مصدر حقيقة، ولا يجوز أن ينحرف عن مجموع الحركات
 *    (هذا بالضبط ما تفحصه مهمة `app:reconcile-balances` ليلياً).
 * 2. **لا حجز يتيم**: حجز نشط (`active`) على فعالية غادرت `awaiting_payment`
 *    يعني مالاً محبوساً بلا مبرر — يجب أن يكون قد استُقطع (تأكدت) أو فُكّ
 *    (أُلغيت).
 * 3. **بصمة كل حجز في الدفتر تطابق حالته**: نشط = قيد `hold` وحده، مفكوك =
 *    `hold` + `hold_release`، مستقطَع = `hold` + `hold_release` + `capture`
 *    بالمبلغ المستقطَع. لا حجز بلا قيد ولا قيد بلا حجز.
 */
final class FinancialInvariants
{
    private function __construct() {}

    /**
     * الثوابت الثلاثة معاً — النداء الافتراضي في نهاية سيناريوهات المال.
     */
    public static function assertAll(): void
    {
        self::assertLedgerEqualsBalances();
        self::assertNoOrphanHolds();
        self::assertHoldLedgerFootprints();
    }

    /**
     * الثابت الأول: لكل محفظة، الرصيد المخزَّن = Σ (إيداع − سحب) في الدفتر،
     * ولا رصيد سالب.
     */
    public static function assertLedgerEqualsBalances(): void
    {
        $ledgerSums = WalletTransaction::query()
            ->selectRaw("wallet_id, COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_halalas ELSE -amount_halalas END), 0) as ledger_balance")
            ->groupBy('wallet_id')
            ->pluck('ledger_balance', 'wallet_id');

        foreach (Wallet::query()->withoutGlobalScopes()->get() as $wallet) {
            $ledger = (int) ($ledgerSums[$wallet->id] ?? 0);
            $cached = (int) $wallet->balance_halalas;

            Assert::assertSame(
                $ledger,
                $cached,
                "المحفظة #{$wallet->id} ({$wallet->owner_type}#{$wallet->owner_id}): الرصيد المخزَّن "
                .Money::format($cached).' لا يطابق مجموع الدفتر '.Money::format($ledger).'.',
            );

            Assert::assertGreaterThanOrEqual(
                0,
                $ledger,
                "المحفظة #{$wallet->id} برصيد سالب ".Money::format($ledger).' — «الرصيد السالب لا يبقى ساعة» (H §12.5).',
            );
        }
    }

    /**
     * الثابت الثاني: لا حجز نشط على فعالية خرجت من نافذة التحصيل.
     */
    public static function assertNoOrphanHolds(): void
    {
        $orphans = [];

        $active = WalletHold::query()
            ->where('status', WalletHold::STATUS_ACTIVE)
            ->where('reference_type', Event::class)
            ->get();

        foreach ($active as $hold) {
            $status = Event::withoutGlobalScopes()->whereKey($hold->reference_id)->value('status');

            if ($status !== null && $status !== EventStatus::AwaitingPayment->value) {
                $orphans[] = "حجز #{$hold->id} ({$hold->idempotency_key}) ما زال نشطاً والفعالية #{$hold->reference_id} في الحالة «{$status}»";
            }
        }

        Assert::assertSame([], $orphans, 'حجوزات يتيمة — مال محبوس بلا مبرر: '.implode(' · ', $orphans));
    }

    /**
     * الثابت الثالث: بصمة كل حجز في الدفتر تطابق حالته.
     */
    public static function assertHoldLedgerFootprints(): void
    {
        foreach (WalletHold::query()->get() as $hold) {
            $key = (string) $hold->idempotency_key;

            $held = WalletTransaction::query()->where('idempotency_key', "hold:{$key}")->first();
            $released = WalletTransaction::query()->where('idempotency_key', "hold-release:{$key}")->first();
            $captured = WalletTransaction::query()->where('idempotency_key', "capture:{$key}")->first();

            Assert::assertNotNull($held, "الحجز «{$key}» بلا قيد `hold` في الدفتر.");
            Assert::assertSame((int) $hold->amount_halalas, (int) $held->amount_halalas, "قيد الحجز «{$key}» بمبلغ مخالف للحجز.");

            if ($hold->status === WalletHold::STATUS_ACTIVE) {
                Assert::assertNull($released, "حجز نشط «{$key}» ومعه قيد فك حجز.");
                Assert::assertNull($captured, "حجز نشط «{$key}» ومعه قيد استقطاع.");

                continue;
            }

            Assert::assertNotNull($released, "الحجز «{$key}» انتهى بلا قيد `hold_release` — المحجوز لم يُعَد للرصيد.");
            Assert::assertSame((int) $hold->amount_halalas, (int) $released->amount_halalas, "قيد فك الحجز «{$key}» لا يعيد كامل المحجوز.");

            if ($hold->status === WalletHold::STATUS_RELEASED) {
                Assert::assertNull($captured, "حجز مفكوك «{$key}» ومعه قيد استقطاع.");

                continue;
            }

            $capturedAmount = (int) $hold->captured_amount_halalas;

            if ($capturedAmount === 0) {
                Assert::assertNull($captured, "حجز استُقطع منه صفر «{$key}» ومعه قيد استقطاع.");

                continue;
            }

            Assert::assertNotNull($captured, "حجز مستقطَع «{$key}» بلا قيد `capture`.");
            Assert::assertSame($capturedAmount, (int) $captured->amount_halalas, "قيد الاستقطاع «{$key}» بمبلغ مخالف للمستقطَع.");
        }
    }

    /**
     * أداة سيناريو «بلا أي استقطاع» (H §23 سيناريو 4): لا حركة دفتر واحدة
     * تخص هذه الفعالية — لا حجزاً ولا استقطاعاً ولا استرداداً.
     */
    public static function assertNoLedgerActivityFor(Event $event): void
    {
        $rows = WalletTransaction::query()
            ->where('reference_type', Event::class)
            ->where('reference_id', $event->id)
            ->get()
            ->map(fn (WalletTransaction $tx) => $tx->type->value.':'.$tx->idempotency_key)
            ->all();

        Assert::assertSame([], $rows, 'حركات دفتر على فعالية يجب ألا يُستقطع فيها شيء: '.implode(' · ', $rows));

        Assert::assertSame(
            0,
            WalletHold::query()->where('reference_type', Event::class)->where('reference_id', $event->id)->count(),
            'حجز على فعالية يجب ألا يُستقطع فيها شيء.',
        );
    }

    /**
     * مجموع الدفتر لمحفظة بعينها — يُستعمل لتأكيد الرصيد خطوة بخطوة.
     */
    public static function ledgerBalance(Wallet $wallet): int
    {
        return (int) WalletTransaction::query()
            ->where('wallet_id', $wallet->id)
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_halalas ELSE -amount_halalas END), 0) as balance")
            ->value('balance');
    }
}

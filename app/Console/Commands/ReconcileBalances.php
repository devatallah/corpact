<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\JobRun;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Notifications\CriticalAlertService;
use Illuminate\Console\Command;

/**
 * مطابقة الرصيد المخزَّن (cache) مع Σ دفتر الحركات (H §12.5 + §20).
 *
 * - كامل (ليلياً 04:00): كل محفظة، cache مقابل Σ الدفتر، أي فرق =
 *   Log::critical بمفتاح idempotency عبر JobRun::runOnce (محفظة + يوم) كي
 *   لا يتكرر نفس التنبيه في اليوم الواحد.
 * - سريع (`--negatives-only`, كل ساعة): الرصيد السالب لا يبقى ساعة بلا
 *   تنبيه — يصرخ في كل تشغيل ما دام السالب قائماً (التكرار مقصود).
 *
 * لا تصحيح آلياً أبداً: الدفتر هو الحقيقة، والتصحيح قرار بشري بحركة عكسية.
 */
class ReconcileBalances extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:reconcile-balances {--negatives-only : فحص سريع للأرصدة السالبة فقط}';

    protected $description = 'مطابقة الرصيد المخزَّن مع دفتر الحركات (H §20 — يومياً 04:00 + فحص سالب كل ساعة)';

    public function handle(): int
    {
        $this->recordHeartbeat();

        if ($this->option('negatives-only')) {
            return $this->checkNegatives();
        }

        return $this->fullReconciliation();
    }

    private function fullReconciliation(): int
    {
        $mismatches = 0;

        $ledgerSums = WalletTransaction::query()
            ->selectRaw("wallet_id, COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_halalas ELSE -amount_halalas END), 0) as ledger_balance")
            ->groupBy('wallet_id')
            ->pluck('ledger_balance', 'wallet_id');

        foreach (Wallet::query()->withoutGlobalScopes()->cursor() as $wallet) {
            $ledger = (int) ($ledgerSums[$wallet->id] ?? 0);
            $cached = (int) $wallet->balance_halalas;

            if ($cached === $ledger && $cached >= 0) {
                continue;
            }

            $mismatches++;

            JobRun::runOnce(
                'reconcile-balances',
                Wallet::class,
                $wallet->id,
                now()->toDateString(),
                function () use ($wallet, $cached, $ledger) {
                    if ($cached !== $ledger) {
                        app(CriticalAlertService::class)->raise(
                            key: 'wallet.reconciliation_mismatch',
                            title: 'مطابقة المحافظ: الرصيد المخزَّن لا يطابق مجموع الدفتر — تحقيق فوري مطلوب، التصحيح بحركة عكسية موثقة لا بتعديل مباشر.',
                            body: "الفرق {$cached} − {$ledger} هللة.",
                            context: [
                                'wallet_id' => $wallet->id,
                                'owner_type' => $wallet->owner_type,
                                'owner_id' => $wallet->owner_id,
                                'cached_halalas' => $cached,
                                'ledger_halalas' => $ledger,
                                'difference_halalas' => $cached - $ledger,
                            ],
                        );
                    }

                    if ($cached < 0 || $ledger < 0) {
                        app(CriticalAlertService::class)->raise(
                            key: 'wallet.negative_balance',
                            title: 'مطابقة المحافظ: رصيد سالب — لا يجوز أن يبقى ساعة.',
                            context: [
                                'wallet_id' => $wallet->id,
                                'owner_type' => $wallet->owner_type,
                                'owner_id' => $wallet->owner_id,
                                'cached_halalas' => $cached,
                                'ledger_halalas' => $ledger,
                            ],
                        );
                    }
                },
            );
        }

        $this->info($mismatches === 0
            ? 'كل المحافظ مطابقة — الرصيد المخزَّن = Σ الدفتر.'
            : "فروقات مكتشفة: {$mismatches} محفظة — انظر السجل الحرج.");

        return $mismatches === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function checkNegatives(): int
    {
        $negatives = Wallet::query()->withoutGlobalScopes()
            ->where('balance_halalas', '<', 0)
            ->get();

        // التكرار كل ساعة مقصود: السالب القائم يصرخ حتى يُعالج.
        foreach ($negatives as $wallet) {
            // `alwaysLog` عمداً: الصف في صندوق الأدمن يبقى واحداً مجمَّعاً،
            // لكن السجل يصرخ كل ساعة حتى يُعالج السالب (H §12.5).
            app(CriticalAlertService::class)->raise(
                key: 'wallet.negative_balance',
                title: 'فحص الساعة: رصيد محفظة سالب — لا يجوز أن يبقى ساعة.',
                context: [
                    'wallet_id' => $wallet->id,
                    'owner_type' => $wallet->owner_type,
                    'owner_id' => $wallet->owner_id,
                    'cached_halalas' => (int) $wallet->balance_halalas,
                ],
                alwaysLog: true,
            );
        }

        $this->info($negatives->isEmpty() ? 'لا أرصدة سالبة.' : "أرصدة سالبة: {$negatives->count()}.");

        return $negatives->isEmpty() ? self::SUCCESS : self::FAILURE;
    }
}

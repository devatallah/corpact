<?php

namespace App\Services\Wallet;

use App\Enums\WalletTransactionType;
use App\Exceptions\InsufficientBalanceException;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * البوابة الوحيدة لتحريك المال (H §12.5 + القاعدتان الماليتان في G):
 *
 * ١) لا يُعدَّل رصيد مباشرة — كل تغيّر يمر بقيد في الدفتر، وعمود الرصيد
 *    المخزَّن cache يُحدَّث هنا حصراً داخل نفس معاملة قاعدة البيانات.
 * ٢) لا يُصحَّح خطأ بالحذف — التصحيح بحركة عكسية مرتبطة بالأصلية.
 *
 * كل عملية تقفل صف المحفظة (lockForUpdate) وتتحقق من مفتاح التفرّد قبل أي
 * أثر: إعادة تشغيل نفس المفتاح تعيد الحركة القائمة دون أثر مزدوج.
 * المبالغ كلها بالهللة (integer) — لا float في هذا النطاق أبداً.
 */
class LedgerService
{
    /**
     * قيد إيداع (credit) على محفظة.
     *
     * @param  array{reference?: Model|null, actorUserId?: int|null, relatedTransactionId?: int|null, note?: string|null}  $options
     */
    public function credit(Wallet $wallet, WalletTransactionType $type, int $amountHalalas, string $idempotencyKey, array $options = []): WalletTransaction
    {
        return $this->record($wallet, $type, $amountHalalas, WalletTransaction::DIRECTION_CREDIT, $idempotencyKey, $options);
    }

    /**
     * قيد سحب (debit) على محفظة. يرفض تجاوز الرصيد إلا حين يكون السحب
     * عكساً لاعتماد سابق (`allowNegative`) — والرصيد السالب يلتقطه فحص
     * المطابقة خلال ساعة وينبّه عليه.
     *
     * @param  array{reference?: Model|null, actorUserId?: int|null, relatedTransactionId?: int|null, note?: string|null, allowNegative?: bool}  $options
     */
    public function debit(Wallet $wallet, WalletTransactionType $type, int $amountHalalas, string $idempotencyKey, array $options = []): WalletTransaction
    {
        return $this->record($wallet, $type, $amountHalalas, WalletTransaction::DIRECTION_DEBIT, $idempotencyKey, $options);
    }

    /**
     * تخصيص من المحفظة الرئيسية إلى محفظة مجتمع فرعية — زوج قيود مرتبطين
     * (allocation سحب من الرئيسية + allocation إيداع في الفرعية) في معاملة
     * واحدة.
     *
     * @return array{out: WalletTransaction, in: WalletTransaction}
     */
    public function allocate(Wallet $from, Wallet $to, int $amountHalalas, string $idempotencyKeyBase, ?int $actorUserId = null, ?string $note = null): array
    {
        if ($from->id === $to->id) {
            throw new InvalidArgumentException('لا يمكن التخصيص من محفظة إلى نفسها.');
        }

        return DB::transaction(function () use ($from, $to, $amountHalalas, $idempotencyKeyBase, $actorUserId, $note) {
            $out = $this->debit($from, WalletTransactionType::Allocation, $amountHalalas, "{$idempotencyKeyBase}:out", [
                'reference' => $to->owner,
                'actorUserId' => $actorUserId,
                'note' => $note,
            ]);

            $in = $this->credit($to, WalletTransactionType::Allocation, $amountHalalas, "{$idempotencyKeyBase}:in", [
                'reference' => $from->owner,
                'actorUserId' => $actorUserId,
                'relatedTransactionId' => $out->id,
                'note' => $note,
            ]);

            return ['out' => $out, 'in' => $in];
        });
    }

    /**
     * عكس تخصيص سابق — زوج allocation_reversal مرتبط بساقي الأصل.
     *
     * @return array{out: WalletTransaction, in: WalletTransaction}
     */
    public function reverseAllocation(WalletTransaction $allocationOut, WalletTransaction $allocationIn, string $idempotencyKeyBase, ?int $actorUserId = null, ?string $note = null): array
    {
        if ($allocationOut->type !== WalletTransactionType::Allocation || $allocationIn->type !== WalletTransactionType::Allocation) {
            throw new InvalidArgumentException('يمكن عكس قيود التخصيص فقط بهذه العملية.');
        }

        return DB::transaction(function () use ($allocationOut, $allocationIn, $idempotencyKeyBase, $actorUserId, $note) {
            // سحب من الفرعية (قد يكون رصيدها استُهلك — العكس مسموح بالسالب
            // ليُلتقط في المطابقة).
            $out = $this->debit($allocationIn->wallet, WalletTransactionType::AllocationReversal, $allocationIn->amount_halalas, "{$idempotencyKeyBase}:out", [
                'actorUserId' => $actorUserId,
                'relatedTransactionId' => $allocationIn->id,
                'note' => $note,
                'allowNegative' => true,
            ]);

            $in = $this->credit($allocationOut->wallet, WalletTransactionType::AllocationReversal, $allocationOut->amount_halalas, "{$idempotencyKeyBase}:in", [
                'actorUserId' => $actorUserId,
                'relatedTransactionId' => $allocationOut->id,
                'note' => $note,
            ]);

            return ['out' => $out, 'in' => $in];
        });
    }

    /**
     * حجز مبلغ (hold): قيد سحب فوري يخفض الرصيد المتاح + صف حجز نشط.
     */
    public function hold(Wallet $wallet, int $amountHalalas, string $idempotencyKey, ?Model $reference = null, ?int $actorUserId = null, ?string $note = null): WalletHold
    {
        return DB::transaction(function () use ($wallet, $amountHalalas, $idempotencyKey, $reference, $actorUserId, $note) {
            $existing = WalletHold::query()->where('idempotency_key', $idempotencyKey)->first();
            if ($existing !== null) {
                return $existing;
            }

            $transaction = $this->debit($wallet, WalletTransactionType::Hold, $amountHalalas, "hold:{$idempotencyKey}", [
                'reference' => $reference,
                'actorUserId' => $actorUserId,
                'note' => $note,
            ]);

            return WalletHold::create([
                'wallet_id' => $wallet->id,
                'amount_halalas' => $amountHalalas,
                'status' => WalletHold::STATUS_ACTIVE,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'actor_user_id' => $actorUserId,
                'hold_transaction_id' => $transaction->id,
                'idempotency_key' => $idempotencyKey,
                'note' => $note,
            ]);
        });
    }

    /**
     * فك حجز نشط بالكامل: قيد hold_release (إيداع) مرتبط بقيد الحجز.
     * idempotent: فك حجز مفكوك يعيد الصف كما هو.
     */
    public function releaseHold(WalletHold $hold, ?int $actorUserId = null, ?string $note = null): WalletHold
    {
        return DB::transaction(function () use ($hold, $actorUserId, $note) {
            $hold = WalletHold::query()->lockForUpdate()->findOrFail($hold->id);

            if ($hold->status !== WalletHold::STATUS_ACTIVE) {
                return $hold;
            }

            $this->credit($hold->wallet, WalletTransactionType::HoldRelease, $hold->amount_halalas, "hold-release:{$hold->idempotency_key}", [
                'actorUserId' => $actorUserId,
                'relatedTransactionId' => $hold->hold_transaction_id,
                'note' => $note,
            ]);

            $hold->update([
                'status' => WalletHold::STATUS_RELEASED,
                'released_at' => now(),
            ]);

            return $hold;
        });
    }

    /**
     * استقطاع حجز نشط (كلياً أو جزئياً): قيد hold_release يعيد كامل المحجوز
     * ثم قيد capture يسحب الجزء المستقطع — فيبقى الرصيد = Σ الدفتر، ويعود
     * الفرق (إن وُجد) متاحاً تلقائياً.
     */
    public function captureHold(WalletHold $hold, ?int $amountHalalas = null, ?int $actorUserId = null, ?string $note = null): WalletHold
    {
        return DB::transaction(function () use ($hold, $amountHalalas, $actorUserId, $note) {
            $hold = WalletHold::query()->lockForUpdate()->findOrFail($hold->id);
            $amountHalalas ??= $hold->amount_halalas;

            if ($hold->status === WalletHold::STATUS_CAPTURED) {
                return $hold;
            }

            if ($hold->status !== WalletHold::STATUS_ACTIVE) {
                throw new InvalidArgumentException('لا يمكن استقطاع حجز غير نشط.');
            }

            if ($amountHalalas < 0 || $amountHalalas > $hold->amount_halalas) {
                throw new InvalidArgumentException('مبلغ الاستقطاع يتجاوز المبلغ المحجوز.');
            }

            $this->credit($hold->wallet, WalletTransactionType::HoldRelease, $hold->amount_halalas, "hold-release:{$hold->idempotency_key}", [
                'actorUserId' => $actorUserId,
                'relatedTransactionId' => $hold->hold_transaction_id,
                'note' => $note,
            ]);

            if ($amountHalalas > 0) {
                $this->debit($hold->wallet, WalletTransactionType::Capture, $amountHalalas, "capture:{$hold->idempotency_key}", [
                    'reference' => $hold->reference_type !== null ? $hold->reference : null,
                    'actorUserId' => $actorUserId,
                    'relatedTransactionId' => $hold->hold_transaction_id,
                    'note' => $note,
                ]);
            }

            $hold->update([
                'status' => WalletHold::STATUS_CAPTURED,
                'captured_amount_halalas' => $amountHalalas,
                'captured_at' => now(),
            ]);

            return $hold;
        });
    }

    /**
     * حركة عكسية مرتبطة لتصحيح قيد سابق (القاعدة ٢): الاتجاه المعاكس، النوع
     * allocation ← allocation_reversal وما سواه ← adjustment، بسبب إلزامي.
     */
    public function reverse(WalletTransaction $original, string $idempotencyKey, string $reason, ?int $actorUserId = null): WalletTransaction
    {
        $type = $original->type === WalletTransactionType::Allocation
            ? WalletTransactionType::AllocationReversal
            : WalletTransactionType::Adjustment;

        $direction = $original->direction === WalletTransaction::DIRECTION_CREDIT
            ? WalletTransaction::DIRECTION_DEBIT
            : WalletTransaction::DIRECTION_CREDIT;

        return $this->record($original->wallet, $type, $original->amount_halalas, $direction, $idempotencyKey, [
            'actorUserId' => $actorUserId,
            'relatedTransactionId' => $original->id,
            'note' => $reason,
            // عكس اعتماد قد يسبق رصيده الاستهلاك — يُسمح بالسالب ليُلتقط
            // في المطابقة وينبَّه عليه (لا يبقى ساعة).
            'allowNegative' => true,
        ]);
    }

    /**
     * الرصيد الحقيقي: Σ الدفتر بالهللة (credit − debit).
     */
    public function balanceFromLedger(Wallet $wallet): int
    {
        $sums = WalletTransaction::query()
            ->where('wallet_id', $wallet->id)
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_halalas ELSE -amount_halalas END), 0) as balance")
            ->value('balance');

        return (int) $sums;
    }

    /**
     * القيد الفعلي — كل الطرق العامة تمر من هنا.
     *
     * @param  array{reference?: Model|null, actorUserId?: int|null, relatedTransactionId?: int|null, note?: string|null, allowNegative?: bool}  $options
     */
    private function record(Wallet $wallet, WalletTransactionType $type, int $amountHalalas, string $direction, string $idempotencyKey, array $options = []): WalletTransaction
    {
        if ($amountHalalas <= 0) {
            throw new InvalidArgumentException('مبلغ الحركة يجب أن يكون أكبر من صفر (بالهللة).');
        }

        return DB::transaction(function () use ($wallet, $type, $amountHalalas, $direction, $idempotencyKey, $options) {
            // مفتاح التفرّد أولاً: نفس المفتاح = نفس الحركة، لا أثر مزدوج.
            $existing = WalletTransaction::query()->where('idempotency_key', $idempotencyKey)->first();
            if ($existing !== null) {
                return $existing;
            }

            /** @var Wallet $locked */
            $locked = Wallet::query()->withoutGlobalScopes()->lockForUpdate()->findOrFail($wallet->id);

            $delta = $direction === WalletTransaction::DIRECTION_CREDIT ? $amountHalalas : -$amountHalalas;

            if ($delta < 0 && ! ($options['allowNegative'] ?? false) && $locked->balance_halalas + $delta < 0) {
                throw new InsufficientBalanceException;
            }

            $reference = $options['reference'] ?? null;

            $transaction = WalletTransaction::create([
                'wallet_id' => $locked->id,
                'type' => $type,
                'amount_halalas' => $amountHalalas,
                'direction' => $direction,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'actor_user_id' => $options['actorUserId'] ?? null,
                'related_transaction_id' => $options['relatedTransactionId'] ?? null,
                'idempotency_key' => $idempotencyKey,
                'note' => $options['note'] ?? null,
                'occurred_at' => now(),
            ]);

            // تحديث الـ cache في نفس المعاملة — الشرط الوحيد المسموح به لوجوده.
            Wallet::query()->withoutGlobalScopes()->whereKey($locked->id)
                ->update(['balance_halalas' => $locked->balance_halalas + $delta]);

            $wallet->balance_halalas = $locked->balance_halalas + $delta;

            return $transaction;
        });
    }
}

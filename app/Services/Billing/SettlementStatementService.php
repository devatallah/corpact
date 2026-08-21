<?php

namespace App\Services\Billing;

use App\Models\Event;
use App\Models\JobRun;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Events\EventStateMachine;
use App\Support\Authorization\SelfApprovalGuard;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * دورة حياة كشف التسوية (H §12.7 + G/الأدمن المالي §3).
 *
 * ١) **التوليد كل 15 يوماً لكل مزوّد**: الفترة الأولى 1–15 والثانية 16–آخر
 *    الشهر، ويُولَّد صباح اليوم التالي لانتهائها (1 و16 — H §20). يجمع الكشف
 *    كل بند `pending` للمزوّد حتى نهاية الفترة، بما فيه أي **بند تصحيحي**
 *    نشأ بعد كشف مدفوع — وهذا بالضبط معنى «في الكشف التالي».
 * ٢) **draft ← approved ← paid** بلا قفزات.
 * ٣) **المنشئ لا يعتمد ولا يصرف** — `SelfApprovalGuard`.
 * ٤) **لا صرف قبل اعتماد الحساب البنكي** — `Partner::payoutsBlocked()`.
 * ٥) **الصرف يُسجَّل بعد التحويل الفعلي**، وعندها فقط تنتقل الفعاليات إلى
 *    `settled` عبر آلة A7 ويُقيَّد الصرف في الدفتر.
 */
class SettlementStatementService
{
    public function __construct(
        private ProviderPayableService $payables,
        private EventStateMachine $machine,
    ) {}

    /**
     * الفترة المنتهية عند تشغيل المهمة في تاريخ ما.
     *
     * @return array{key: string, start: Carbon, end: Carbon}
     */
    public function periodEndingBefore(?Carbon $runAt = null): array
    {
        $runAt = ($runAt ?? Carbon::now())->copy();
        $split = (int) config('billing.settlement.period_split_day', 15);

        if ($runAt->day > $split) {
            // نحن في النصف الثاني: الفترة المنتهية هي 1 → 15 من هذا الشهر.
            $start = $runAt->copy()->startOfMonth();
            $end = $runAt->copy()->startOfMonth()->addDays($split - 1);
            $key = $start->format('Y-m').'-P1';
        } else {
            // نحن في النصف الأول: الفترة المنتهية هي 16 → آخر الشهر الماضي.
            $previous = $runAt->copy()->startOfMonth()->subMonth();
            $start = $previous->copy()->addDays($split);
            $end = $previous->copy()->endOfMonth()->startOfDay();
            $key = $previous->format('Y-m').'-P2';
        }

        return ['key' => $key, 'start' => $start->startOfDay(), 'end' => $end->startOfDay()];
    }

    /**
     * توليد كشوف كل المزوّدين الذين لهم بنود معلّقة في الفترة.
     * مفتاح idempotency لكل (مزوّد + مهمة + فترة) عبر `JobRun::runOnce`.
     *
     * @param  array{key: string, start: Carbon, end: Carbon}  $period
     * @return array{generated: int, skipped: int}
     */
    public function generateAll(array $period, ?User $actor = null): array
    {
        $partnerIds = SettlementItem::query()
            ->where('status', SettlementItem::STATUS_PENDING)
            ->where('computed_at', '<=', $period['end']->copy()->endOfDay())
            ->distinct()
            ->pluck('partner_id');

        $generated = 0;
        $skipped = 0;

        foreach ($partnerIds as $partnerId) {
            $partner = Partner::find($partnerId);

            if ($partner === null) {
                continue;
            }

            $statement = null;

            $ran = JobRun::runOnce(
                job: 'settlement:generate-statement',
                entityType: 'partner',
                entityId: (int) $partnerId,
                period: $period['key'],
                callback: function () use ($partner, $period, $actor, &$statement): void {
                    $statement = $this->generateFor($partner, $period, $actor);
                },
            );

            if ($ran && $statement !== null) {
                $generated++;
            } else {
                $skipped++;
            }
        }

        return ['generated' => $generated, 'skipped' => $skipped];
    }

    /**
     * توليد كشف مزوّد واحد عن فترة. يعيد null إذا لا بنود معلّقة أو إذا كان
     * كشف الفترة مولَّداً سلفاً (idempotent).
     *
     * @param  array{key: string, start: Carbon, end: Carbon}  $period
     */
    public function generateFor(Partner $partner, array $period, ?User $actor = null): ?SettlementStatement
    {
        $existing = SettlementStatement::query()
            ->where('partner_id', $partner->id)
            ->where('period_key', $period['key'])
            ->first();

        if ($existing !== null) {
            return null;
        }

        return DB::transaction(function () use ($partner, $period, $actor): ?SettlementStatement {
            $items = SettlementItem::query()
                ->where('partner_id', $partner->id)
                ->where('status', SettlementItem::STATUS_PENDING)
                ->where('computed_at', '<=', $period['end']->copy()->endOfDay())
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                return null;
            }

            $statement = SettlementStatement::create([
                'partner_id' => $partner->id,
                'period_key' => $period['key'],
                'period_start' => $period['start']->toDateString(),
                'period_end' => $period['end']->toDateString(),
                'status' => SettlementStatement::STATUS_DRAFT,
                'items_count' => $items->count(),
                'gross_amount_halalas' => (int) $items->sum('gross_amount_halalas'),
                'commission_amount_halalas' => (int) $items->sum('commission_amount_halalas'),
                'vat_amount_halalas' => (int) $items->sum('vat_amount_halalas'),
                'net_amount_halalas' => (int) $items->sum('net_amount_halalas'),
                'generated_by_user_id' => $actor?->id,
            ]);

            foreach ($items as $item) {
                $item->forceFill([
                    'settlement_statement_id' => $statement->id,
                    'status' => SettlementItem::STATUS_INCLUDED,
                ])->save();
            }

            $this->notifyReady($partner, $statement);

            return $statement;
        });
    }

    /**
     * اعتماد الكشف — الأدمن المالي، وليس من ولّده.
     */
    public function approve(SettlementStatement $statement, User $actor): SettlementStatement
    {
        if ($statement->status !== SettlementStatement::STATUS_DRAFT) {
            throw new RuntimeException('لا يُعتمد إلا كشف في حالة مسودة.');
        }

        SelfApprovalGuard::assertNotSelfApproval($actor, $statement);

        $statement->forceFill([
            'status' => SettlementStatement::STATUS_APPROVED,
            'approved_by_user_id' => $actor->id,
            'approved_at' => now(),
        ])->save();

        ActivityLogService::log(
            null,
            $statement,
            'settlement_statement_approved',
            "اعتماد كشف التسوية #{$statement->id} للمزوّد {$statement->partner->name} بصافي ".Money::format((int) $statement->net_amount_halalas).' ريال',
            ['period_key' => $statement->period_key, 'net_amount_halalas' => (int) $statement->net_amount_halalas],
            $actor->id,
        );

        return $statement;
    }

    /**
     * تسجيل الصرف **بعد التحويل البنكي الفعلي**: الفعاليات تنتقل إلى
     * `settled` عبر آلة A7، ويُقيَّد الصرف في دفتر المستحقات.
     */
    public function markPaid(SettlementStatement $statement, User $actor, string $payoutReference, ?Carbon $transferredAt = null): SettlementStatement
    {
        if ($statement->status !== SettlementStatement::STATUS_APPROVED) {
            throw new RuntimeException('لا يُسجَّل الصرف إلا لكشف معتمد.');
        }

        // «تحقق أن الحساب البنكي للمزوّد معتمد قبل أي صرف» (G/الأدمن المالي §3).
        if ($statement->partner->payoutsBlocked()) {
            throw new RuntimeException('حساب المزوّد البنكي غير معتمد — لا صرف قبل اعتماده.');
        }

        SelfApprovalGuard::assertNotSelfApproval($actor, $statement);

        if (trim($payoutReference) === '') {
            throw new RuntimeException('مرجع التحويل مطلوب لتسجيل الصرف.');
        }

        return DB::transaction(function () use ($statement, $actor, $payoutReference, $transferredAt): SettlementStatement {
            $statement->forceFill([
                'status' => SettlementStatement::STATUS_PAID,
                'paid_by_user_id' => $actor->id,
                'paid_at' => now(),
                'transferred_at' => $transferredAt ?? now(),
                'payout_reference' => $payoutReference,
            ])->save();

            foreach ($statement->items()->get() as $item) {
                $item->forceFill(['status' => SettlementItem::STATUS_PAID])->save();

                // «سجّل الصرف بعد التحويل الفعلي، فتنتقل الفعاليات إلى مسوّاة».
                // البند التصحيحي يخص فعالية سُوّيت سلفاً — لا انتقال ثانٍ.
                $event = Event::withoutGlobalScopes()->find($item->event_id);

                if ($event !== null && (string) $event->status === 'completed') {
                    $this->machine->settle($event, $actor, "صُرف كشف التسوية #{$statement->id}");
                }
            }

            $this->payables->recordPayout($statement);

            ActivityLogService::log(
                null,
                $statement,
                'settlement_statement_paid',
                "تسجيل صرف كشف التسوية #{$statement->id} بمرجع {$payoutReference}",
                [
                    'period_key' => $statement->period_key,
                    'net_amount_halalas' => (int) $statement->net_amount_halalas,
                    'payout_reference' => $payoutReference,
                ],
                $actor->id,
            );

            $this->notifyPaid($statement);

            return $statement;
        });
    }

    /**
     * «يصلك إشعار عند جاهزية الكشف» (G/دليل المزوّد §7) — إشعار إلزامي
     * بقالب A14 (`settlement.ready`)؛ لا نص رسالة داخل الكود.
     */
    private function notifyReady(Partner $partner, SettlementStatement $statement): void
    {
        Notify::send('settlement.ready', $partner, [
            'period' => $statement->period_key,
            'events' => (int) $statement->items_count,
            'amount' => Money::format((int) $statement->net_amount_halalas),
        ], [
            'data' => [
                'settlement_statement_id' => $statement->id,
                'period_key' => $statement->period_key,
                'items_count' => (int) $statement->items_count,
                'net_amount_halalas' => (int) $statement->net_amount_halalas,
            ],
        ]);
    }

    private function notifyPaid(SettlementStatement $statement): void
    {
        Notify::sendToId('settlement.paid', Partner::class, (int) $statement->partner_id, [
            'period' => $statement->period_key,
            'amount' => Money::format((int) $statement->net_amount_halalas),
        ], [
            'data' => [
                'settlement_statement_id' => $statement->id,
                'period_key' => $statement->period_key,
                'net_amount_halalas' => (int) $statement->net_amount_halalas,
                'payout_reference' => $statement->payout_reference,
            ],
        ]);
    }
}

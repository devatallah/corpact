<?php

namespace App\Services\Billing;

use App\Models\Event;
use App\Models\SettlementItem;
use App\Services\Notifications\CriticalAlertService;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

/**
 * احتساب العمولة وإنشاء بند التسوية — **عند `completed` حصراً** (H §12.7،
 * وقاعدة الأدمن المالي الثالثة: «لا تسوية ولا عمولة ولا احتساب موظف مفعّل
 * قبل انتقال الفعالية إلى مكتملة»).
 *
 * **مصدر الأرقام هو `event_snapshot` وحده** (H §12.10): «هذه النسخة وحدها
 * تُستخدم في التسوية والفوترة والاسترداد وكل عرض تاريخي، مهما تغيّرت الملفات
 * لاحقاً». لا يقرأ هذا الملف سعراً ولا نسبة عمولة من ملف المزوّد الحيّ.
 *
 * الحساب كله هللات صحيحة:
 * - `gross` = إجمالي اللقطة شامل الضريبة.
 * - `commission` = gross × النسبة المجمّدة في اللقطة (قسمة صحيحة، بلا تقريب لأعلى).
 * - `net` = gross − commission — «تُقتطع من مستحقاته ولا تُضاف على السعر».
 * - `vat` = مكوّن الضريبة داخل العمولة (تيمات أصيل في العمولة — H §12.9).
 * - `activity_vat` = ضريبة قيمة النشاط (تيمات وكيل فيها) — تُحفظ ولا تُخصم.
 * - `rounding_remainder` = فرق كسور القسمة المحمَّل على جانب العمولة (A10/H §24).
 */
class CommissionService
{
    public function __construct(private ProviderPayableService $payables) {}

    /**
     * ينشئ بند التسوية وقيدي الدفتر لفعالية مكتملة. idempotent: نفس الفعالية
     * مرتين تعيد البند القائم بلا أي أثر مزدوج. يعيد null إذا تعذّر الاحتساب
     * (بلا مزوّد، بلا لقطة، أو بلا نسبة عمولة) — مع تنبيه الأدمن.
     */
    public function recordForCompletedEvent(Event $event): ?SettlementItem
    {
        if ((string) $event->status !== 'completed') {
            // الحارس الأخير: لا بند قبل الاكتمال بأي حال.
            return null;
        }

        if ($event->partner_id === null) {
            return null;
        }

        $existing = SettlementItem::query()
            ->where('idempotency_key', $this->idempotencyKeyFor($event))
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $snapshot = $event->event_snapshot;

        if (! is_array($snapshot) || ! isset($snapshot['financial'])) {
            $this->alertUncomputable($event, 'الفعالية اكتملت بلا `event_snapshot` — لا مصدر مجمّد للاحتساب.');

            return null;
        }

        $amounts = $this->amountsFromSnapshot($snapshot);

        if ($amounts === null) {
            $this->alertUncomputable($event, 'اللقطة لا تحمل نسبة عمولة سارية للمزوّد — نسبة العقد مطلوبة قبل أي احتساب.');

            return null;
        }

        return DB::transaction(function () use ($event, $snapshot, $amounts): SettlementItem {
            $item = SettlementItem::create([
                'partner_id' => $event->partner_id,
                'event_id' => $event->id,
                'company_id' => $event->company_id,
                'type' => SettlementItem::TYPE_EVENT,
                'gross_amount_halalas' => $amounts['gross'],
                'commission_amount_halalas' => $amounts['commission'],
                'vat_amount_halalas' => $amounts['vat'],
                'net_amount_halalas' => $amounts['net'],
                'activity_vat_amount_halalas' => $amounts['activity_vat'],
                'rounding_remainder_halalas' => $amounts['rounding_remainder'],
                'commission_rate_percent' => $amounts['rate_percent'],
                'status' => SettlementItem::STATUS_PENDING,
                // H §12.9: العمولة تدفّق تيمات فيه **أصيل** وتُصدر فيه الفاتورة للمزوّد.
                'tax_treatment' => config('billing.tax.commission.treatment', 'principal'),
                'invoice_issuer' => config('billing.tax.commission.issuer', 'teamat'),
                'snapshot_json' => $this->freeze($event, $snapshot, $amounts),
                'idempotency_key' => $this->idempotencyKeyFor($event),
                'computed_at' => now(),
            ]);

            $this->payables->recordCompletion($event->partner, $item);

            return $item;
        });
    }

    /**
     * الحساب من اللقطة وحدها — هللات صحيحة، بلا أي float.
     *
     * @param  array<string, mixed>  $snapshot
     * @return array{gross: int, commission: int, vat: int, net: int, activity_vat: int, rounding_remainder: int, rate_percent: float}|null
     */
    public function amountsFromSnapshot(array $snapshot): ?array
    {
        $financial = $snapshot['financial'] ?? [];
        $ratePercent = $snapshot['provider']['commission_rate'] ?? null;

        if ($ratePercent === null) {
            return null;
        }

        $gross = (int) ($financial['total_amount_halalas'] ?? 0);
        // النسبة بمئات الأجزاء (12.50% = 1250) حتى تبقى القسمة صحيحة.
        $rateBasisPoints = (int) round(((float) $ratePercent) * 100);
        $commission = intdiv($gross * $rateBasisPoints, 10000);

        return [
            'gross' => $gross,
            'commission' => $commission,
            // العمولة شاملة الضريبة (H §12.1) — يُفكَّك مكوّنها الضريبي للفاتورة.
            'vat' => Money::decomposeVat(max(0, $commission))['vat'],
            'net' => $gross - $commission,
            'activity_vat' => (int) ($financial['vat_amount_halalas'] ?? 0),
            'rounding_remainder' => (int) ($financial['rounding_remainder_halalas'] ?? 0),
            'rate_percent' => (float) $ratePercent,
        ];
    }

    /**
     * النسخة الثابتة على البند (H §12.7): اسم المزوّد والسعر ونسبة العمولة
     * **وقت الاحتساب** — فلا يتغير كشف قديم بتغيّر ملف المزوّد لاحقاً.
     *
     * @param  array<string, mixed>  $snapshot
     * @param  array<string, mixed>  $amounts
     * @return array<string, mixed>
     */
    private function freeze(Event $event, array $snapshot, array $amounts): array
    {
        return [
            'computed_at' => now()->toIso8601String(),
            'source' => 'event_snapshot',
            'event' => [
                'id' => $event->id,
                'title' => $snapshot['event']['title'] ?? $event->title,
                'starts_at' => $snapshot['event']['starts_at'] ?? null,
                'completed_at' => $event->completed_at?->toIso8601String(),
            ],
            'provider' => [
                'id' => $snapshot['provider']['id'] ?? $event->partner_id,
                'name' => $snapshot['provider']['name'] ?? null,
                'commission_rate' => $amounts['rate_percent'],
            ],
            'company' => $snapshot['company'] ?? null,
            'community' => $snapshot['community'] ?? null,
            'pricing' => [
                'currency' => Money::CURRENCY,
                'total_amount_halalas' => $amounts['gross'],
                'base_amount_halalas' => (int) ($snapshot['financial']['base_amount_halalas'] ?? 0),
                'vat_amount_halalas' => $amounts['activity_vat'],
                'rounding_remainder_halalas' => $amounts['rounding_remainder'],
                'rounding_remainder_charged_to' => $snapshot['financial']['rounding_remainder_charged_to'] ?? 'teamat_commission',
            ],
            'computation' => [
                'commission_amount_halalas' => $amounts['commission'],
                'commission_vat_amount_halalas' => $amounts['vat'],
                'net_amount_halalas' => $amounts['net'],
                'tax_treatment' => config('billing.tax.commission.treatment', 'principal'),
                'invoice_issuer' => config('billing.tax.commission.issuer', 'teamat'),
            ],
            'display' => [
                'gross' => Money::format($amounts['gross']),
                'commission' => Money::format($amounts['commission']),
                'net' => Money::format($amounts['net']),
            ],
        ];
    }

    private function idempotencyKeyFor(Event $event): string
    {
        return "settlement-item:event:{$event->id}";
    }

    /**
     * فعالية مكتملة تعذّر احتساب مستحقها = صمت مالي — يُصرخ به لا يُبتلع:
     * تنبيه حرج في صندوق أدمن تيمات (A14) + `Log::critical`.
     */
    private function alertUncomputable(Event $event, string $why): void
    {
        app(CriticalAlertService::class)->raise(
            'settlement.item_uncomputable',
            "فعالية مكتملة بلا بند تسوية — #{$event->id}",
            $why,
            ['event_id' => $event->id, 'partner_id' => $event->partner_id],
        );
    }
}

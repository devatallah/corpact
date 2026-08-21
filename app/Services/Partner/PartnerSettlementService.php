<?php

namespace App\Services\Partner;

use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Support\Lists\ListSort;
use App\Support\Money;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * صفحات المزوّد للتسويات (G/دليل المزوّد §7): قائمة الكشوف وتفاصيل كل كشف
 * مقابل فعالياته. المزوّد يقرأ فقط — الاعتماد والصرف من الأدمن المالي.
 */
class PartnerSettlementService
{
    /**
     * H §18 — أعمدة ترتيب الكشوف. كلها معروضة في الجدول، والنطاق
     * (`partner_id`) خارج أي تأثير للترتيب أو البحث.
     */
    public static function statementSort(): ListSort
    {
        return ListSort::make([
            'period_end' => 'period_end',
            'items_count' => 'items_count',
            'gross_amount' => 'gross_amount_halalas',
            'commission_amount' => 'commission_amount_halalas',
            'net_amount' => 'net_amount_halalas',
            'status' => 'status',
        ], 'period_end', ListSort::DESC, 'id');
    }

    /**
     * أعمدة ترتيب بنود الكشف — بند لكل فعالية مكتملة في الفترة.
     */
    public static function itemSort(): ListSort
    {
        return ListSort::make([
            'gross_amount' => 'gross_amount_halalas',
            'commission_amount' => 'commission_amount_halalas',
            'net_amount' => 'net_amount_halalas',
            'computed_at' => 'computed_at',
            'type' => 'type',
        ], 'computed_at', ListSort::ASC, 'id');
    }

    /**
     * @param  array{status?: string, search?: string, sort?: string, dir?: string, per_page?: int}  $filters
     * @return LengthAwarePaginator<int, SettlementStatement>
     */
    public function listForPartner(Partner $partner, array $filters = []): LengthAwarePaginator
    {
        $query = SettlementStatement::query()
            ->where('partner_id', $partner->id)
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            // بحث المزوّد داخل كشوفه هو: أي فترة، وأي مرجع تحويل — لا يوسّع
            // النطاق قيد أنملة، فالمزوّد يقرأ كشوفه وحدها أصلاً.
            ->when(filled($filters['search'] ?? null), fn ($query) => $query->where(fn ($inner) => $inner
                ->where('period_key', 'like', '%'.$filters['search'].'%')
                ->orWhere('payout_reference', 'like', '%'.$filters['search'].'%')));

        return self::statementSort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString()
            ->through(fn (SettlementStatement $statement) => $this->presentStatement($statement));
    }

    /**
     * بنود كشف واحد، مرقّمة 20 لكل صفحة (H §18) — الكشف الطويل كان يعود
     * كاملاً بلا حدّ.
     *
     * @return LengthAwarePaginator<int, SettlementItem>
     */
    public function statementItems(SettlementStatement $statement, ?string $sort = null, ?string $dir = null): LengthAwarePaginator
    {
        $query = $statement->items()->with('event:id,title,event_date,status');

        return self::itemSort()
            ->apply($query, $sort, $dir)
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SettlementItem $item) => $this->presentItem($item));
    }

    /**
     * المستحقات: المصروف فعلاً مقابل ما لم يُصرف بعد، وبنود لم تدخل كشفاً.
     *
     * @return array<string, mixed>
     */
    public function totals(Partner $partner): array
    {
        $byStatus = SettlementStatement::query()
            ->where('partner_id', $partner->id)
            ->selectRaw('status, SUM(net_amount_halalas) as net, SUM(gross_amount_halalas) as gross, SUM(commission_amount_halalas) as commission')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $pendingItems = (int) SettlementItem::query()
            ->where('partner_id', $partner->id)
            ->where('status', SettlementItem::STATUS_PENDING)
            ->sum('net_amount_halalas');

        $paidNet = (int) ($byStatus->get(SettlementStatement::STATUS_PAID)->net ?? 0);
        $draftNet = (int) ($byStatus->get(SettlementStatement::STATUS_DRAFT)->net ?? 0);
        $approvedNet = (int) ($byStatus->get(SettlementStatement::STATUS_APPROVED)->net ?? 0);

        return [
            'paid_net_halalas' => $paidNet,
            'paid_net' => Money::format($paidNet),
            'draft_net_halalas' => $draftNet,
            'draft_net' => Money::format($draftNet),
            'approved_net_halalas' => $approvedNet,
            'approved_net' => Money::format($approvedNet),
            // بنود اكتملت فعالياتها ولم يحن كشفها بعد (تدخل الكشف القادم).
            'unstated_net_halalas' => $pendingItems,
            'unstated_net' => Money::format($pendingItems),
            'payouts_blocked' => $partner->payoutsBlocked(),
        ];
    }

    /**
     * تفاصيل كشف واحد + بنوده مقابل الفعاليات (مطابقة بند ببند).
     *
     * @return array<string, mixed>
     */
    public function statementDetail(SettlementStatement $statement): array
    {
        $items = $statement->items()->with('event:id,title,event_date,status')->get();

        return [
            ...$this->presentStatement($statement),
            'items' => $items->map(fn (SettlementItem $item) => $this->presentItem($item))->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function presentStatement(SettlementStatement $statement): array
    {
        return [
            'id' => $statement->id,
            'period_key' => $statement->period_key,
            'period_start' => $statement->period_start?->toDateString(),
            'period_end' => $statement->period_end?->toDateString(),
            'status' => $statement->status,
            'items_count' => (int) $statement->items_count,
            'gross_amount_halalas' => (int) $statement->gross_amount_halalas,
            'commission_amount_halalas' => (int) $statement->commission_amount_halalas,
            'vat_amount_halalas' => (int) $statement->vat_amount_halalas,
            'net_amount_halalas' => (int) $statement->net_amount_halalas,
            'gross_amount' => Money::format((int) $statement->gross_amount_halalas),
            'commission_amount' => Money::format((int) $statement->commission_amount_halalas),
            'vat_amount' => Money::format((int) $statement->vat_amount_halalas),
            'net_amount' => Money::format((int) $statement->net_amount_halalas),
            'approved_at' => $statement->approved_at?->toIso8601String(),
            'paid_at' => $statement->paid_at?->toIso8601String(),
            'transferred_at' => $statement->transferred_at?->toIso8601String(),
            'payout_reference' => $statement->payout_reference,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function presentItem(SettlementItem $item): array
    {
        $snapshot = $item->snapshot_json ?? [];

        return [
            'id' => $item->id,
            'type' => $item->type,
            'status' => $item->status,
            'event_id' => (int) $item->event_id,
            'event_title' => $snapshot['event']['title'] ?? $item->event?->title,
            'event_date' => $item->event?->event_date?->toDateString(),
            'commission_rate_percent' => $item->commission_rate_percent !== null ? (float) $item->commission_rate_percent : null,
            'gross_amount_halalas' => (int) $item->gross_amount_halalas,
            'commission_amount_halalas' => (int) $item->commission_amount_halalas,
            'vat_amount_halalas' => (int) $item->vat_amount_halalas,
            'net_amount_halalas' => (int) $item->net_amount_halalas,
            'gross_amount' => Money::format((int) $item->gross_amount_halalas),
            'commission_amount' => Money::format((int) $item->commission_amount_halalas),
            'vat_amount' => Money::format((int) $item->vat_amount_halalas),
            'net_amount' => Money::format((int) $item->net_amount_halalas),
            'reason' => $item->reason,
            'corrects_item_id' => $item->corrects_item_id !== null ? (int) $item->corrects_item_id : null,
            'computed_at' => $item->computed_at?->toIso8601String(),
        ];
    }
}

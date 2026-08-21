<?php

namespace App\Services\Reporting\Export\Definitions;

use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Event;
use App\Models\WalletTopupRequest;
use App\Models\WalletTransaction;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportColumn;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportDataset;
use App\Services\Reporting\Export\ExportDefinition;
use App\Services\Reporting\ReportPeriod;
use App\Support\Money;

/**
 * H §15 — «حركات المحفظة».
 *
 * **قائد المجتمع ليس في قائمة الجماهير** — تصديره «بلا أي بيانات مالية»،
 * ودفتر المحفظة مالٌ كلّه: تنقيته تُخرج جدولاً بلا معنى، فالمنع على مستوى
 * المُصدِّر لا على مستوى العمود.
 *
 * الحركات كلها للشركة: محفظتها الرئيسية ومحافظ مجتمعاتها الفرعية
 * (`wallets.company_id`).
 */
class WalletTransactionsExport implements ExportDefinition
{
    public function key(): string
    {
        return 'wallet_transactions';
    }

    public function title(): string
    {
        return 'حركات المحفظة';
    }

    public function audiences(): array
    {
        return [
            ExportAudience::AccountManager,
            ExportAudience::Coordinator,
            ExportAudience::PlatformAdmin,
        ];
    }

    public function build(ExportContext $context): ExportDataset
    {
        $transactions = WalletTransaction::query()
            ->join('wallets', 'wallets.id', '=', 'wallet_transactions.wallet_id')
            ->leftJoin('communities', function ($join) {
                $join->on('communities.id', '=', 'wallets.owner_id')
                    ->where('wallets.owner_type', '=', Community::class);
            })
            ->leftJoin('users', 'users.id', '=', 'wallet_transactions.actor_user_id')
            ->where('wallets.company_id', $context->companyId())
            ->whereBetween('wallet_transactions.occurred_at', [$context->period->start, $context->period->end])
            ->orderBy('wallet_transactions.occurred_at')
            ->orderBy('wallet_transactions.id')
            ->get([
                'wallet_transactions.id',
                'wallet_transactions.type',
                'wallet_transactions.direction',
                'wallet_transactions.amount_halalas',
                'wallet_transactions.reference_type',
                'wallet_transactions.reference_id',
                'wallet_transactions.note',
                'wallet_transactions.occurred_at',
                'wallets.owner_type',
                'communities.name as community_name',
                'users.name as actor_name',
            ]);

        $rows = [];

        foreach ($transactions as $transaction) {
            $type = WalletTransactionType::tryFrom((string) $transaction->getRawOriginal('type'));

            $rows[] = [
                'id' => (int) $transaction->id,
                'occurred_at' => $transaction->occurred_at?->timezone(ReportPeriod::TIMEZONE)->format('Y-m-d H:i') ?? '',
                'wallet' => $transaction->owner_type === Community::class
                    ? 'محفظة مجتمع — '.($transaction->community_name ?? '')
                    : 'المحفظة الرئيسية',
                'type' => $type?->label() ?? (string) $transaction->getRawOriginal('type'),
                'direction' => $transaction->direction === WalletTransaction::DIRECTION_CREDIT ? 'إيداع' : 'سحب',
                'amount' => Money::format((int) $transaction->amount_halalas),
                'reference' => $this->referenceLabel($transaction->reference_type, $transaction->reference_id),
                'actor' => (string) ($transaction->actor_name ?? 'النظام'),
                'note' => (string) ($transaction->note ?? ''),
            ];
        }

        return new ExportDataset(
            key: $this->key(),
            title: $this->title(),
            columns: [
                ExportColumn::plain('id', 'رقم الحركة', numeric: true),
                ExportColumn::plain('occurred_at', 'الوقت (الرياض)'),
                ExportColumn::plain('wallet', 'المحفظة'),
                ExportColumn::plain('type', 'النوع'),
                ExportColumn::plain('direction', 'الاتجاه'),
                ExportColumn::financial('amount', 'المبلغ (ريال)'),
                ExportColumn::plain('reference', 'المرجع'),
                ExportColumn::plain('actor', 'الفاعل'),
                ExportColumn::plain('note', 'ملاحظة'),
            ],
            rows: $rows,
        );
    }

    private function referenceLabel(?string $type, ?int $id): string
    {
        if ($type === null || $id === null) {
            return '';
        }

        $label = match ($type) {
            Event::class => 'فعالية',
            WalletTopupRequest::class => 'طلب شحن',
            Community::class => 'مجتمع',
            default => class_basename($type),
        };

        return $label.' #'.$id;
    }
}

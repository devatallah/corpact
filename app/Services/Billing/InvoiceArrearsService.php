<?php

namespace App\Services\Billing;

use App\Models\Company;
use App\Models\PlatformFeeInvoice;
use App\Services\ActivityLogService;
use App\Services\Notifications\CriticalAlertService;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Support\Carbon;

/**
 * سلّم التأخر عن السداد (H §12.8): تنبيه بعد **7** أيام، ثم **15**، ثم
 * **إيقاف إنشاء فعاليات جديدة بعد 30 يوماً**.
 *
 * > **«لا توقف الخدمة على الموظف بسبب تأخر الشركة»** — لا إيقاف دخول، ولا
 * > إلغاء فعالية مؤكدة، ولا مساس بأي مقعد أو دفعة قائمة. الأثر الوحيد علم
 * > واحد على الشركة يقرأه **مسار الإنشاء وحده**.
 *
 * كل درجة تُختم على الفاتورة نفسها فلا تتكرر، ومسؤول الحساب يُبلَّغ في كل
 * درجة، والحجب والرفع مسجَّلان في سجل التدقيق.
 */
class InvoiceArrearsService
{
    /**
     * @return array{reminded_7: int, reminded_15: int, blocked: int}
     */
    public function process(?Carbon $now = null): array
    {
        $now ??= Carbon::now();

        $first = (int) config('billing.late.first_reminder_days', 7);
        $second = (int) config('billing.late.second_reminder_days', 15);
        $blockAfter = (int) config('billing.late.block_event_creation_days', 30);

        $counters = ['reminded_7' => 0, 'reminded_15' => 0, 'blocked' => 0];

        $invoices = PlatformFeeInvoice::query()
            ->outstanding()
            ->whereNotNull('due_at')
            ->where('due_at', '<', $now)
            ->with('company')
            ->get();

        foreach ($invoices as $invoice) {
            $days = $invoice->daysOverdue($now);

            if ($days >= $first && $invoice->reminder_7_sent_at === null) {
                $this->remind($invoice, $first, $days);
                $invoice->forceFill(['reminder_7_sent_at' => $now])->save();
                $counters['reminded_7']++;
            }

            if ($days >= $second && $invoice->reminder_15_sent_at === null) {
                $this->remind($invoice, $second, $days);
                $invoice->forceFill(['reminder_15_sent_at' => $now])->save();
                $counters['reminded_15']++;
            }

            if ($days >= $blockAfter && $invoice->blocked_at === null) {
                $this->block($invoice, $days);
                $invoice->forceFill(['blocked_at' => $now])->save();
                $counters['blocked']++;
            }
        }

        return $counters;
    }

    /**
     * رفع الحجب حين لا يبقى متأخر تجاوز عتبة الإيقاف (يُستدعى عند السداد).
     */
    public function reevaluateBlock(Company $company, ?Carbon $now = null): void
    {
        $now ??= Carbon::now();
        $blockAfter = (int) config('billing.late.block_event_creation_days', 30);

        $stillBlocking = PlatformFeeInvoice::query()
            ->where('company_id', $company->id)
            ->outstanding()
            ->whereNotNull('due_at')
            ->get()
            ->contains(fn (PlatformFeeInvoice $invoice) => $invoice->daysOverdue($now) >= $blockAfter);

        if ($stillBlocking || $company->event_creation_blocked_at === null) {
            return;
        }

        $company->forceFill([
            'event_creation_blocked_at' => null,
            'event_creation_block_reason' => null,
        ])->save();

        ActivityLogService::log(
            $company->id,
            $company,
            'event_creation_unblocked',
            'رُفع حجب إنشاء الفعاليات بعد سداد المتأخرات.',
        );

        Notify::send('billing.event_creation_unblocked', $company, [], [
            'fallback_title' => 'عاد إنشاء الفعاليات',
            'fallback_body' => 'سُدّدت المتأخرات ورُفع الحجب — يمكنكم إنشاء فعاليات جديدة الآن.',
            'data' => ['company_id' => $company->id],
        ]);
    }

    private function remind(PlatformFeeInvoice $invoice, int $stage, int $days): void
    {
        $total = Money::format((int) $invoice->total_amount_halalas);
        $blockAfter = (int) config('billing.late.block_event_creation_days', 30);

        Notify::sendToId('invoice.reminder', Company::class, (int) $invoice->company_id, [
            'period' => $invoice->period_key,
            'amount' => $total,
            'due_date' => $invoice->due_at?->format('Y-m-d') ?? '',
        ], [
            'data' => [
                'invoice_id' => $invoice->id,
                'serial' => $invoice->serial,
                'stage_days' => $stage,
                'days_overdue' => $days,
                'block_after_days' => $blockAfter,
            ],
        ]);
    }

    private function block(PlatformFeeInvoice $invoice, int $days): void
    {
        $company = $invoice->company;

        if ($company === null) {
            return;
        }

        $reason = "تأخر سداد الفاتورة {$invoice->serial} {$days} يوماً عن الاستحقاق.";

        if ($company->event_creation_blocked_at === null) {
            $company->forceFill([
                'event_creation_blocked_at' => now(),
                'event_creation_block_reason' => $reason,
            ])->save();

            ActivityLogService::log(
                $company->id,
                $company,
                'event_creation_blocked',
                'إيقاف إنشاء الفعاليات الجديدة — '.$reason.' (لا إيقاف دخول ولا إلغاء فعاليات مؤكدة)',
                ['invoice_id' => $invoice->id, 'days_overdue' => $days],
            );
        }

        Notify::send('billing.event_creation_blocked', $company, [
            'serial' => $invoice->serial,
            'days' => $days,
        ], [
            'fallback_title' => 'أُوقف إنشاء الفعاليات الجديدة',
            'fallback_body' => $reason.' الفعاليات المؤكدة قائمة كما هي ودخول الموظفين لم يتأثر. يعود الإنشاء فور السداد.',
            'data' => [
                'invoice_id' => $invoice->id,
                'days_overdue' => $days,
            ],
        ]);

        app(CriticalAlertService::class)->warn(
            'billing.arrears_block',
            "شركة متأخرة — حُجب إنشاء الفعاليات: {$company->name}",
            $reason,
            ['company_id' => $company->id, 'invoice_id' => $invoice->id, 'days_overdue' => $days],
        );
    }
}

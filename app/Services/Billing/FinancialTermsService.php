<?php

namespace App\Services\Billing;

use App\Models\Company;
use App\Models\CompanyContractTerm;
use App\Models\Partner;
use App\Models\ProviderCommissionRate;
use DateTimeInterface;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

/**
 * تجميد الشروط المالية وتأريخها (H §12.10).
 *
 * «أي تغيير في نسبة عمولة مزوّد أو في رسوم عقد شركة **يسري من تاريخ مستقبلي
 * محدد فقط ولا يُطبَّق بأثر رجعي**». الطبقة هنا تجيب سؤالين:
 *
 * 1. ما النسبة/الرسوم **السارية في تاريخ بعينه**؟ (تُقرأ عند كتابة اللقطة
 *    وعند توليد الفاتورة — لا عند العرض).
 * 2. جدولة تغيير مستقبلي، مع رفض أي تاريخ ليس في المستقبل.
 *
 * القيمة القاعدية (قبل أول تغيير مجدول) هي عمود العقد القائم على
 * `partners.commission_rate` / `companies.contract_*` — وكلها nullable لأن
 * أرقام العقود من المالك ولا افتراضات مسموحة.
 */
class FinancialTermsService
{
    /**
     * نسبة العمولة السارية على المزوّد في تاريخ محدد (نسبة مئوية)، أو null
     * إن لم يكن للمزوّد نسبة عقد بعد.
     */
    public function commissionRatePercentFor(Partner $partner, ?DateTimeInterface $at = null): ?float
    {
        $on = Carbon::parse($at ?? Carbon::now())->toDateString();

        $scheduled = ProviderCommissionRate::query()
            ->where('partner_id', $partner->id)
            ->whereDate('effective_from', '<=', $on)
            ->orderByDesc('effective_from')
            ->orderByDesc('id')
            ->value('rate_percent');

        if ($scheduled !== null) {
            return (float) $scheduled;
        }

        return $partner->commission_rate !== null ? (float) $partner->commission_rate : null;
    }

    /**
     * جدولة نسبة عمولة جديدة — التاريخ **مستقبلي إلزاماً**.
     */
    public function scheduleCommissionRate(Partner $partner, float $ratePercent, DateTimeInterface $effectiveFrom, ?int $actorUserId = null, ?string $reason = null): ProviderCommissionRate
    {
        $this->assertFutureDate($effectiveFrom);

        if ($ratePercent < 0 || $ratePercent > 100) {
            throw new InvalidArgumentException('نسبة العمولة يجب أن تكون بين 0 و100.');
        }

        return ProviderCommissionRate::query()->updateOrCreate(
            [
                'partner_id' => $partner->id,
                'effective_from' => Carbon::parse($effectiveFrom)->toDateString(),
            ],
            [
                'rate_percent' => $ratePercent,
                'created_by_user_id' => $actorUserId,
                'reason' => $reason,
            ],
        );
    }

    /**
     * رسوم عقد الشركة السارية في تاريخ محدد — بالهللة، وكلاهما قد يكون null.
     *
     * @return array{fee_per_activated_employee_halalas: ?int, monthly_minimum_halalas: ?int, source: string}
     */
    public function contractTermsFor(Company $company, ?DateTimeInterface $at = null): array
    {
        $on = Carbon::parse($at ?? Carbon::now())->toDateString();

        $scheduled = CompanyContractTerm::query()
            ->where('company_id', $company->id)
            ->whereDate('effective_from', '<=', $on)
            ->orderByDesc('effective_from')
            ->orderByDesc('id')
            ->first();

        if ($scheduled !== null) {
            return [
                'fee_per_activated_employee_halalas' => $scheduled->fee_per_activated_employee_halalas !== null
                    ? (int) $scheduled->fee_per_activated_employee_halalas
                    : null,
                'monthly_minimum_halalas' => $scheduled->monthly_minimum_halalas !== null
                    ? (int) $scheduled->monthly_minimum_halalas
                    : null,
                'source' => 'scheduled:'.$scheduled->id,
            ];
        }

        return [
            'fee_per_activated_employee_halalas' => $company->contract_fee_per_activated_employee !== null
                ? (int) $company->contract_fee_per_activated_employee
                : null,
            'monthly_minimum_halalas' => $company->contract_monthly_minimum !== null
                ? (int) $company->contract_monthly_minimum
                : null,
            'source' => 'contract',
        ];
    }

    /**
     * جدولة رسوم عقد جديدة — التاريخ **مستقبلي إلزاماً**.
     */
    public function scheduleContractTerms(
        Company $company,
        ?int $feePerActivatedEmployeeHalalas,
        ?int $monthlyMinimumHalalas,
        DateTimeInterface $effectiveFrom,
        ?int $actorUserId = null,
        ?string $reason = null,
    ): CompanyContractTerm {
        $this->assertFutureDate($effectiveFrom);

        return CompanyContractTerm::query()->updateOrCreate(
            [
                'company_id' => $company->id,
                'effective_from' => Carbon::parse($effectiveFrom)->toDateString(),
            ],
            [
                'fee_per_activated_employee_halalas' => $feePerActivatedEmployeeHalalas,
                'monthly_minimum_halalas' => $monthlyMinimumHalalas,
                'created_by_user_id' => $actorUserId,
                'reason' => $reason,
            ],
        );
    }

    /**
     * «لا يُطبَّق بأثر رجعي» مفروضاً في الكود لا في التعليمات فقط.
     */
    private function assertFutureDate(DateTimeInterface $effectiveFrom): void
    {
        if (Carbon::parse($effectiveFrom)->startOfDay()->lte(Carbon::now()->startOfDay())) {
            throw new InvalidArgumentException('تاريخ السريان يجب أن يكون مستقبلياً — لا تغيير بأثر رجعي (H §12.10).');
        }
    }
}

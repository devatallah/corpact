<?php

namespace App\Services\Company;

use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Wallet;
use App\Services\Reporting\KpiDictionary;
use App\Services\Reporting\ReportPeriod;
use App\Support\Money;
use Illuminate\Support\Collection;

/**
 * لوحة الشركة (H §18: «التفعيل، المشاركة حسب الإدارة، الإنفاق، المجتمعات
 * النشطة والخاملة»).
 *
 * **المؤشر الأول معدل التفعيل لا عدد المسجلين** (G/الشركة §6: «النسبة الحقيقية
 * للاستفادة — وهو المؤشر الأول لا عدد المسجلين»). ما كان هنا قبل A13 كان يقيس
 * ثلاثة أشياء لا تقول شيئاً عن الاستفادة: عدد الموظفين النشطين، وعدد
 * المجتمعات بلا شرط نشاط، وعدد الفعاليات بلا شرط اكتمال — و«نشاط المجتمعات»
 * كان **نسبة الأعضاء إلى الموظفين** أي عضوية لا حضوراً.
 *
 * كل رقم هنا يأتي من {@see KpiDictionary}.
 */
class CompanyDashboardService
{
    public function __construct(
        private KpiDictionary $kpi,
    ) {}

    /**
     * مؤشرات اللوحة للشهر الجاري — معدل التفعيل أولاً.
     *
     * @return array<string, mixed>
     */
    public function stats(Company $company, ?ReportPeriod $period = null): array
    {
        $period ??= ReportPeriod::currentMonth();

        $activation = $this->kpi->activationRate($company, $period);
        $attendance = $this->kpi->attendanceRate($company, $period);
        $communities = $this->kpi->communityActivity($company, $period->end);
        $cost = $this->kpi->costPerParticipation($company, $period);

        $walletHalalas = (int) Wallet::query()
            ->withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->sum('balance_halalas');

        return [
            'period' => $period->toArray(),
            'activation' => $activation->toArray(),
            'attendance' => $attendance->toArray(),
            'active_communities' => count($communities['active']),
            'dormant_communities' => count($communities['dormant']),
            'completed_events' => $this->kpi->completedEventCount($company, $period),
            'attendance_count' => $cost['attendance'],
            'cost_per_participation' => $cost['cost_per_participation'],
            // إنفاق الشركة — حقل مستقل، لا يُجمع مع حجم التداول ولا يُسمّى إيراداً.
            ...$cost['spend']->toFields(),
            'wallet_balance_halalas' => $walletHalalas,
            'wallet_balance' => Money::format($walletHalalas),
            // العمود القديم يبقى للتوافق مع بطاقة «الموظفون النشطون».
            'active_employees' => $activation->denominator,
        ];
    }

    /**
     * المجتمعات النشطة مقابل الخاملة — «نشاط» بمعنى فعالية مكتملة خلال 30
     * يوماً (H §15)، لا بمعنى عدد الأعضاء.
     *
     * @return array{window_days: int, active: list<array<string, mixed>>, dormant: list<array<string, mixed>>}
     */
    public function communityActivity(Company $company, ?ReportPeriod $period = null): array
    {
        $period ??= ReportPeriod::currentMonth();
        $activity = $this->kpi->communityActivity($company, $period->end);

        return [
            'window_days' => $activity['window_days'],
            'active' => $activity['active'],
            'dormant' => $activity['dormant'],
        ];
    }

    /**
     * المشاركة حسب الإدارة — بالإسناد وقت الحدث (H §15).
     *
     * @return list<array<string, mixed>>
     */
    public function departmentParticipation(Company $company, ?ReportPeriod $period = null): array
    {
        return $this->kpi->participationByDepartment($company, $period ?? ReportPeriod::currentMonth());
    }

    /**
     * Get recent activity logs for the company.
     *
     * @return Collection<int, ActivityLog>
     */
    public function recentActivity(Company $company, int $limit = 10): Collection
    {
        $logs = ActivityLog::query()
            ->where('company_id', $company->id)
            ->latest()
            ->limit($limit)
            ->get();

        // Resolve community IDs in old descriptions (e.g. "المجتمع #4" → "المجتمع كرة قدم")
        $communityIds = [];
        foreach ($logs as $log) {
            if (preg_match('/المجتمع #(\d+)/', $log->description, $m)) {
                $communityIds[] = (int) $m[1];
            }
        }

        if ($communityIds) {
            $names = Community::whereIn('id', array_unique($communityIds))->pluck('name', 'id');
            foreach ($logs as $log) {
                $log->description = preg_replace_callback('/المجتمع #(\d+)/', function ($m) use ($names) {
                    return 'المجتمع '.($names[(int) $m[1]] ?? "#{$m[1]}");
                }, $log->description);
            }
        }

        return $logs;
    }
}

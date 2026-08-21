<?php

namespace App\Services\Payments;

use App\Models\Community;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Event;
use App\Models\JobRun;
use App\Models\Wallet;
use App\Support\Money;
use App\Support\Notify;

/**
 * معادلة التمويل — مسار واحد يغطي كل الحالات (H §12.2):
 *
 * | القيمة            | المعادلة                                        | متى تُحسب              |
 * | الدعم             | min(المحدد، رصيد محفظة المجتمع، الإجمالي)       | عند إغلاق التسجيل      |
 * | المتبقي           | الإجمالي − الدعم                                | عند إغلاق التسجيل      |
 * | الحصة القصوى      | المتبقي ÷ الحد الأدنى                           | تُعرض لحظة الانضمام    |
 * | حصة الفرد الفعلية | المتبقي ÷ العدد النهائي                         | تُقفل عند الإغلاق      |
 *
 * - subsidy_type: fixed (هللات) | percentage (نسبة من الإجمالي). المسار أ =
 *   percentage بقيمة 100، المسار ب = قيمة 0، المختلط بينهما.
 * - الحصة القصوى المعروضة عند الانضمام **سقف ملزم في الكود** («وعد ملزم») —
 *   لا حصة محسوبة تتجاوزه أبداً، والقسمة floor بلا تقريب لأعلى، وفرق
 *   الكسور على جانب عمولة تيمات.
 * - تنبيه استباقي إلزامي عند بلوغ الحد الأدنى إذا كان رصيد المحفظة لا يغطي
 *   الدعم المتوقع — لقائد المجتمع ولمسؤول الحساب فوراً، لا عند التحصيل.
 */
class FundingService
{
    /**
     * الحصة القصوى (السقف الملزم) بالهللة: (الإجمالي − الدعم المخطط) ÷ الحد
     * الأدنى، بلا تقريب لأعلى.
     */
    public function maxShareHalalas(Event $event): int
    {
        $remaining = max(0, (int) $event->total_amount_halalas - $event->plannedSubsidyHalalas());

        return Money::splitShare($remaining, max(1, (int) $event->min_participants))['share'];
    }

    /**
     * إعلان السقف على الفعالية (عند الإنشاء، ويُعاد إعلانه عند تغيّر الإجمالي
     * قبل قبول المزوّد — تعديل السعر بعد القبول ممنوع أصلاً H §12.1).
     */
    public function announceCeiling(Event $event): void
    {
        $event->forceFill(['max_share_halalas' => $this->maxShareHalalas($event)])->save();
    }

    /**
     * الدعم الفعلي عند إغلاق التسجيل = min(المحدد، الرصيد المتاح، الإجمالي).
     */
    public function subsidyAtClose(Event $event, int $walletAvailableHalalas): int
    {
        return min(
            $event->plannedSubsidyHalalas(),
            max(0, $walletAvailableHalalas),
            (int) $event->total_amount_halalas,
        );
    }

    /**
     * قيم الدعم الافتراضية من إعدادات الشركة (H §12.2: ترث القيمة الافتراضية
     * من إعدادات المجتمع ثم الشركة — لا إعدادات مجتمع بعد).
     *
     * @return array{subsidy_type: string, subsidy_value: int}
     */
    public function defaultSubsidyFor(int $companyId): array
    {
        $settings = CompanySetting::query()->withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->first();

        return [
            'subsidy_type' => (string) ($settings->default_subsidy_type ?? 'fixed'),
            'subsidy_value' => (int) ($settings->default_subsidy ?? 0),
        ];
    }

    /**
     * التنبيه الاستباقي الإلزامي (H §12.3): يُستدعى لحظة بلوغ الحد الأدنى —
     * إن كان رصيد محفظة المجتمع لا يغطي الدعم المتوقع يُنبَّه قائد المجتمع
     * ومسؤول الحساب فوراً لشحن الرصيد قبل إغلاق التسجيل.
     * idempotent لكل فعالية عبر JobRun::runOnce.
     */
    public function alertIfSubsidyUncovered(Event $event): void
    {
        $planned = $event->plannedSubsidyHalalas();

        if ($planned <= 0 || $event->community === null) {
            return;
        }

        $wallet = Wallet::subFor($event->community);
        $available = (int) $wallet->balance_halalas;

        if ($available >= $planned) {
            return;
        }

        JobRun::runOnce(
            job: 'event:subsidy-shortfall-alert',
            entityType: 'event',
            entityId: $event->id,
            period: 'minimum-reached',
            callback: function () use ($event, $planned, $available) {
                $this->notifyShortfall($event->community, $event, $planned, $available);
            },
        );
    }

    private function notifyShortfall(Community $community, Event $event, int $planned, int $available): void
    {
        $variables = [
            'community' => $community->name,
            'available' => Money::format($available),
            'planned' => Money::format($planned),
        ];

        Notify::sendMany(
            'wallet.below_subsidy.leader',
            $community->leaderEmployees(),
            $variables,
            ['data' => ['event_id' => $event->id]],
        );

        Notify::sendToId(
            'wallet.below_subsidy.company',
            Company::class,
            (int) $community->company_id,
            $variables,
            ['data' => ['event_id' => $event->id, 'community_id' => $community->id]],
        );
    }
}

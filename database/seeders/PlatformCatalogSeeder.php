<?php

namespace Database\Seeders;

use App\Models\ActivityUnit;
use App\Models\BlackoutDate;
use App\Models\Company;
use App\Models\CompanyContractTerm;
use App\Models\CompanySetting;
use App\Models\Partner;
use App\Models\PlatformSetting;
use App\Models\ProviderBranch;
use App\Models\ProviderCommissionRate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * الأساس التعاقدي والتشغيلي الذي تقف عليه بقية البذور.
 *
 * كل ما بعده يفترض وجوده: فاتورة بلا شروط عقد لا تُحتسب، وفعالية بلا وحدة
 * نشاط لا تُحجز، وعمولة بلا نسبة سارية لا تُقيَّد. يُبذَر أولاً لهذا السبب،
 * ولأن التواريخ هنا سابقة لكل حركة مالية في النظام.
 */
class PlatformCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@teamat.com')->firstOrFail();
        $finance = User::query()->where('email', 'accountant@teamat.com')->first() ?? $admin;

        $this->platformSettings($admin);
        $this->contractTerms($finance);
        $this->companySettings();
        $this->providerCatalog();
        $this->commissionRates($finance);
        $this->blackouts($admin);
    }

    /** إعدادات المنصة التي تقرأها الخدمات فعلاً، بقيمها الافتراضية المعلنة. */
    private function platformSettings(User $admin): void
    {
        $settings = [
            'vat_rate_percent' => '15',
            'default_commission_rate_percent' => '12',
            'provider_response_hours' => '12',
            'registration_close_hours' => '24',
            'payment_window_hours' => '6',
            'seat_offer_hours' => '4',
            'attendance_edit_hours' => '24',
            'settlement_cycle_days' => '30',
            'invoice_due_days' => '15',
            'invoice_block_days' => '30',
            'real_invoices_enabled' => '0',
            'free_withdrawal_hours' => '24',
        ];

        foreach ($settings as $key => $value) {
            PlatformSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'updated_by_user_id' => $admin->id],
            );
        }
    }

    /**
     * شروط العقد لكل شركة عدا واحدة.
     *
     * تُترك «شركة الأفق» بلا شروط عمداً: شاشة الفواتير تعرض قائمة «شركات بلا
     * عقد — لن تُفوتر»، وقائمة فارغة لا تُثبت أن التحذير يعمل.
     */
    private function contractTerms(User $finance): void
    {
        $terms = [
            1 => [30000, 500000],
            2 => [25000, 300000],
            4 => [40000, 800000],
            5 => [20000, 200000],
        ];

        foreach ($terms as $companyId => [$fee, $minimum]) {
            if (! Company::query()->whereKey($companyId)->exists()) {
                continue;
            }

            CompanyContractTerm::query()->create([
                'company_id' => $companyId,
                'fee_per_activated_employee_halalas' => $fee,
                'monthly_minimum_halalas' => $minimum,
                'effective_from' => Carbon::now()->startOfYear(),
                'created_by_user_id' => $finance->id,
                'reason' => 'الشروط التعاقدية عند توقيع الاتفاقية.',
            ]);
        }

        // زيادة مجدولة بأثر مستقبلي — تُثبت أن الكشوف الصادرة لا تُعاد تسعيرها.
        CompanyContractTerm::query()->create([
            'company_id' => 1,
            'fee_per_activated_employee_halalas' => 35000,
            'monthly_minimum_halalas' => 600000,
            'effective_from' => Carbon::now()->addMonths(2)->startOfMonth(),
            'created_by_user_id' => $finance->id,
            'reason' => 'تحديث متفق عليه يبدأ من الدورة القادمة.',
        ]);
    }

    /** إعدادات كل شركة — مساران ماليان مختلفان حتى لا تتشابه الشاشات. */
    private function companySettings(): void
    {
        $rows = [
            1 => ['employee_can_create_event' => true, 'default_funding_mode' => 'community_wallet', 'default_subsidy_type' => 'percentage', 'default_subsidy' => 100],
            2 => ['employee_can_create_event' => true, 'default_funding_mode' => 'employee_paid', 'default_subsidy_type' => 'fixed', 'default_subsidy' => 0],
            3 => ['employee_can_create_event' => false, 'default_funding_mode' => 'community_wallet', 'default_subsidy_type' => 'percentage', 'default_subsidy' => 50],
            4 => ['employee_can_create_event' => true, 'default_funding_mode' => 'community_wallet', 'default_subsidy_type' => 'fixed', 'default_subsidy' => 15000],
            5 => ['employee_can_create_event' => true, 'default_funding_mode' => 'employee_paid', 'default_subsidy_type' => 'percentage', 'default_subsidy' => 25],
        ];

        foreach ($rows as $companyId => $values) {
            if (! Company::query()->whereKey($companyId)->exists()) {
                continue;
            }

            CompanySetting::query()->updateOrCreate(
                ['company_id' => $companyId],
                $values + ['registration_close_hours' => 24, 'allow_absence_marking' => true],
            );
        }
    }

    /**
     * فروع المزوّدين ووحدات النشاط داخلها.
     *
     * الوحدة هي ما يُحجز فعلاً (H §11)، والملعب مكانها. المزوّدون الذين لا
     * ملاعب لهم يبقون بلا فروع ولا وحدات — وهي حالة «مسجَّل وغير جاهز للحجز»
     * الموجودة أصلاً في البيانات، فلا حاجة لافتعالها بحرمان مزوّد عامل.
     */
    private function providerCatalog(): void
    {
        foreach (Partner::query()->with('venues')->get() as $partner) {
            $venues = $partner->venues;

            if ($venues->isEmpty()) {
                continue;
            }

            $branch = ProviderBranch::query()->create([
                'partner_id' => $partner->id,
                'name' => 'الفرع الرئيسي — '.$partner->name,
                'address' => 'طريق الملك فهد',
                'city' => $partner->city ?? 'الرياض',
                'district' => $partner->district ?? 'حي النرجس',
                // الشكل مفتاحه اليوم لا زوج مسطّح: `isWithinWorkingHours` تقرأ
                // نافذة كل يوم على حدة، فالزوج المسطّح يُقرأ «مغلق طوال الأسبوع»
                // ولا تصير أي وحدة متاحة أبداً.
                'working_hours' => collect(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
                    ->mapWithKeys(fn (string $day) => [$day => [['from' => '06:00', 'to' => '23:59']]])
                    ->all(),
                'contact_name' => 'مسؤول الحجوزات',
                'contact_phone' => $partner->contact_phone ?? '0500000000',
                'status' => 'active',
            ]);

            foreach ($venues as $index => $venue) {
                ActivityUnit::query()->create([
                    'provider_branch_id' => $branch->id,
                    'category_id' => $venue->category_id,
                    'venue_id' => $venue->id,
                    'name' => $venue->name,
                    'min_capacity' => 4,
                    'max_capacity' => $index % 2 === 0 ? 8 : 12,
                    'pricing_type' => 'per_hour',
                    'price_halalas' => $index % 2 === 0 ? 25000 : 32000,
                    'default_duration_minutes' => 90,
                    'status' => 'active',
                ]);
            }
        }
    }

    /** نسبة العمولة السارية لكل مزوّد، ونسبة واحدة مجدولة بأثر مستقبلي. */
    private function commissionRates(User $finance): void
    {
        foreach (Partner::query()->get() as $index => $partner) {
            ProviderCommissionRate::query()->create([
                'partner_id' => $partner->id,
                'rate_percent' => [10, 12, 15][$index % 3],
                'effective_from' => Carbon::now()->startOfYear(),
                'created_by_user_id' => $finance->id,
                'reason' => 'النسبة المتفق عليها في العقد.',
            ]);
        }

        $first = Partner::query()->first();

        if ($first) {
            ProviderCommissionRate::query()->create([
                'partner_id' => $first->id,
                'rate_percent' => 11,
                'effective_from' => Carbon::now()->addMonth()->startOfMonth(),
                'created_by_user_id' => $finance->id,
                'reason' => 'تخفيض متفق عليه يبدأ من الشهر القادم.',
            ]);
        }
    }

    /** أيام التعطيل — ماضٍ وحاضر ومستقبل، حتى تُختبر التصفية الزمنية. */
    private function blackouts(User $admin): void
    {
        $dates = [
            ['اليوم الوطني السعودي', Carbon::create(Carbon::now()->year, 9, 23), Carbon::create(Carbon::now()->year, 9, 24)],
            ['إجازة عيد الفطر', Carbon::now()->addMonths(4)->startOfMonth(), Carbon::now()->addMonths(4)->startOfMonth()->addDays(4)],
            ['صيانة المرافق السنوية', Carbon::now()->subMonths(3), Carbon::now()->subMonths(3)->addDays(2)],
        ];

        foreach ($dates as [$name, $from, $to]) {
            BlackoutDate::query()->create([
                'name' => $name,
                'starts_on' => $from->toDateString(),
                'ends_on' => $to->toDateString(),
                'created_by' => $admin->id,
            ]);
        }
    }
}

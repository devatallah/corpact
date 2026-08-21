<?php

namespace Tests\Support;

use App\Enums\WalletTransactionType;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Models\Wallet;
use App\Services\Community\LeadershipService;
use App\Services\Employee\EventCreationService;
use App\Services\Events\ParticipationService;
use App\Services\Provider\ProviderRequestService;
use App\Services\Wallet\LedgerService;

/**
 * عالم سيناريوهي القبول 1 و2 (H §23): شركة حقيقية بإعداداتها، مجتمع بمحفظة
 * فرعية مموَّلة بالدفتر، مزوّد بنسبة عمولة متعاقد عليها وحساب بنكي معتمد،
 * مرفق بسعر معلوم، وقائد مجتمع ينشئ الفعالية.
 *
 * لا شيء هنا يختصر مساراً: التمويل يمر بـ{@see LedgerService}، والفعالية
 * تُنشأ بـ{@see EventCreationService::create()}، والانضمام بـ
 * {@see ParticipationService::join()} — فما يثبته السيناريو هو المنتج نفسه.
 *
 * الفارق الوحيد بين المسارين أ وب هو إعداد الشركة:
 * - **المسار أ** `community_wallet` ⇒ `percentage` بقيمة 100 (الدعم يغطي الكل).
 * - **المسار ب** `employee_paid` ⇒ `fixed` بقيمة 0 (الموظفون يدفعون الكل).
 */
final class AcceptanceWorld
{
    private function __construct(
        public readonly Company $company,
        public readonly Community $community,
        public readonly Partner $partner,
        public readonly Employee $leader,
        public readonly Category $category,
        public readonly VenuePricing $pricing,
        public readonly Venue $venue,
    ) {}

    /**
     * @param  array{funding_mode?: string, subsidy_type?: string, subsidy_value?: int, price?: float, duration?: int, wallet?: int, commission_rate?: float, fee_per_activated_employee?: int}  $options
     */
    public static function build(array $options = []): self
    {
        $fundingMode = $options['funding_mode'] ?? 'mixed';

        $company = Company::factory()->create([
            // أرقام العقد من المالك في الإنتاج — هنا قيم صريحة كي تكون
            // الفاتورة والتسوية قابلتين للتتبع رقماً رقماً.
            'contract_fee_per_activated_employee' => $options['fee_per_activated_employee'] ?? 30_000,
            'contract_monthly_minimum' => null,
        ]);

        // صف الإعدادات يُنشئه observer الشركة بقيم المواصفة الافتراضية؛
        // هنا نضبط مسار التمويل الافتراضي وحده (H §5 / §12.2).
        $settings = match ($fundingMode) {
            'community_wallet' => [
                'default_funding_mode' => 'community_wallet',
                'default_subsidy_type' => 'percentage',
                'default_subsidy' => 100,
            ],
            'employee_paid' => [
                'default_funding_mode' => 'employee_paid',
                'default_subsidy_type' => 'fixed',
                'default_subsidy' => 0,
            ],
            default => [
                'default_funding_mode' => 'mixed',
                'default_subsidy_type' => $options['subsidy_type'] ?? 'fixed',
                // مبلغ ثابت بالهللة، أو نسبة 0–100 حين `percentage`.
                'default_subsidy' => (int) ($options['subsidy_value'] ?? 0),
            ],
        };

        CompanySetting::query()->withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->update($settings);

        $community = Community::factory()->create(['company_id' => $company->id]);

        $partner = Partner::factory()->create([
            'commission_rate' => $options['commission_rate'] ?? 12.00,
            'bank_status' => 'approved',
        ]);

        $category = Category::factory()->create();

        $venue = Venue::factory()->create([
            'partner_id' => $partner->id,
            'category_id' => $category->id,
        ]);

        $pricing = VenuePricing::factory()->create([
            'venue_id' => $venue->id,
            'duration_minutes' => $options['duration'] ?? 90,
            'price' => $options['price'] ?? 300.0,
        ]);

        $leader = Employee::factory()->create(['company_id' => $company->id]);
        app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

        $world = new self(
            company: $company->fresh(),
            community: $community->fresh(),
            partner: $partner->fresh(),
            leader: $leader->fresh(),
            category: $category,
            pricing: $pricing,
            venue: $venue,
        );

        if (($options['wallet'] ?? 0) > 0) {
            $world->fundCommunityWallet((int) $options['wallet']);
        }

        return $world;
    }

    public function companyWallet(): Wallet
    {
        return Wallet::mainFor($this->company);
    }

    public function communityWallet(): Wallet
    {
        return Wallet::subFor($this->community);
    }

    /**
     * شحن المحفظة الرئيسية ثم تخصيص المبلغ كاملاً لمحفظة المجتمع — قيود دفتر
     * لا كتابة رصيد (H §12.5).
     */
    public function fundCommunityWallet(int $halalas): void
    {
        $ledger = app(LedgerService::class);

        $ledger->credit(
            $this->companyWallet(),
            WalletTransactionType::TopUp,
            $halalas,
            "acceptance:topup:{$this->company->id}",
            ['note' => 'شحن المحفظة الرئيسية بتحويل بنكي معتمد'],
        );

        $ledger->allocate(
            $this->companyWallet()->refresh(),
            $this->communityWallet(),
            $halalas,
            "acceptance:allocation:{$this->community->id}",
            null,
            'تخصيص من المحفظة الرئيسية لمحفظة المجتمع',
        );
    }

    /**
     * إنشاء الفعالية بالمسار الحقيقي: القائد ينشرها مباشرة (open) وينضم
     * تلقائياً بمقعد محجوز، بلا أي أثر مالي عند الإنشاء (H §12.3 بند 1).
     */
    public function createEvent(int $min, int $capacity, ?string $title = null): Event
    {
        return app(EventCreationService::class)->create($this->leader->fresh(), [
            'community_id' => $this->community->id,
            'partner_id' => $this->partner->id,
            'category_id' => $this->category->id,
            'venue_pricing_id' => $this->pricing->id,
            'venue_ids' => [$this->venue->id],
            // يومان لا يوم: `registration_closes_at` يُشتق بـ24 ساعة قبل البدء.
            'date' => now()->addDays(2)->toDateString(),
            'time' => '20:00',
            'capacity' => $capacity,
            'min_participants' => $min,
            'title' => $title ?? 'فعالية قبول',
        ]);
    }

    /**
     * عضو مجتمع جديد (بلا انضمام لفعالية).
     */
    public function addMember(): Employee
    {
        $employee = Employee::factory()->create(['company_id' => $this->company->id]);
        $this->community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

        return $employee->fresh();
    }

    /**
     * عضو جديد ينضم للفعالية عبر الخدمة الحقيقية.
     *
     * @return array{employee: Employee, seat: string}
     */
    public function joinNewMember(Event $event): array
    {
        $employee = $this->addMember();
        $seat = app(ParticipationService::class)->join($event->fresh(), $employee);

        return ['employee' => $employee, 'seat' => $seat];
    }

    /**
     * قبول المزوّد عبر **قناة القرار** نفسها (H §11): الطلب الذي أنشأه
     * observer الفعالية عند `pending_provider` يُقبل من حساب المزوّد، فتُحجز
     * الوحدة وتتحرك الحالة عبر آلة A7 ويُحدَّث مؤشر الموثوقية.
     */
    public function providerAccepts(Event $event): EventProviderRequest
    {
        $request = EventProviderRequest::query()
            ->where('event_id', $event->id)
            ->where('status', EventProviderRequest::STATUS_PENDING)
            ->latest('id')
            ->firstOrFail();

        return app(ProviderRequestService::class)->accept($this->partner, $request);
    }

    /**
     * إغلاق التسجيل عبر المهمة المجدولة نفسها (H §20 — كل 5 دقائق).
     */
    public function closeRegistration(Event $event): void
    {
        $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();
        test()->artisan('app:close-registration')->assertSuccessful();
    }
}

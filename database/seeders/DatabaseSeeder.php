<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeProgress;
use App\Models\Club;
use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\CommunityPoll;
use App\Models\Company;
use App\Models\Court;
use App\Models\CourtPricing;
use App\Models\Department;
use App\Models\Discount;
use App\Models\Employee;
use App\Models\League;
use App\Models\LeagueMatch;
use App\Models\Invitation;
use App\Models\Notification;
use App\Models\PlatformRevenue;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\QuickMatch;
use App\Models\QuickMatchInterest;
use App\Models\Settlement;
use App\Models\Slot;
use App\Models\Sport;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ╔══════════════════════════════════════════════════════════╗
        // ║  SPORTS                                                  ║
        // ╚══════════════════════════════════════════════════════════╝
        $padel      = Sport::create(['name' => 'بادل', 'name_en' => 'Padel', 'icon' => '/storage/sports/padel.svg']);
        $football   = Sport::create(['name' => 'كرة قدم', 'name_en' => 'Football', 'icon' => '/storage/sports/football.svg']);
        $tennis     = Sport::create(['name' => 'تنس', 'name_en' => 'Tennis', 'icon' => '/storage/sports/tennis.svg']);
        $basketball = Sport::create(['name' => 'كرة سلة', 'name_en' => 'Basketball', 'icon' => '/storage/sports/basketball.svg']);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  ADMIN                                                   ║
        // ╚══════════════════════════════════════════════════════════╝
        $admin = User::factory()->create([
            'name' => 'مدير النظام',
            'email' => 'admin@teamat.com',
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  CLUBS                                                   ║
        // ╚══════════════════════════════════════════════════════════╝

        // ── Club 1: Active, fully set up ──
        $club1 = Club::factory()->create([
            'name'            => 'نادي الرياض للبادل',
            'email'           => 'club1@teamat.com',
            'password'        => Hash::make('123456'),
            'city'            => 'الرياض',
            'district'        => 'حي الملقا',
            'contact_name'    => 'فهد العتيبي',
            'contact_title'   => 'مدير الملاعب',
            'working_hours'   => '06:00 - 00:00',
            'rating'          => 4.7,
            'total_bookings'  => 156,
            'commission_rate' => 10.00,
        ]);
        $club1->sports()->attach([$padel->id, $tennis->id]);

        $club1Courts = collect();
        foreach (range(1, 4) as $i) {
            $court = Court::factory()->create(['club_id' => $club1->id, 'sport_id' => $padel->id, 'name' => "ملعب بادل $i"]);
            $club1Courts->push($court);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 60, 'price' => 150, 'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00', 'days' => [0, 1, 2, 3]]);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 60, 'price' => 250, 'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00', 'days' => [0, 1, 2, 3]]);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 60, 'price' => 300, 'is_peak' => true, 'label' => 'نهاية الأسبوع', 'start_time' => '06:00', 'end_time' => '23:00', 'days' => [4, 5]]);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 90, 'price' => 220, 'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00']);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 90, 'price' => 350, 'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00']);
        }
        $club1Tennis = Court::factory()->create(['club_id' => $club1->id, 'sport_id' => $tennis->id, 'name' => 'ملعب تنس 1']);
        $club1Courts->push($club1Tennis);
        CourtPricing::factory()->create(['court_id' => $club1Tennis->id, 'duration_minutes' => 60, 'price' => 120, 'is_peak' => false, 'label' => 'خارج الذروة', 'start_time' => '06:00', 'end_time' => '16:00']);
        CourtPricing::factory()->create(['court_id' => $club1Tennis->id, 'duration_minutes' => 60, 'price' => 200, 'is_peak' => true, 'label' => 'ذروة', 'start_time' => '16:00', 'end_time' => '23:00']);

        // ── Club 2: Active, multi-sport ──
        $club2 = Club::factory()->create([
            'name'            => 'نادي جدة الرياضي',
            'email'           => 'club2@teamat.com',
            'password'        => Hash::make('123456'),
            'city'            => 'جدة',
            'district'        => 'حي الروضة',
            'contact_name'    => 'سعد الغامدي',
            'contact_title'   => 'مشرف',
            'working_hours'   => '06:00 - 23:00',
            'rating'          => 4.3,
            'total_bookings'  => 89,
            'commission_rate' => 12.00,
        ]);
        $club2->sports()->attach([$padel->id, $football->id]);

        $club2Courts = collect();
        foreach (range(1, 2) as $i) {
            $court = Court::factory()->create(['club_id' => $club2->id, 'sport_id' => $padel->id, 'name' => "ملعب بادل $i"]);
            $club2Courts->push($court);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 60, 'price' => 180]);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 90, 'price' => 250]);
        }
        $footballCourt = Court::factory()->create(['club_id' => $club2->id, 'sport_id' => $football->id, 'name' => 'ملعب كرة قدم']);
        $club2Courts->push($footballCourt);
        CourtPricing::factory()->create(['court_id' => $footballCourt->id, 'duration_minutes' => 60, 'price' => 350]);
        CourtPricing::factory()->create(['court_id' => $footballCourt->id, 'duration_minutes' => 90, 'price' => 500]);

        // ── Club 3: Active, Dammam ──
        $club3 = Club::factory()->create([
            'name'            => 'نادي الدمام',
            'email'           => 'club3@teamat.com',
            'password'        => Hash::make('123456'),
            'city'            => 'الدمام',
            'district'        => 'حي الشاطئ',
            'rating'          => 4.1,
            'total_bookings'  => 42,
            'commission_rate' => 10.00,
        ]);
        $club3->sports()->attach([$tennis->id, $basketball->id]);

        $club3Courts = collect();
        foreach (range(1, 2) as $i) {
            $court = Court::factory()->create(['club_id' => $club3->id, 'sport_id' => $tennis->id, 'name' => "ملعب تنس $i"]);
            $club3Courts->push($court);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 60, 'price' => 150]);
        }
        $basketCourt = Court::factory()->create(['club_id' => $club3->id, 'sport_id' => $basketball->id, 'name' => 'ملعب سلة']);
        $club3Courts->push($basketCourt);
        CourtPricing::factory()->create(['court_id' => $basketCourt->id, 'duration_minutes' => 60, 'price' => 250]);

        // ── Club 4: Pending (waiting admin approval) ──
        $club4 = Club::factory()->pending()->create([
            'name'          => 'نادي الخبر الرياضي',
            'email'         => 'khobar@club.sa',
            'password'      => null,
            'city'          => 'الخبر',
            'district'      => 'حي العقربية',
            'contact_name'  => 'عادل المحمد',
            'contact_title' => 'مالك النادي',
            'courts_count'  => 3,
            'notes'         => 'نادي جديد يحتوي على 3 ملاعب بادل حديثة',
        ]);
        $club4->sports()->attach([$padel->id]);

        // ── Club 5: Pending (another pending for admin) ──
        Club::factory()->pending()->create([
            'name'          => 'نادي المدينة الرياضي',
            'email'         => 'madinah@club.sa',
            'password'      => null,
            'city'          => 'المدينة',
            'district'      => 'حي السلام',
            'contact_name'  => 'خالد الحسن',
            'contact_title' => 'المدير العام',
            'courts_count'  => 5,
            'notes'         => 'نادي كبير يضم ملاعب متعددة الرياضات',
        ]);

        // ── Club 6: Approved but not activated (has activation token) ──
        Club::factory()->create([
            'name'             => 'نادي النخيل',
            'email'            => 'nakheel@club.sa',
            'password'         => null,
            'city'             => 'الرياض',
            'district'         => 'حي النخيل',
            'activation_token' => Str::random(64),
            'email_verified_at' => null,
        ]);

        // ── Slots / Schedule ──
        $allCourts = $club1Courts->merge($club2Courts)->merge($club3Courts);
        $slotHours = [
            ['06:00', '07:00'], ['07:00', '08:00'], ['08:00', '09:00'],
            ['16:00', '17:00'], ['17:00', '18:00'], ['18:00', '19:00'],
            ['19:00', '20:00'], ['20:00', '21:00'], ['21:00', '22:00'],
            ['22:00', '23:00'],
        ];
        foreach ($allCourts as $court) {
            foreach (range(0, 6) as $dayOffset) {
                $date = now()->addDays($dayOffset)->toDateString();
                foreach ($slotHours as [$start, $end]) {
                    Slot::create([
                        'court_id'   => $court->id,
                        'date'       => $date,
                        'start_time' => $start,
                        'end_time'   => $end,
                        'status'     => fake()->boolean(25) ? 'booked' : 'available',
                    ]);
                }
            }
        }

        // ╔══════════════════════════════════════════════════════════╗
        // ║  COMPANIES                                               ║
        // ╚══════════════════════════════════════════════════════════╝

        // ── Company 1: Active, full data ──
        $company1 = Company::factory()->create([
            'name'           => 'شركة التقنية المتقدمة',
            'email'          => 'hr@advancedtech.sa',
            'password'       => Hash::make('123456'),
            'hr_name'        => 'نورة القحطاني',
            'hr_phone'       => '0501234567',
            'hr_title'       => 'مديرة الموارد البشرية',
            'domain'         => 'advancedtech.sa',
            'sector'         => 'تقنية',
            'employee_count' => 120,
            'city'           => 'الرياض',
        ]);
        $wallet1 = Wallet::factory()->create(['company_id' => $company1->id, 'balance' => 45000]);

        // ── Company 2: Active ──
        $company2 = Company::factory()->create([
            'name'           => 'مجموعة الابتكار',
            'email'          => 'hr@innovation.sa',
            'password'       => Hash::make('123456'),
            'hr_name'        => 'ريم السعيد',
            'hr_phone'       => '0559876543',
            'hr_title'       => 'مسؤولة الرفاهية',
            'domain'         => 'innovation.sa',
            'sector'         => 'مالية',
            'employee_count' => 80,
            'city'           => 'جدة',
        ]);
        $wallet2 = Wallet::factory()->create(['company_id' => $company2->id, 'balance' => 30000]);

        // ── Company 3: Pending (waiting admin approval) ──
        $company3 = Company::factory()->pending()->create([
            'name'                => 'شركة الأفق الجديد',
            'email'               => 'hr@horizon.sa',
            'password'            => null,
            'hr_name'             => 'سارة الأحمد',
            'hr_phone'            => '0551112233',
            'sector'              => 'عقارات',
            'city'                => 'الرياض',
            'requester_name'      => 'محمد العمر',
            'requester_email'     => 'mohammed@horizon.sa',
            'requester_phone'     => '0551112200',
            'employee_count_range' => '50-100',
            'notes'               => 'نرغب في تسجيل الشركة لتنظيم أنشطة رياضية للموظفين',
        ]);

        // ── Company 4: Pending ──
        Company::factory()->pending()->create([
            'name'                => 'شركة البناء الحديث',
            'email'               => 'hr@modern-build.sa',
            'password'            => null,
            'hr_name'             => 'عهود الفيصل',
            'hr_phone'            => '0561234567',
            'sector'              => 'عقارات',
            'city'                => 'جدة',
            'requester_name'      => 'طلال الناصر',
            'requester_email'     => 'talal@modern-build.sa',
            'requester_phone'     => '0561234500',
            'employee_count_range' => '100-200',
        ]);

        // ── Company 5: Approved but not activated ──
        Company::factory()->create([
            'name'              => 'شركة الطاقة الخضراء',
            'email'             => 'hr@greenergy.sa',
            'password'          => null,
            'hr_name'           => 'لمياء الحربي',
            'hr_phone'          => '0571234567',
            'sector'            => 'طاقة',
            'city'              => 'الدمام',
            'activation_token'  => Str::random(64),
            'email_verified_at' => null,
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  DEPARTMENTS                                               ║
        // ╚══════════════════════════════════════════════════════════╝
        $c1Departments = collect();
        foreach (['تقنية', 'تسويق', 'مبيعات', 'موارد بشرية', 'مالية'] as $deptName) {
            $c1Departments->push(Department::create(['company_id' => $company1->id, 'name' => $deptName]));
        }

        $c2Departments = collect();
        foreach (['مالية', 'عمليات', 'تحليل', 'استثمار'] as $deptName) {
            $c2Departments->push(Department::create(['company_id' => $company2->id, 'name' => $deptName]));
        }

        // ╔══════════════════════════════════════════════════════════╗
        // ║  EMPLOYEES                                               ║
        // ╚══════════════════════════════════════════════════════════╝

        // Company 1 employees
        $c1Names = [
            'أحمد السالم', 'محمد الحربي', 'عبدالله الغامدي', 'سلطان العمري',
            'تركي الزهراني', 'ياسر المالكي', 'عمر البلوي', 'حسن الشمري',
            'ماجد الرشيدي', 'بدر الحارثي', 'عادل السبيعي', 'سامي القرني',
            'وليد الأحمدي', 'طارق المطيري', 'فيصل العنزي',
        ];
        $c1Employees = collect();
        foreach ($c1Names as $i => $name) {
            $c1Employees->push(Employee::factory()->create([
                'name'          => $name,
                'email'         => 'emp' . ($i + 1) . '@advancedtech.sa',
                'password'      => Hash::make('123456'),
                'company_id'    => $company1->id,
                'department_id' => $c1Departments->random()->id,
            ]));
        }

        // Company 2 employees
        $c2Names = [
            'يوسف الصالح', 'عبدالرحمن الفهد', 'نايف الشهري', 'مشعل العتيبي',
            'رائد الحمدان', 'حمد البقمي', 'زياد الجهني', 'أنس الكعبي',
            'خالد الحسيني', 'منصور الداود',
        ];
        $c2Employees = collect();
        foreach ($c2Names as $i => $name) {
            $c2Employees->push(Employee::factory()->create([
                'name'          => $name,
                'email'         => 'emp' . ($i + 1) . '@innovation.sa',
                'password'      => Hash::make('123456'),
                'company_id'    => $company2->id,
                'department_id' => $c2Departments->random()->id,
            ]));
        }

        // ╔══════════════════════════════════════════════════════════╗
        // ║  COMMUNITIES                                             ║
        // ╚══════════════════════════════════════════════════════════╝

        // Company 1 communities
        $padelCom1 = Community::factory()->create([
            'name' => 'فريق البادل', 'description' => 'مجتمع محبي رياضة البادل في الشركة',
            'icon' => '🏸', 'color' => '#3B82F6', 'company_id' => $company1->id,
            'sport_id' => $padel->id, 'leader_id' => $c1Employees[0]->id,
            'member_count' => 10, 'balance' => 2500,
        ]);
        $footballCom1 = Community::factory()->create([
            'name' => 'فريق كرة القدم', 'description' => 'مجتمع كرة القدم للموظفين',
            'icon' => '⚽', 'color' => '#10B981', 'company_id' => $company1->id,
            'sport_id' => $football->id, 'leader_id' => $c1Employees[3]->id,
            'member_count' => 12, 'balance' => 1800,
        ]);
        $tennisCom1 = Community::factory()->create([
            'name' => 'نادي التنس', 'description' => 'لعشاق التنس',
            'icon' => '🎾', 'color' => '#F59E0B', 'company_id' => $company1->id,
            'sport_id' => $tennis->id, 'leader_id' => $c1Employees[6]->id,
            'member_count' => 6, 'balance' => 800,
        ]);

        // Company 2 communities
        $padelCom2 = Community::factory()->create([
            'name' => 'بادل الابتكار', 'description' => 'فريق البادل في مجموعة الابتكار',
            'icon' => '🏸', 'color' => '#8B5CF6', 'company_id' => $company2->id,
            'sport_id' => $padel->id, 'leader_id' => $c2Employees[0]->id,
            'member_count' => 8, 'balance' => 1500,
        ]);
        $basketCom2 = Community::factory()->create([
            'name' => 'فريق السلة', 'description' => 'مجتمع كرة السلة',
            'icon' => '🏀', 'color' => '#EF4444', 'company_id' => $company2->id,
            'sport_id' => $basketball->id, 'leader_id' => $c2Employees[4]->id,
            'member_count' => 6, 'balance' => 900,
        ]);

        // Attach members
        $padelCom1->members()->attach($c1Employees->take(10)->mapWithKeys(fn ($e) => [$e->id => ['role' => 'member', 'joined_at' => now()->subDays(rand(5, 60))]])->all());
        $padelCom1->members()->updateExistingPivot($c1Employees[0]->id, ['role' => 'captain']);

        $footballCom1->members()->attach($c1Employees->slice(2, 12)->mapWithKeys(fn ($e) => [$e->id => ['role' => 'member', 'joined_at' => now()->subDays(rand(5, 60))]])->all());
        $footballCom1->members()->updateExistingPivot($c1Employees[3]->id, ['role' => 'captain']);

        $tennisCom1->members()->attach($c1Employees->slice(5, 6)->mapWithKeys(fn ($e) => [$e->id => ['role' => 'member', 'joined_at' => now()->subDays(rand(5, 60))]])->all());

        $padelCom2->members()->attach($c2Employees->take(8)->mapWithKeys(fn ($e) => [$e->id => ['role' => 'member', 'joined_at' => now()->subDays(rand(5, 40))]])->all());
        $padelCom2->members()->updateExistingPivot($c2Employees[0]->id, ['role' => 'captain']);

        $basketCom2->members()->attach($c2Employees->slice(3, 6)->mapWithKeys(fn ($e) => [$e->id => ['role' => 'member', 'joined_at' => now()->subDays(rand(5, 40))]])->all());


        // ╔══════════════════════════════════════════════════════════╗
        // ║  WALLET TRANSACTIONS                                     ║
        // ╚══════════════════════════════════════════════════════════╝
        WalletTransaction::factory()->credit()->create(['wallet_id' => $wallet1->id, 'amount' => 50000, 'description' => 'شحن رصيد أولي']);
        WalletTransaction::factory()->debit()->create(['wallet_id' => $wallet1->id, 'community_id' => $padelCom1->id, 'amount' => 2500, 'description' => 'توزيع على فريق البادل']);
        WalletTransaction::factory()->debit()->create(['wallet_id' => $wallet1->id, 'community_id' => $footballCom1->id, 'amount' => 1800, 'description' => 'توزيع على فريق كرة القدم']);

        WalletTransaction::factory()->credit()->create(['wallet_id' => $wallet2->id, 'amount' => 35000, 'description' => 'شحن رصيد']);
        WalletTransaction::factory()->debit()->create(['wallet_id' => $wallet2->id, 'community_id' => $padelCom2->id, 'amount' => 1500, 'description' => 'توزيع على فريق بادل الابتكار']);
        WalletTransaction::factory()->debit()->create(['wallet_id' => $wallet2->id, 'community_id' => $basketCom2->id, 'amount' => 900, 'description' => 'توزيع على فريق السلة']);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  SETTLEMENTS                                             ║
        // ╚══════════════════════════════════════════════════════════╝
        $s1 = Settlement::factory()->paid()->create([
            'club_id' => $club1->id, 'company_id' => $company1->id,
            'period' => now()->subMonth()->format('Y-m'), 'events_count' => 8,
            'gross_amount' => 2240, 'commission_amount' => 224, 'net_amount' => 2016,
        ]);
        Settlement::factory()->create([
            'club_id' => $club1->id, 'company_id' => $company1->id,
            'period' => now()->format('Y-m'), 'events_count' => 4,
            'gross_amount' => 1120, 'commission_amount' => 112, 'net_amount' => 1008,
            'status' => 'pending',
        ]);
        Settlement::factory()->paid()->create([
            'club_id' => $club2->id, 'company_id' => $company2->id,
            'period' => now()->subMonth()->format('Y-m'), 'events_count' => 5,
            'gross_amount' => 900, 'commission_amount' => 108, 'net_amount' => 792,
        ]);
        Settlement::factory()->create([
            'club_id' => $club2->id, 'company_id' => $company1->id,
            'period' => now()->format('Y-m'), 'events_count' => 2,
            'gross_amount' => 700, 'commission_amount' => 84, 'net_amount' => 616,
            'status' => 'processing',
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  PLATFORM REVENUE                                        ║
        // ╚══════════════════════════════════════════════════════════╝
        PlatformRevenue::factory()->create(['settlement_id' => $s1->id, 'amount' => 224, 'source' => 'commission', 'description' => 'عمولة تسوية نادي الرياض', 'revenue_date' => now()->subMonth()->endOfMonth()->toDateString()]);
        PlatformRevenue::factory()->create(['amount' => 108, 'source' => 'commission', 'description' => 'عمولة تسوية نادي جدة', 'revenue_date' => now()->subMonth()->endOfMonth()->toDateString()]);
        PlatformRevenue::factory()->create(['amount' => 500, 'source' => 'subscription', 'description' => 'اشتراك شركة التقنية المتقدمة', 'revenue_date' => now()->startOfMonth()->toDateString()]);
        PlatformRevenue::factory()->create(['amount' => 500, 'source' => 'subscription', 'description' => 'اشتراك مجموعة الابتكار', 'revenue_date' => now()->startOfMonth()->toDateString()]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  NOTIFICATIONS — realistic per portal                    ║
        // ╚══════════════════════════════════════════════════════════╝

        // Admin
        Notification::factory()->unread()->create(['notifiable_type' => User::class, 'notifiable_id' => $admin->id, 'type' => 'system', 'title' => 'طلب تسجيل نادي جديد', 'body' => 'نادي الخبر الرياضي بانتظار الموافقة.']);
        Notification::factory()->unread()->create(['notifiable_type' => User::class, 'notifiable_id' => $admin->id, 'type' => 'system', 'title' => 'طلب تسجيل شركة', 'body' => 'شركة الأفق الجديد بانتظار الموافقة.']);
        Notification::factory()->read()->create(['notifiable_type' => User::class, 'notifiable_id' => $admin->id, 'type' => 'payment', 'title' => 'إيرادات جديدة', 'body' => 'تم تحصيل عمولة 224 ر.س من تسوية نادي الرياض.']);

        // Company 1
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل مقترح', 'body' => 'اقترح نادي الرياض وقتاً بديلاً لحدث تدريب بادل مسائي.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل مقترح', 'body' => 'اقترح نادي جدة وقتاً بديلاً لمباراة كرة القدم.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'event_approved', 'title' => 'تمت الموافقة على الحجز', 'body' => 'وافق نادي الرياض على حجز بادل الأربعاء.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'event_rejected', 'title' => 'تم رفض الحجز', 'body' => 'رفض نادي الرياض حجزك. السبب: الملعب محجوز.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'event_created', 'title' => 'حدث جديد', 'body' => 'أنشأ أحمد السالم حدث بادل جديد.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'payment', 'title' => 'خصم من المحفظة', 'body' => 'تم خصم 100 ر.س كدعم لحدث بادل.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'system', 'title' => 'مرحباً بك في تيمات', 'body' => 'تم تفعيل حسابك. ابدأ بإنشاء مجتمعات لموظفيك.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'reminder', 'title' => 'تذكير: حدث غداً', 'body' => 'لديك حدث بادل غداً الساعة 6 مساءً.']);

        // Company 2
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل مقترح', 'body' => 'اقترح نادي جدة وقتاً بديلاً للقاء البادل.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل جديد', 'body' => 'اقترح نادي الرياض وقتاً بديلاً ثانياً لحدث بادل نهاية الأسبوع.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'event_approved', 'title' => 'تمت الموافقة', 'body' => 'وافق نادي جدة على حجز بادل مساء الخميس.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'system', 'title' => 'مرحباً بك', 'body' => 'تم تفعيل حساب شركتك بنجاح.']);

        // Club 1
        Notification::factory()->unread()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club1->id, 'type' => 'event_created', 'title' => 'طلب حجز جديد', 'body' => 'طلب حجز من شركة التقنية المتقدمة — تدريب أسبوعي.']);
        Notification::factory()->unread()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club1->id, 'type' => 'event_created', 'title' => 'طلب حجز جديد', 'body' => 'طلب حجز من مجموعة الابتكار — تدريب بادل.']);
        Notification::factory()->unread()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club1->id, 'type' => 'alternative_rejected', 'title' => 'رفض الوقت البديل', 'body' => 'رفضت مجموعة الابتكار وقتك البديل الأول لحدث بادل نهاية الأسبوع.']);
        Notification::factory()->unread()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club1->id, 'type' => 'payment', 'title' => 'تسوية مالية', 'body' => 'تم إصدار تسوية بمبلغ 2,016 ر.س.']);
        Notification::factory()->read()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club1->id, 'type' => 'system', 'title' => 'مرحباً بك في تيمات', 'body' => 'تم تفعيل حساب ناديك بنجاح.']);

        // Club 2
        Notification::factory()->unread()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club2->id, 'type' => 'event_created', 'title' => 'طلب حجز جديد', 'body' => 'طلب حجز من شركة التقنية المتقدمة — مباراة ودية.']);
        Notification::factory()->unread()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club2->id, 'type' => 'event_created', 'title' => 'طلب حجز جديد', 'body' => 'طلب حجز من مجموعة الابتكار — مباراة صباحية.']);
        Notification::factory()->read()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club2->id, 'type' => 'alternative_accepted', 'title' => 'تم قبول البديل', 'body' => 'قبلت مجموعة الابتكار الوقت البديل لحدث بادل.']);

        // Employee notifications
        foreach ($c1Employees->take(5) as $emp) {
            Notification::factory()->unread()->create(['notifiable_type' => Employee::class, 'notifiable_id' => $emp->id, 'type' => 'event_created', 'title' => 'حدث جديد في مجتمعك', 'body' => 'تم إنشاء حدث بادل جديد في فريق البادل.']);
            Notification::factory()->read()->create(['notifiable_type' => Employee::class, 'notifiable_id' => $emp->id, 'type' => 'reminder', 'title' => 'تذكير بالفعالية', 'body' => 'لديك فعالية غداً.']);
        }
        foreach ($c2Employees->take(4) as $emp) {
            Notification::factory()->unread()->create(['notifiable_type' => Employee::class, 'notifiable_id' => $emp->id, 'type' => 'event_created', 'title' => 'حدث جديد', 'body' => 'تم إنشاء حدث في بادل الابتكار.']);
        }

        // ╔══════════════════════════════════════════════════════════╗
        // ║  INVITATIONS                                             ║
        // ╚══════════════════════════════════════════════════════════╝
        Invitation::factory()->create(['company_id' => $company1->id, 'invited_by' => $c1Employees[0]->id, 'email' => 'new1@advancedtech.sa', 'token' => Str::random(64)]);
        Invitation::factory()->create(['company_id' => $company1->id, 'invited_by' => $c1Employees[0]->id, 'email' => 'new2@advancedtech.sa', 'token' => Str::random(64)]);
        Invitation::factory()->accepted()->create(['company_id' => $company1->id, 'invited_by' => $c1Employees[0]->id, 'email' => 'joined@advancedtech.sa']);
        Invitation::factory()->create(['company_id' => $company2->id, 'invited_by' => $c2Employees[0]->id, 'email' => 'new1@innovation.sa', 'token' => Str::random(64)]);
        Invitation::factory()->expired()->create(['company_id' => $company2->id, 'invited_by' => $c2Employees[0]->id, 'email' => 'old@innovation.sa']);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  COMMUNITY ANNOUNCEMENTS                                 ║
        // ╚══════════════════════════════════════════════════════════╝
        CommunityAnnouncement::factory()->create(['community_id' => $padelCom1->id, 'employee_id' => $c1Employees[0]->id, 'body' => 'مرحباً بالجميع! سيتم تنظيم بطولة شهرية للبادل بدءاً من الشهر القادم.']);
        CommunityAnnouncement::factory()->create(['community_id' => $padelCom1->id, 'employee_id' => $c1Employees[0]->id, 'body' => 'تذكير: التدريب الأسبوعي كل يوم أربعاء الساعة 6 مساءً.']);
        CommunityAnnouncement::factory()->create(['community_id' => $footballCom1->id, 'employee_id' => $c1Employees[3]->id, 'body' => 'تهانينا لفريقنا على الفوز في مباراة الأسبوع الماضي!']);
        CommunityAnnouncement::factory()->create(['community_id' => $footballCom1->id, 'employee_id' => $c1Employees[4]->id, 'body' => 'التمرين القادم يوم الأحد الساعة 8 مساءً، الحضور إلزامي.']);
        CommunityAnnouncement::factory()->create(['community_id' => $tennisCom1->id, 'employee_id' => $c1Employees[6]->id, 'body' => 'نبحث عن أعضاء جدد لنادي التنس، رشحوا زملاءكم!']);
        CommunityAnnouncement::factory()->create(['community_id' => $padelCom2->id, 'employee_id' => $c2Employees[0]->id, 'body' => 'أهلاً بالأعضاء الجدد في فريق بادل الابتكار!']);
        CommunityAnnouncement::factory()->create(['community_id' => $basketCom2->id, 'employee_id' => $c2Employees[4]->id, 'body' => 'بطولة السلة الشهرية ستبدأ قريباً، سجلوا أسماءكم.']);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  DISCOUNTS                                                ║
        // ╚══════════════════════════════════════════════════════════╝

        // Club 1 → Company 1, Padel community — 15% one-time
        Discount::create([
            'club_id' => $club1->id,
            'company_id' => $company1->id,
            'community_id' => $padelCom1->id,
            'name' => 'خصم ترحيبي',
            'type' => 'percentage',
            'value' => 15,
            'usage' => 'one_time',
            'status' => 'active',
        ]);

        // Club 1 → Company 2, Padel community — date range with time restriction
        Discount::create([
            'club_id' => $club1->id,
            'company_id' => $company2->id,
            'community_id' => $padelCom2->id,
            'name' => 'خصم الصيف',
            'type' => 'percentage',
            'value' => 20,
            'usage' => 'date_range',
            'starts_at' => now()->startOfMonth()->toDateString(),
            'expires_at' => now()->addMonths(2)->endOfMonth()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '14:00',
            'status' => 'active',
        ]);

        // Club 2 → Company 1, Football community — fixed amount
        Discount::create([
            'club_id' => $club2->id,
            'company_id' => $company1->id,
            'community_id' => $footballCom1->id,
            'name' => 'خصم كرة القدم',
            'type' => 'fixed',
            'value' => 50,
            'usage' => 'date_range',
            'starts_at' => now()->subMonth()->toDateString(),
            'expires_at' => now()->addMonth()->toDateString(),
            'status' => 'active',
        ]);

        // Expired discount for testing
        Discount::create([
            'club_id' => $club1->id,
            'company_id' => $company1->id,
            'community_id' => $tennisCom1->id,
            'name' => 'عرض رمضان',
            'type' => 'percentage',
            'value' => 25,
            'usage' => 'date_range',
            'starts_at' => now()->subMonths(3)->toDateString(),
            'expires_at' => now()->subMonth()->toDateString(),
            'status' => 'expired',
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  LEAGUES                                                 ║
        // ╚══════════════════════════════════════════════════════════╝

        // League 1: Round-robin in padel community (Company 1) — with some results
        $rrLeague = League::create([
            'community_id' => $padelCom1->id,
            'created_by' => $c1Employees[0]->id,
            'name' => 'دوري البادل بين الأقسام',
            'format' => 'single_round_robin',
            'status' => 'active',
        ]);
        $rrDeptIds = $c1Departments->take(4)->pluck('id')->toArray();
        foreach ($rrDeptIds as $i => $deptId) {
            $rrLeague->departments()->attach($deptId, ['seed_order' => $i + 1]);
        }
        // Generate round-robin matches
        $matchNum = 1;
        for ($i = 0; $i < count($rrDeptIds); $i++) {
            for ($j = $i + 1; $j < count($rrDeptIds); $j++) {
                $played = $matchNum <= 4; // first 4 matches played
                LeagueMatch::create([
                    'league_id' => $rrLeague->id,
                    'department_a_id' => $rrDeptIds[$i],
                    'department_b_id' => $rrDeptIds[$j],
                    'round' => 1,
                    'match_number' => $matchNum,
                    'score_a' => $played ? rand(0, 4) : null,
                    'score_b' => $played ? rand(0, 4) : null,
                    'status' => $played ? 'played' : 'pending',
                ]);
                $matchNum++;
            }
        }

        // League 2: Knockout in football community (Company 1) — 4 teams
        $koLeague = League::create([
            'community_id' => $footballCom1->id,
            'created_by' => $c1Employees[3]->id,
            'name' => 'كأس كرة القدم',
            'format' => 'knockout',
            'status' => 'active',
        ]);
        $koDeptIds = $c1Departments->take(4)->pluck('id')->toArray();
        foreach ($koDeptIds as $i => $deptId) {
            $koLeague->departments()->attach($deptId, ['seed_order' => $i + 1]);
        }
        // Semi-finals (round 1)
        $semi1 = LeagueMatch::create([
            'league_id' => $koLeague->id,
            'department_a_id' => $koDeptIds[0],
            'department_b_id' => $koDeptIds[1],
            'round' => 1,
            'match_number' => 1,
            'round_label' => 'نصف النهائي',
            'score_a' => 3, 'score_b' => 1,
            'status' => 'played',
        ]);
        $semi2 = LeagueMatch::create([
            'league_id' => $koLeague->id,
            'department_a_id' => $koDeptIds[2],
            'department_b_id' => $koDeptIds[3],
            'round' => 1,
            'match_number' => 2,
            'round_label' => 'نصف النهائي',
            'score_a' => 2, 'score_b' => 4,
            'status' => 'played',
        ]);
        // Final — winners advance
        LeagueMatch::create([
            'league_id' => $koLeague->id,
            'department_a_id' => $koDeptIds[0], // winner of semi1
            'department_b_id' => $koDeptIds[3], // winner of semi2
            'round' => 2,
            'match_number' => 3,
            'round_label' => 'النهائي',
        ]);
        // Third-place — losers
        LeagueMatch::create([
            'league_id' => $koLeague->id,
            'department_a_id' => $koDeptIds[1], // loser of semi1
            'department_b_id' => $koDeptIds[2], // loser of semi2
            'round' => 2,
            'match_number' => 4,
            'round_label' => 'المركز الثالث',
            'is_third_place' => true,
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  CHALLENGES                                              ║
        // ╚══════════════════════════════════════════════════════════╝

        $challenge1 = Challenge::create([
            'title' => 'شارك في 3 فعاليات هذا الشهر',
            'description' => 'انضم لـ 3 فعاليات على الأقل خلال هذا الشهر',
            'type' => 'events_count',
            'target_count' => 3,
            'starts_at' => now()->startOfMonth()->toDateString(),
            'ends_at' => now()->endOfMonth()->toDateString(),
            'status' => 'active',
        ]);
        $challenge2 = Challenge::create([
            'title' => 'شارك في 5 فعاليات هذا الشهر',
            'description' => 'للمتحمسين! حقق 5 مشاركات هذا الشهر',
            'type' => 'events_count',
            'target_count' => 5,
            'starts_at' => now()->startOfMonth()->toDateString(),
            'ends_at' => now()->endOfMonth()->toDateString(),
            'status' => 'active',
        ]);

        // Progress for some employees
        ChallengeProgress::create(['challenge_id' => $challenge1->id, 'employee_id' => $c1Employees[0]->id, 'current_count' => 3, 'completed_at' => now()->subDays(2)]);
        ChallengeProgress::create(['challenge_id' => $challenge1->id, 'employee_id' => $c1Employees[1]->id, 'current_count' => 2]);
        ChallengeProgress::create(['challenge_id' => $challenge1->id, 'employee_id' => $c1Employees[3]->id, 'current_count' => 1]);
        ChallengeProgress::create(['challenge_id' => $challenge2->id, 'employee_id' => $c1Employees[0]->id, 'current_count' => 3]);
        ChallengeProgress::create(['challenge_id' => $challenge2->id, 'employee_id' => $c2Employees[0]->id, 'current_count' => 1]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  POLLS                                                    ║
        // ╚══════════════════════════════════════════════════════════╝

        // Poll 1: Active poll in padel community 1
        $poll1 = CommunityPoll::create([
            'community_id' => $padelCom1->id,
            'employee_id' => $c1Employees[0]->id,
            'question' => 'متى تفضلون نلعب هالأسبوع؟',
            'status' => 'active',
        ]);
        $opt1a = PollOption::create(['poll_id' => $poll1->id, 'label' => 'الأربعاء مساءً', 'sort_order' => 1]);
        $opt1b = PollOption::create(['poll_id' => $poll1->id, 'label' => 'الخميس مساءً', 'sort_order' => 2]);
        $opt1c = PollOption::create(['poll_id' => $poll1->id, 'label' => 'الجمعة صباحاً', 'sort_order' => 3]);
        PollVote::create(['poll_id' => $poll1->id, 'option_id' => $opt1b->id, 'employee_id' => $c1Employees[1]->id]);
        PollVote::create(['poll_id' => $poll1->id, 'option_id' => $opt1b->id, 'employee_id' => $c1Employees[2]->id]);
        PollVote::create(['poll_id' => $poll1->id, 'option_id' => $opt1a->id, 'employee_id' => $c1Employees[3]->id]);
        PollVote::create(['poll_id' => $poll1->id, 'option_id' => $opt1c->id, 'employee_id' => $c1Employees[4]->id]);
        PollVote::create(['poll_id' => $poll1->id, 'option_id' => $opt1b->id, 'employee_id' => $c1Employees[5]->id]);

        // Poll 2: Closed poll in football community
        $poll2 = CommunityPoll::create([
            'community_id' => $footballCom1->id,
            'employee_id' => $c1Employees[3]->id,
            'question' => 'وش أفضل نادي لكرة القدم؟',
            'status' => 'closed',
        ]);
        $opt2a = PollOption::create(['poll_id' => $poll2->id, 'label' => 'نادي الرياض للبادل', 'sort_order' => 1]);
        $opt2b = PollOption::create(['poll_id' => $poll2->id, 'label' => 'نادي جدة الرياضي', 'sort_order' => 2]);
        PollVote::create(['poll_id' => $poll2->id, 'option_id' => $opt2b->id, 'employee_id' => $c1Employees[4]->id]);
        PollVote::create(['poll_id' => $poll2->id, 'option_id' => $opt2b->id, 'employee_id' => $c1Employees[5]->id]);
        PollVote::create(['poll_id' => $poll2->id, 'option_id' => $opt2a->id, 'employee_id' => $c1Employees[6]->id]);

        // Poll 3: Active poll in company 2
        $poll3 = CommunityPoll::create([
            'community_id' => $padelCom2->id,
            'employee_id' => $c2Employees[0]->id,
            'question' => 'نسوي بطولة الشهر الجاي؟',
            'expires_at' => now()->addDays(5),
            'status' => 'active',
        ]);
        PollOption::create(['poll_id' => $poll3->id, 'label' => 'نعم', 'sort_order' => 1]);
        PollOption::create(['poll_id' => $poll3->id, 'label' => 'لا', 'sort_order' => 2]);
        PollOption::create(['poll_id' => $poll3->id, 'label' => 'الشهر اللي بعده أفضل', 'sort_order' => 3]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  QUICK MATCHES                                            ║
        // ╚══════════════════════════════════════════════════════════╝

        // Manual quick match — employee created
        $qm1 = QuickMatch::create([
            'community_id' => $padelCom1->id,
            'created_by' => $c1Employees[1]->id,
            'preferred_date' => now()->addDays(2)->toDateString(),
            'preferred_time' => '18:30',
            'message' => 'نبي نلعب بادل بعد الدوام، مين معي؟',
            'source' => 'manual',
            'status' => 'open',
        ]);
        QuickMatchInterest::create(['quick_match_id' => $qm1->id, 'employee_id' => $c1Employees[0]->id]);
        QuickMatchInterest::create(['quick_match_id' => $qm1->id, 'employee_id' => $c1Employees[2]->id]);
        QuickMatchInterest::create(['quick_match_id' => $qm1->id, 'employee_id' => $c1Employees[4]->id]);

        // Manual quick match in football community
        $qm2 = QuickMatch::create([
            'community_id' => $footballCom1->id,
            'created_by' => $c1Employees[3]->id,
            'preferred_date' => now()->addDays(3)->toDateString(),
            'preferred_time' => '20:00',
            'message' => 'مباراة ودية يوم الخميس، نحتاج 10 لاعبين',
            'source' => 'manual',
            'status' => 'open',
        ]);
        QuickMatchInterest::create(['quick_match_id' => $qm2->id, 'employee_id' => $c1Employees[4]->id]);
        QuickMatchInterest::create(['quick_match_id' => $qm2->id, 'employee_id' => $c1Employees[5]->id]);

        // Auto-suggested quick match
        QuickMatch::create([
            'community_id' => $tennisCom1->id,
            'created_by' => null,
            'message' => 'مجتمعكم ما لعب من فترة، وش رايكم نسوي مباراة؟',
            'source' => 'auto',
            'status' => 'open',
        ]);

        // Auto-suggested for company 2
        QuickMatch::create([
            'community_id' => $basketCom2->id,
            'created_by' => null,
            'message' => 'مجتمعكم ما لعب من فترة، وش رايكم نسوي مباراة؟',
            'source' => 'auto',
            'status' => 'open',
        ]);

        // Converted quick match (already turned into event)
        QuickMatch::create([
            'community_id' => $padelCom2->id,
            'created_by' => $c2Employees[0]->id,
            'preferred_date' => now()->subDays(3)->toDateString(),
            'preferred_time' => '19:00',
            'message' => 'بادل نهاية الأسبوع',
            'source' => 'manual',
            'status' => 'converted',
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  WEEKLY DIGEST & NUDGE NOTIFICATIONS                      ║
        // ╚══════════════════════════════════════════════════════════╝

        // Weekly digest notifications
        foreach ($c1Employees->take(3) as $emp) {
            Notification::factory()->unread()->create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $emp->id,
                'type' => 'weekly_digest',
                'title' => 'ملخصك الأسبوعي',
                'body' => "📅 لديك 3 فعاليات قادمة هذا الأسبوع\n👥 انضم 2 أعضاء جدد لمجتمعاتك\n🏆 تم لعب 4 مباريات في الدوريات\n🔥 سلسلتك: 3 أسابيع متتالية",
                'data' => ['upcoming_events_count' => 3, 'new_members_count' => 2, 'matches_played' => 4, 'streak' => 3],
            ]);
        }

        // Nudge notifications
        Notification::factory()->unread()->create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $c1Employees[8]->id,
            'type' => 'nudge_inactive',
            'title' => 'وحشتنا! 👋',
            'body' => 'فريقك سوّى فعاليات وأنت غايب، ارجع العب معهم!',
        ]);
        Notification::factory()->unread()->create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $c1Employees[9]->id,
            'type' => 'nudge_inactive',
            'title' => 'وحشتنا! 👋',
            'body' => 'فريقك سوّى فعاليات وأنت غايب، ارجع العب معهم!',
        ]);
        Notification::factory()->unread()->create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $c1Employees[10]->id,
            'type' => 'nudge_new_member',
            'title' => 'وقت أول مباراة! 🏸',
            'body' => 'انضميت لـ فريق البادل ولسّا ما لعبت، أول مباراة دايم أحلى!',
            'data' => ['community_id' => $padelCom1->id],
        ]);
        Notification::factory()->unread()->create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $c1Employees[0]->id,
            'type' => 'nudge_community',
            'title' => 'مجتمعك يحتاجك! 🏃',
            'body' => 'مجتمع نادي التنس ما لعب من أسبوعين، وش رايك تسوي فعالية؟',
            'data' => ['community_id' => $tennisCom1->id],
        ]);

        // Poll notification
        Notification::factory()->unread()->create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $c1Employees[6]->id,
            'type' => 'poll',
            'title' => 'تصويت جديد في فريق البادل',
            'body' => 'متى تفضلون نلعب هالأسبوع؟',
            'data' => ['community_id' => $padelCom1->id, 'poll_id' => $poll1->id],
        ]);

        // Quick match notification
        Notification::factory()->unread()->create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $c1Employees[5]->id,
            'type' => 'quick_match',
            'title' => 'لعبة سريعة في فريق البادل',
            'body' => 'نبي نلعب بادل بعد الدوام، مين معي؟',
            'data' => ['community_id' => $padelCom1->id, 'quick_match_id' => $qm1->id],
        ]);
    }
}

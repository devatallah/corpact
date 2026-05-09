<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\Company;
use App\Models\Court;
use App\Models\CourtPricing;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\Notification;
use App\Models\PlatformRevenue;
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
            'email' => 'admin@corpact.com',
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  CLUBS                                                   ║
        // ╚══════════════════════════════════════════════════════════╝

        // ── Club 1: Active, fully set up ──
        $club1 = Club::factory()->create([
            'name'            => 'نادي الرياض للبادل',
            'email'           => 'club1@corpact.com',
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
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 60, 'price' => 200]);
            CourtPricing::factory()->create(['court_id' => $court->id, 'duration_minutes' => 90, 'price' => 280]);
        }
        $club1Tennis = Court::factory()->create(['club_id' => $club1->id, 'sport_id' => $tennis->id, 'name' => 'ملعب تنس 1']);
        $club1Courts->push($club1Tennis);
        CourtPricing::factory()->create(['court_id' => $club1Tennis->id, 'duration_minutes' => 60, 'price' => 150]);

        // ── Club 2: Active, multi-sport ──
        $club2 = Club::factory()->create([
            'name'            => 'نادي جدة الرياضي',
            'email'           => 'club2@corpact.com',
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
            'email'           => 'club3@corpact.com',
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
                'name'       => $name,
                'email'      => 'emp' . ($i + 1) . '@advancedtech.sa',
                'password'   => Hash::make('123456'),
                'company_id' => $company1->id,
                'department' => fake()->randomElement(['تقنية', 'تسويق', 'مبيعات', 'موارد بشرية', 'مالية']),
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
                'name'       => $name,
                'email'      => 'emp' . ($i + 1) . '@innovation.sa',
                'password'   => Hash::make('123456'),
                'company_id' => $company2->id,
                'department' => fake()->randomElement(['مالية', 'عمليات', 'تحليل', 'استثمار']),
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
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'system', 'title' => 'مرحباً بك في كورباكت', 'body' => 'تم تفعيل حسابك. ابدأ بإنشاء مجتمعات لموظفيك.']);
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
        Notification::factory()->read()->create(['notifiable_type' => Club::class, 'notifiable_id' => $club1->id, 'type' => 'system', 'title' => 'مرحباً بك في كورباكت', 'body' => 'تم تفعيل حساب ناديك بنجاح.']);

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
    }
}

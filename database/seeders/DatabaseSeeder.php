<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Category;
use App\Models\Challenge;
use App\Models\ChallengeProgress;
use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\CommunityPoll;
use App\Models\Company;
use App\Models\Department;
use App\Models\Discount;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\League;
use App\Models\LeagueMatch;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\QuickMatch;
use App\Models\QuickMatchOption;
use App\Models\QuickMatchVote;
use App\Models\Slot;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Community\LeadershipService;
use App\Services\Identity\IdentityBackfillService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /** أي رقم يصلح — المهم أنه لا يتغيّر بين التشغيلات. */
    private const RANDOM_SEED = 20260904;

    public function run(): void
    {
        // بذرة ثابتة للعشوائية كلها.
        //
        // البذر السابق كان يفشل نحو مرة من كل ثلاث: أعداد الأعضاء وحالات
        // الملاعب تُشتق من `fake()` و`rand()`، فتختلف البيانات كل تشغيل
        // وتسقط سيناريوهات تعتمد عليها. بيانات العرض يجب أن تكون قابلة
        // لإعادة الإنتاج — ما يُرى في جهاز يُرى في غيره، وما يفشل يفشل دائماً
        // فيُصلَح بدل أن يُعاد التشغيل حتى ينجح.
        mt_srand(self::RANDOM_SEED);
        srand(self::RANDOM_SEED);
        fake()->seed(self::RANDOM_SEED);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  NOTIFICATION TEMPLATES (A14 — H §14)                    ║
        // ╚══════════════════════════════════════════════════════════╝
        // أولاً دائماً: بقية الـ seeder يمر بمسارات تُرسل إشعارات، ونصوصها
        // كلها في القوالب — «لا تُكتب نصوص الرسائل داخل الكود».
        $this->call(NotificationTemplateSeeder::class);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  CATEGORIES                                               ║
        // ╚══════════════════════════════════════════════════════════╝
        $racketCat = Category::create(['name' => 'رياضات مضرب', 'name_en' => 'Racket Sports']);
        $ballCat = Category::create(['name' => 'رياضات كرة', 'name_en' => 'Ball Sports']);

        $padelCat = Category::create(['name' => 'بادل', 'name_en' => 'Padel', 'icon' => '/storage/sports/padel.svg', 'parent_id' => $racketCat->id]);
        $tennisCat = Category::create(['name' => 'تنس', 'name_en' => 'Tennis', 'icon' => '/storage/sports/tennis.svg', 'parent_id' => $racketCat->id]);
        $footballCat = Category::create(['name' => 'كرة قدم', 'name_en' => 'Football', 'icon' => '/storage/sports/football.svg', 'parent_id' => $ballCat->id]);
        $basketballCat = Category::create(['name' => 'كرة سلة', 'name_en' => 'Basketball', 'icon' => '/storage/sports/basketball.svg', 'parent_id' => $ballCat->id]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  ADMIN                                                   ║
        // ╚══════════════════════════════════════════════════════════╝
        $admin = User::factory()->create([
            'name' => 'مدير النظام',
            'email' => 'admin@teamat.com',
            'phone' => '966500000001',
        ]);
        $admin->assignRole(Role::PlatformAdmin);

        // Finance admin for testing (financial approvals only)
        $financeAdmin = User::factory()->create([
            'name' => 'محاسب المنصة',
            'email' => 'accountant@teamat.com',
            'phone' => '966500000002',
        ]);
        $financeAdmin->assignRole(Role::FinanceAdmin);

        // Support agent for testing (read, diagnose, resend — no approvals).
        // H §16 names three internal roles; without this one the support
        // screens had no account that could open them.
        $supportAgent = User::factory()->create([
            'name' => 'وكيل الدعم',
            'email' => 'support@teamat.com',
            'phone' => '966500000003',
        ]);
        $supportAgent->assignRole(Role::SupportAgent);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  partnerS                                                   ║
        // ╚══════════════════════════════════════════════════════════╝

        // ── Partner 1: Active, fully set up ──
        $biz1 = Partner::factory()->create([
            'name' => 'مرافق الرياض للبادل',
            'email' => 'biz1@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'الرياض',
            'district' => 'حي الملقا',
            'contact_name' => 'فهد العتيبي',
            'contact_phone' => '0533000001',
            'contact_title' => 'مدير الملاعب',
            'working_hours' => '06:00 - 00:00',
            'rating' => 4.7,
            'total_bookings' => 156,
            'commission_rate' => 10.00,
        ]);
        $biz1->categories()->attach([$padelCat->id, $tennisCat->id]);

        $biz1Venues = collect();
        foreach (range(1, 4) as $i) {
            $venue = Venue::factory()->create(['partner_id' => $biz1->id, 'category_id' => $padelCat->id, 'name' => "ملعب بادل $i"]);
            $biz1Venues->push($venue);

            // الملاعب لا تتساوى أسعارها: ملعب بإضاءة أحدث أغلى من جاره. كانت
            // كلها بسعر واحد، فتفصيل السعر لكل ملعب يبدو زينةً بلا معنى —
            // ولا يُكتشف خطأ في الجمع لأن كل الأرقام متطابقة.
            $bump = ($i - 1) * 25;
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 150 + $bump, 'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00', 'days' => [0, 1, 2, 3]]);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 250 + $bump, 'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00', 'days' => [0, 1, 2, 3]]);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 300 + $bump, 'is_peak' => true, 'label' => 'نهاية الأسبوع', 'start_time' => '06:00', 'end_time' => '23:00', 'days' => [4, 5]]);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 220 + $bump, 'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00']);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 350 + $bump, 'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00']);
        }
        $biz1Tennis = Venue::factory()->create(['partner_id' => $biz1->id, 'category_id' => $tennisCat->id, 'name' => 'ملعب تنس 1']);
        $biz1Venues->push($biz1Tennis);
        VenuePricing::factory()->create(['venue_id' => $biz1Tennis->id, 'duration_minutes' => 60, 'price' => 120, 'is_peak' => false, 'label' => 'خارج الذروة', 'start_time' => '06:00', 'end_time' => '16:00']);
        VenuePricing::factory()->create(['venue_id' => $biz1Tennis->id, 'duration_minutes' => 60, 'price' => 200, 'is_peak' => true, 'label' => 'ذروة', 'start_time' => '16:00', 'end_time' => '23:00']);

        // ── Partner 2: Active, multi-sport ──
        $biz2 = Partner::factory()->create([
            'name' => 'مرافق جدة الرياضية',
            'email' => 'biz2@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'جدة',
            'district' => 'حي الروضة',
            'contact_name' => 'سعد الغامدي',
            'contact_phone' => '0533000002',
            'contact_title' => 'مشرف',
            'working_hours' => '06:00 - 23:00',
            'rating' => 4.3,
            'total_bookings' => 89,
            'commission_rate' => 12.00,
        ]);
        $biz2->categories()->attach([$padelCat->id, $footballCat->id]);

        $biz2Venues = collect();
        foreach (range(1, 2) as $i) {
            $venue = Venue::factory()->create(['partner_id' => $biz2->id, 'category_id' => $padelCat->id, 'name' => "ملعب بادل $i"]);
            $biz2Venues->push($venue);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 180]);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 250]);
        }
        $footballVenue = Venue::factory()->create(['partner_id' => $biz2->id, 'category_id' => $footballCat->id, 'name' => 'ملعب كرة قدم']);
        $biz2Venues->push($footballVenue);
        VenuePricing::factory()->create(['venue_id' => $footballVenue->id, 'duration_minutes' => 60, 'price' => 350]);
        VenuePricing::factory()->create(['venue_id' => $footballVenue->id, 'duration_minutes' => 90, 'price' => 500]);

        // ── Partner 3: Active, Dammam ──
        $biz3 = Partner::factory()->create([
            'name' => 'مرافق الدمام',
            'email' => 'biz3@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'الدمام',
            'district' => 'حي الشاطئ',
            'contact_phone' => '0533000003',
            'rating' => 4.1,
            'total_bookings' => 42,
            'commission_rate' => 10.00,
        ]);
        $biz3->categories()->attach([$tennisCat->id, $basketballCat->id]);

        $biz3Venues = collect();
        foreach (range(1, 2) as $i) {
            $venue = Venue::factory()->create(['partner_id' => $biz3->id, 'category_id' => $tennisCat->id, 'name' => "ملعب تنس $i"]);
            $biz3Venues->push($venue);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 150]);
        }
        $basketVenue = Venue::factory()->create(['partner_id' => $biz3->id, 'category_id' => $basketballCat->id, 'name' => 'ملعب سلة']);
        $biz3Venues->push($basketVenue);
        VenuePricing::factory()->create(['venue_id' => $basketVenue->id, 'duration_minutes' => 60, 'price' => 250]);

        /*
         * ── مزوّدون 7–10: عمق الاختيار ──
         *
         * كان لكل فئة مزوّد أو اثنان فقط، فيكفي أن يكون أحدهما مشغولاً ليصير
         * «لا يوجد مزوّد مناسب» هو الحال الطبيعي في شاشة الإنشاء — والمنصة
         * كلها مبنية على **ترتيب** اقتراحات، وترتيبُ عنصرٍ واحد لا معنى له.
         * كل فئة الآن ثلاثة مزوّدين على الأقل في مدن مختلفة، فيظهر معيار
         * «القرب» و«عدم التكرار» أثرهما، ويبقى بديل حين يمتلئ الأول.
         *
         * الفروع والوحدات تُشتق تلقائياً في `PlatformCatalogSeeder` من كل
         * مزوّد له ملاعب — فلا شيء يُضاف هنا غير الملاعب وتسعيراتها.
         */
        $biz7 = Partner::factory()->create([
            'name' => 'نادي الملقا الرياضي',
            'email' => 'malqa@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'الرياض',
            'district' => 'حي الملقا',
            'contact_name' => 'ناصر الدوسري',
            'contact_phone' => '0533000007',
            'contact_title' => 'مدير التشغيل',
            'working_hours' => '06:00 - 23:00',
            'rating' => 4.5,
            'total_bookings' => 118,
            'commission_rate' => 11.00,
        ]);
        $biz7->categories()->attach([$padelCat->id, $footballCat->id]);

        $biz7Venues = collect();
        foreach (range(1, 2) as $i) {
            $venue = Venue::factory()->create(['partner_id' => $biz7->id, 'category_id' => $padelCat->id, 'name' => "ملعب بادل $i"]);
            $biz7Venues->push($venue);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 165 + ($i - 1) * 20, 'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00']);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 265 + ($i - 1) * 20, 'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00']);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 240 + ($i - 1) * 20, 'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00']);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 365 + ($i - 1) * 20, 'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00']);
        }
        $biz7Football = Venue::factory()->create(['partner_id' => $biz7->id, 'category_id' => $footballCat->id, 'name' => 'ملعب كرة قدم']);
        $biz7Venues->push($biz7Football);
        VenuePricing::factory()->create(['venue_id' => $biz7Football->id, 'duration_minutes' => 60, 'price' => 320]);
        VenuePricing::factory()->create(['venue_id' => $biz7Football->id, 'duration_minutes' => 90, 'price' => 460]);

        $biz8 = Partner::factory()->create([
            'name' => 'مجمع النرجس متعدد الرياضات',
            'email' => 'narjes@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'الرياض',
            'district' => 'حي النرجس',
            'contact_name' => 'ريم الشهري',
            'contact_phone' => '0533000008',
            'contact_title' => 'مسؤولة الحجوزات',
            'working_hours' => '06:00 - 23:00',
            'rating' => 4.2,
            'total_bookings' => 64,
            'commission_rate' => 12.00,
        ]);
        $biz8->categories()->attach([$tennisCat->id, $basketballCat->id, $padelCat->id]);

        $biz8Venues = collect();
        foreach (range(1, 2) as $i) {
            $venue = Venue::factory()->create(['partner_id' => $biz8->id, 'category_id' => $tennisCat->id, 'name' => "ملعب تنس $i"]);
            $biz8Venues->push($venue);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 135 + ($i - 1) * 15, 'is_peak' => false, 'label' => 'خارج الذروة', 'start_time' => '06:00', 'end_time' => '16:00']);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 210 + ($i - 1) * 15, 'is_peak' => true, 'label' => 'ذروة', 'start_time' => '16:00', 'end_time' => '23:00']);
        }
        $biz8Basket = Venue::factory()->create(['partner_id' => $biz8->id, 'category_id' => $basketballCat->id, 'name' => 'صالة سلة']);
        $biz8Venues->push($biz8Basket);
        VenuePricing::factory()->create(['venue_id' => $biz8Basket->id, 'duration_minutes' => 60, 'price' => 230]);
        VenuePricing::factory()->create(['venue_id' => $biz8Basket->id, 'duration_minutes' => 90, 'price' => 330]);
        $biz8Padel = Venue::factory()->create(['partner_id' => $biz8->id, 'category_id' => $padelCat->id, 'name' => 'ملعب بادل مغطّى']);
        $biz8Venues->push($biz8Padel);
        VenuePricing::factory()->create(['venue_id' => $biz8Padel->id, 'duration_minutes' => 60, 'price' => 190]);
        VenuePricing::factory()->create(['venue_id' => $biz8Padel->id, 'duration_minutes' => 90, 'price' => 270]);

        $biz9 = Partner::factory()->create([
            'name' => 'أندية جدة للبادل',
            'email' => 'jeddahpadel@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'جدة',
            'district' => 'حي الشاطئ',
            'contact_name' => 'وليد باعشن',
            'contact_phone' => '0533000009',
            'working_hours' => '06:00 - 23:00',
            'rating' => 4.6,
            'total_bookings' => 97,
            'commission_rate' => 10.00,
        ]);
        $biz9->categories()->attach([$padelCat->id, $tennisCat->id]);

        $biz9Venues = collect();
        foreach (range(1, 3) as $i) {
            $venue = Venue::factory()->create(['partner_id' => $biz9->id, 'category_id' => $padelCat->id, 'name' => "ملعب بادل $i"]);
            $biz9Venues->push($venue);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 175 + ($i - 1) * 30]);
            VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 255 + ($i - 1) * 30]);
        }
        $biz9Tennis = Venue::factory()->create(['partner_id' => $biz9->id, 'category_id' => $tennisCat->id, 'name' => 'ملعب تنس 1']);
        $biz9Venues->push($biz9Tennis);
        VenuePricing::factory()->create(['venue_id' => $biz9Tennis->id, 'duration_minutes' => 60, 'price' => 160]);

        $biz10 = Partner::factory()->create([
            'name' => 'مركز الخبر الرياضي',
            'email' => 'khobarsports@teamat.com',
            'password' => Hash::make('123456'),
            'city' => 'الخبر',
            'district' => 'حي العقربية',
            'contact_name' => 'ماجد القحطاني',
            'contact_phone' => '0533000010',
            'working_hours' => '06:00 - 23:00',
            'rating' => 3.9,
            'total_bookings' => 31,
            'commission_rate' => 15.00,
        ]);
        $biz10->categories()->attach([$footballCat->id, $basketballCat->id]);

        $biz10Venues = collect();
        $biz10Football = Venue::factory()->create(['partner_id' => $biz10->id, 'category_id' => $footballCat->id, 'name' => 'ملعب كرة قدم']);
        $biz10Venues->push($biz10Football);
        VenuePricing::factory()->create(['venue_id' => $biz10Football->id, 'duration_minutes' => 60, 'price' => 300]);
        VenuePricing::factory()->create(['venue_id' => $biz10Football->id, 'duration_minutes' => 90, 'price' => 430]);
        $biz10Basket = Venue::factory()->create(['partner_id' => $biz10->id, 'category_id' => $basketballCat->id, 'name' => 'صالة سلة']);
        $biz10Venues->push($biz10Basket);
        VenuePricing::factory()->create(['venue_id' => $biz10Basket->id, 'duration_minutes' => 60, 'price' => 240]);

        // ── Partner 4: Pending (waiting admin approval) ──
        $biz4 = Partner::factory()->pending()->create([
            'name' => 'مرافق الخبر الرياضية',
            'email' => 'khobar@biz.sa',
            'password' => null,
            'city' => 'الخبر',
            'district' => 'حي العقربية',
            'contact_name' => 'عادل المحمد',
            'contact_title' => 'مالك الشريك',
            'venues_count' => 3,
            'notes' => 'شريك جديد يحتوي على 3 ملاعب بادل حديثة',
        ]);
        $biz4->categories()->attach([$padelCat->id]);

        // ── Partner 5: Pending (another pending for admin) ──
        Partner::factory()->pending()->create([
            'name' => 'مرافق المدينة الرياضية',
            'email' => 'madinah@biz.sa',
            'password' => null,
            'city' => 'المدينة',
            'district' => 'حي السلام',
            'contact_name' => 'خالد الحسن',
            'contact_title' => 'المدير العام',
            'venues_count' => 5,
            'notes' => 'شريك كبير يضم ملاعب متعددة الرياضات',
        ]);

        // ── Partner 6: Approved but not activated (has activation token) ──
        Partner::factory()->create([
            'name' => 'مرافق النخيل',
            'email' => 'nakheel@biz.sa',
            'password' => null,
            'city' => 'الرياض',
            'district' => 'حي النخيل',
            'activation_token' => Str::random(64),
            'email_verified_at' => null,
        ]);

        // ── Partner Staff (Receptionists) ──
        Partner::create([
            'name' => 'سارة المالكي',
            'email' => 'reception1@biz1.sa',
            'password' => Hash::make('123456'),
            'city' => $biz1->city,
            'district' => $biz1->district,
            'contact_phone' => '0533000011',
            'role' => 'receptionist',
            'parent_id' => $biz1->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        Partner::create([
            'name' => 'عبدالله الحربي',
            'email' => 'reception2@biz1.sa',
            'password' => Hash::make('123456'),
            'city' => $biz1->city,
            'district' => $biz1->district,
            'contact_phone' => '0533000012',
            'role' => 'receptionist',
            'parent_id' => $biz1->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        Partner::create([
            'name' => 'منى القحطاني',
            'email' => 'reception1@biz2.sa',
            'password' => Hash::make('123456'),
            'city' => $biz2->city,
            'district' => $biz2->district,
            'contact_phone' => '0533000021',
            'role' => 'receptionist',
            'parent_id' => $biz2->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        /*
         * ── الساعات المعروضة (slots) ──
         *
         * `slots` هي ما يعرضه المزوّد على ملعبه ليوم بعينه، ويوم له ساعات
         * معروضة لا يُحجز خارجها (انظر `AvailabilityService::withinOfferedHours`).
         *
         * كانت كل الملاعب تُبذر بنفس النمط: صباح 06–09 ثم مساء 16–23، وبينهما
         * **سبع ساعات ميتة على مستوى المنصة كلها**. أي موعد بين 09:00 و16:00
         * داخل أسبوع الجدولة كان يُقصي كل المزوّدين بلا استثناء، فتظهر «لا
         * يوجد مزوّد مناسب» وكأنها عطب في المنطق — وهي فجوة في البيانات.
         *
         * ثلاثة أنماط متناوبة تسدّ الفجوة وتبقى واقعية: مرفق يفتح النهار
         * كاملاً، وآخر صباحي/مسائي، وثالث نهاري/مسائي. لا ساعة من 06:00 إلى
         * 23:00 بلا مرفق يعرضها.
         */
        $allvenues = $biz1Venues->merge($biz2Venues)->merge($biz3Venues)
            ->merge($biz7Venues)->merge($biz8Venues)->merge($biz9Venues)->merge($biz10Venues);

        /*
         * الفتحة **نافذة عمل متصلة**، لا كتلة حجز ثابتة.
         *
         * `slots` هي الساعات التي يعرضها المزوّد، و`unit_slots` هي ما حُجز
         * منها — والبذرة كانت تخلط بينهما: صفوف بالساعة، بعضها مختوم
         * `booked` عشوائياً وكأن العرض نفسه هو الحجز.
         *
         * وللخلط أثر يقتل الشاشة: الحجز لا يصحّ إلا داخل فتحة معروضة **واحدة**
         * (`AvailabilityService::withinOfferedHours`)، ووحدات النشاط مبذورة
         * بمدة افتراضية 90 دقيقة — وهي المدة التي يفحص بها مُقترِح المزوّدين
         * حين لا ترسل الشاشة مدة. فتحة الساعة لا تسع 90 دقيقة أبداً، فكان كل
         * مزوّد يُقصى بـ«غير متاح في الوقت المطلوب» في **كل** ساعة من أسبوع
         * الجدولة: لا اقتراح واحد داخل النافذة المعروضة. وفتحة الساعتين تصلح
         * لبداية على رأس الكتلة وحدها، فتموت الساعات الفردية.
         *
         * النافذة المتصلة تسع أي مدة تبيعها الملاعب (60 و90) وأي وقت بدء
         * داخلها، ويبقى ما حُجز فعلاً في `unit_slots` حيث يخصّه.
         */
        $patterns = [
            [['06:00', '23:00']],                       // النهار كاملاً
            [['06:00', '10:00'], ['16:00', '23:00']],   // صباحي + مسائي
            [['10:00', '16:00'], ['17:00', '23:00']],   // نهاري + مسائي
        ];

        /*
         * النمط يدور **داخل كل فئة** لا عبر الملاعب كلها: الفئة الصغيرة
         * (ملعبان أو ثلاثة) كانت تقع على نمط واحد بحكم ترتيبها في القائمة،
         * فتعود الفجوة إليها وحدها بينما تبدو البيانات مكتملة إجمالاً.
         */
        $seen = [];

        foreach ($allvenues->values() as $venue) {
            $rank = $seen[$venue->category_id] = ($seen[$venue->category_id] ?? -1) + 1;
            $slotHours = $patterns[$rank % count($patterns)];

            foreach (range(0, 13) as $dayOffset) {
                $date = now()->addDays($dayOffset)->toDateString();

                foreach ($slotHours as [$start, $end]) {
                    Slot::create([
                        'venue_id' => $venue->id,
                        'date' => $date,
                        'start_time' => $start,
                        'end_time' => $end,
                        // النافذة معروضة دائماً؛ ما حُجز منها يعيش في `unit_slots`.
                        'status' => 'available',
                    ]);
                }
            }
        }

        // ╔══════════════════════════════════════════════════════════╗
        // ║  COMPANIES                                               ║
        // ╚══════════════════════════════════════════════════════════╝

        // ── Company 1: Active, full data ──
        $company1 = Company::factory()->create([
            'name' => 'شركة التقنية المتقدمة',
            'email' => 'hr@advancedtech.sa',
            'password' => Hash::make('123456'),
            'contact_name' => 'نورة القحطاني',
            'contact_phone' => '0501234567',
            'contact_title' => 'مسؤولة الحساب',
            'domain' => 'advancedtech.sa',
            'sector' => 'تقنية',
            'employee_count' => 120,
            'city' => 'الرياض',
        ]);
        // A6: المحفظة تُنشأ ويُموَّل رصيدها عبر الدفتر في WalletLedgerSeeder.

        // ── Company 2: Active ──
        $company2 = Company::factory()->create([
            'name' => 'مجموعة الابتكار',
            'email' => 'hr@innovation.sa',
            'password' => Hash::make('123456'),
            'contact_name' => 'ريم السعيد',
            'contact_phone' => '0559876543',
            'contact_title' => 'مسؤولة الرفاهية',
            'domain' => 'innovation.sa',
            'sector' => 'مالية',
            'employee_count' => 80,
            'city' => 'جدة',
        ]);

        // ── Company 3: Pending (waiting admin approval) ──
        $company3 = Company::factory()->pending()->create([
            'name' => 'شركة الأفق الجديد',
            'email' => 'hr@horizon.sa',
            'password' => null,
            'contact_name' => 'سارة الأحمد',
            'contact_phone' => '0551112233',
            'sector' => 'عقارات',
            'city' => 'الرياض',
            'requester_name' => 'محمد العمر',
            'requester_email' => 'mohammed@horizon.sa',
            'requester_phone' => '0551112200',
            'employee_count_range' => '50-100',
            'notes' => 'نرغب في تسجيل الشركة لتنظيم أنشطة رياضية للموظفين',
        ]);

        // ── Company 4: Pending ──
        Company::factory()->pending()->create([
            'name' => 'شركة البناء الحديث',
            'email' => 'hr@modern-build.sa',
            'password' => null,
            'contact_name' => 'عهود الفيصل',
            'contact_phone' => '0561234567',
            'sector' => 'عقارات',
            'city' => 'جدة',
            'requester_name' => 'طلال الناصر',
            'requester_email' => 'talal@modern-build.sa',
            'requester_phone' => '0561234500',
            'employee_count_range' => '100-200',
        ]);

        // ── Company 5: Approved but not activated ──
        Company::factory()->create([
            'name' => 'شركة الطاقة الخضراء',
            'email' => 'hr@greenergy.sa',
            'password' => null,
            'contact_name' => 'لمياء الحربي',
            'contact_phone' => '0571234567',
            'sector' => 'طاقة',
            'city' => 'الدمام',
            'activation_token' => Str::random(64),
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
                'name' => $name,
                'email' => 'emp'.($i + 1).'@advancedtech.sa',
                'phone' => sprintf('05010%05d', $i + 1),
                'password' => Hash::make('123456'),
                'company_id' => $company1->id,
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
                'name' => $name,
                'email' => 'emp'.($i + 1).'@innovation.sa',
                'phone' => sprintf('05020%05d', $i + 1),
                'password' => Hash::make('123456'),
                'company_id' => $company2->id,
                'department_id' => $c2Departments->random()->id,
            ]));
        }

        // ── Multi-company demo: SAME phone under both companies → one global
        //    user with two memberships and a context switcher (H §3/§4) ──
        $multi1 = Employee::factory()->create([
            'name' => 'عبدالعزيز المشترك',
            'email' => 'multi@advancedtech.sa',
            'phone' => '0503000001',
            'password' => Hash::make('123456'),
            'company_id' => $company1->id,
            'department_id' => $c1Departments->first()->id,
        ]);
        Employee::factory()->create([
            'name' => 'عبدالعزيز المشترك',
            'email' => 'multi@innovation.sa',
            'phone' => '0503000001',
            'password' => Hash::make('123456'),
            'company_id' => $company2->id,
            'department_id' => $c2Departments->first()->id,
        ]);
        $c1Employees->push($multi1);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  COMMUNITIES                                             ║
        // ╚══════════════════════════════════════════════════════════╝

        // Company 1 communities
        $padelCom1 = Community::factory()->create([
            'name' => 'فريق البادل', 'description' => 'مجتمع محبي رياضة البادل في الشركة',
            'icon' => '🏸', 'color' => '#3B82F6', 'company_id' => $company1->id,
            'category_id' => $padelCat->id,
            'member_count' => 10,
        ]);
        $footballCom1 = Community::factory()->create([
            'name' => 'فريق كرة القدم', 'description' => 'مجتمع كرة القدم للموظفين',
            'icon' => '⚽', 'color' => '#10B981', 'company_id' => $company1->id,
            'category_id' => $footballCat->id,
            'member_count' => 12,
        ]);
        $tennisCom1 = Community::factory()->create([
            'name' => 'مجتمع التنس', 'description' => 'لعشاق التنس',
            'icon' => '🎾', 'color' => '#F59E0B', 'company_id' => $company1->id,
            'category_id' => $tennisCat->id,
            'member_count' => 6,
        ]);

        // Company 2 communities
        $padelCom2 = Community::factory()->create([
            'name' => 'بادل الابتكار', 'description' => 'فريق البادل في مجموعة الابتكار',
            'icon' => '🏸', 'color' => '#8B5CF6', 'company_id' => $company2->id,
            'category_id' => $padelCat->id,
            'member_count' => 8,
        ]);
        $basketCom2 = Community::factory()->create([
            'name' => 'فريق السلة', 'description' => 'مجتمع كرة السلة',
            'icon' => '🏀', 'color' => '#EF4444', 'company_id' => $company2->id,
            'category_id' => $basketballCat->id,
            'member_count' => 6,
        ]);

        // Attach members (membership = states, never deleted rows — A5/H §6)
        $padelCom1->members()->attach($c1Employees->take(10)->mapWithKeys(fn ($e) => [$e->id => ['status' => 'active', 'joined_at' => now()->subDays(rand(5, 60))]])->all());

        $footballCom1->members()->attach($c1Employees->slice(2, 12)->mapWithKeys(fn ($e) => [$e->id => ['status' => 'active', 'joined_at' => now()->subDays(rand(5, 60))]])->all());

        $tennisCom1->members()->attach($c1Employees->slice(5, 6)->mapWithKeys(fn ($e) => [$e->id => ['status' => 'active', 'joined_at' => now()->subDays(rand(5, 60))]])->all());

        $padelCom2->members()->attach($c2Employees->take(8)->mapWithKeys(fn ($e) => [$e->id => ['status' => 'active', 'joined_at' => now()->subDays(rand(5, 40))]])->all());

        $basketCom2->members()->attach($c2Employees->slice(3, 6)->mapWithKeys(fn ($e) => [$e->id => ['status' => 'active', 'joined_at' => now()->subDays(rand(5, 40))]])->all());

        // ╔══════════════════════════════════════════════════════════╗
        // ║  WALLETS & LEDGER (A6 — H §12.5)                        ║
        // ╚══════════════════════════════════════════════════════════╝
        // شحن عبر طلبات تحويل بنكي معتمدة + تخصيص للمجتمعات — كله قيود دفتر.
        $this->call(WalletLedgerSeeder::class);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  SETTLEMENTS & BILLING (A11 — H §12.7/§12.8)             ║
        // ╚══════════════════════════════════════════════════════════╝
        // لا بذور تسوية جاهزة: **بند التسوية لا يُنشأ إلا عند انتقال الفعالية
        // إلى `completed`** (H §12.7)، وكشوفها يولّدها app:generate-settlements،
        // وفواتير رسوم النظام يولّدها app:generate-monthly-invoices من عدد
        // الموظفين المفعّلين. زرع صفوف يدوية هنا كان سيخلق مالاً بلا مصدر.
        // الجدولان القديمان (settlements / platform_revenue) مؤرشفان
        // legacy_settlements / legacy_platform_revenue.
        //
        // قيم العقد للتجربة (H §12.8) — أرقام العقد من المالك في الإنتاج.
        // البنود الثلاثة تُعرض معاً في بطاقة الشركة، والسجل التجاري في ترويستها،
        // فتُزرع كاملة — بند ناقص هنا يظهر كشرطة في الشاشة لا كبيانات غائبة.
        $company1->forceFill([
            'commercial_registration' => '1010884921',
            'contract_fee_per_activated_employee' => 30000,   // 300.00 ريال
            'contract_monthly_minimum' => 500000,             // 5,000.00 ريال
            'contract_coordinator_service' => true,
        ])->save();
        $company2->forceFill([
            'commercial_registration' => '1010334812',
            'contract_fee_per_activated_employee' => 25000,   // 250.00 ريال
            'contract_monthly_minimum' => 300000,             // 3,000.00 ريال
            'contract_coordinator_service' => false,
        ])->save();

        // ╔══════════════════════════════════════════════════════════╗
        // ║  NOTIFICATIONS — realistic per portal                    ║
        // ╚══════════════════════════════════════════════════════════╝

        // Admin
        Notification::factory()->unread()->create(['notifiable_type' => User::class, 'notifiable_id' => $admin->id, 'type' => 'system', 'title' => 'طلب تسجيل شريك جديد', 'body' => 'مرافق الخبر الرياضية بانتظار الموافقة.']);
        Notification::factory()->unread()->create(['notifiable_type' => User::class, 'notifiable_id' => $admin->id, 'type' => 'system', 'title' => 'طلب تسجيل شركة', 'body' => 'شركة الأفق الجديد بانتظار الموافقة.']);
        Notification::factory()->read()->create(['notifiable_type' => User::class, 'notifiable_id' => $admin->id, 'type' => 'payment', 'title' => 'إيرادات جديدة', 'body' => 'تم تحصيل عمولة 224 ر.س من تسوية مرافق الرياض.']);

        // Company 1
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل مقترح', 'body' => 'اقترحت مرافق الرياض وقتاً بديلاً لحدث تدريب بادل مسائي.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل مقترح', 'body' => 'اقترحت مرافق جدة وقتاً بديلاً لمباراة كرة القدم.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'event_approved', 'title' => 'تمت الموافقة على الفعالية', 'body' => 'وافقت مرافق الرياض على فعالية بادل الأربعاء.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'event_rejected', 'title' => 'تم رفض الطلب', 'body' => 'رفضت مرافق الرياض طلبك. السبب: الملعب غير متاح.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'event_created', 'title' => 'حدث جديد', 'body' => 'أنشأ أحمد السالم حدث بادل جديد.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'payment', 'title' => 'استقطاع من المحفظة', 'body' => 'تم استقطاع 100 ر.س كدعم لفعالية بادل.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'system', 'title' => 'مرحباً بك في تيمات', 'body' => 'تم تفعيل حسابك. ابدأ بإنشاء مجتمعات لموظفيك.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company1->id, 'type' => 'reminder', 'title' => 'تذكير: حدث غداً', 'body' => 'لديك حدث بادل غداً الساعة 6 مساءً.']);

        // Company 2
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل مقترح', 'body' => 'اقترحت مرافق جدة وقتاً بديلاً للقاء البادل.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'alternative_proposed', 'title' => 'وقت بديل جديد', 'body' => 'اقترحت مرافق الرياض وقتاً بديلاً ثانياً لحدث بادل نهاية الأسبوع.']);
        Notification::factory()->unread()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'event_approved', 'title' => 'تمت الموافقة', 'body' => 'وافقت مرافق جدة على فعالية بادل مساء الخميس.']);
        Notification::factory()->read()->create(['notifiable_type' => Company::class, 'notifiable_id' => $company2->id, 'type' => 'system', 'title' => 'مرحباً بك', 'body' => 'تم تفعيل حساب شركتك بنجاح.']);

        // Partner 1
        Notification::factory()->unread()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz1->id, 'type' => 'event_created', 'title' => 'طلب فعالية جديد', 'body' => 'طلب فعالية من شركة التقنية المتقدمة — تدريب أسبوعي.']);
        Notification::factory()->unread()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz1->id, 'type' => 'event_created', 'title' => 'طلب فعالية جديد', 'body' => 'طلب فعالية من مجموعة الابتكار — تدريب بادل.']);
        Notification::factory()->unread()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz1->id, 'type' => 'alternative_rejected', 'title' => 'رفض الوقت البديل', 'body' => 'رفضت مجموعة الابتكار وقتك البديل الأول لحدث بادل نهاية الأسبوع.']);
        Notification::factory()->unread()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz1->id, 'type' => 'payment', 'title' => 'تسوية مالية', 'body' => 'تم إصدار تسوية بمبلغ 2,016 ر.س.']);
        Notification::factory()->read()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz1->id, 'type' => 'system', 'title' => 'مرحباً بك في تيمات', 'body' => 'تم تفعيل حسابك كشريك بنجاح.']);

        // Partner 2
        Notification::factory()->unread()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz2->id, 'type' => 'event_created', 'title' => 'طلب فعالية جديد', 'body' => 'طلب فعالية من شركة التقنية المتقدمة — مباراة ودية.']);
        Notification::factory()->unread()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz2->id, 'type' => 'event_created', 'title' => 'طلب فعالية جديد', 'body' => 'طلب فعالية من مجموعة الابتكار — مباراة صباحية.']);
        Notification::factory()->read()->create(['notifiable_type' => Partner::class, 'notifiable_id' => $biz2->id, 'type' => 'alternative_accepted', 'title' => 'تم قبول البديل', 'body' => 'قبلت مجموعة الابتكار الوقت البديل لحدث بادل.']);

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
        CommunityAnnouncement::factory()->create(['community_id' => $tennisCom1->id, 'employee_id' => $c1Employees[6]->id, 'body' => 'نبحث عن أعضاء جدد لمجتمع التنس، رشحوا زملاءكم!']);
        CommunityAnnouncement::factory()->create(['community_id' => $padelCom2->id, 'employee_id' => $c2Employees[0]->id, 'body' => 'أهلاً بالأعضاء الجدد في فريق بادل الابتكار!']);
        CommunityAnnouncement::factory()->create(['community_id' => $basketCom2->id, 'employee_id' => $c2Employees[4]->id, 'body' => 'بطولة السلة الشهرية ستبدأ قريباً، سجلوا أسماءكم.']);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  DISCOUNTS (A17)                                         ║
        // ╚══════════════════════════════════════════════════════════╝
        // أعاد A17 الميزة التي أزالها A10، بقرار المالك ونقضاً لـ H §12.1.
        // البذور تغطّي الأشكال الأربعة التي تفترق بها الحسابات: مبلغ ثابت،
        // نسبة، «مرة واحدة»، ونافذة ساعات — وصفٌّ مؤرشف يجب ألّا يظهر.
        Discount::create([
            'partner_id' => $biz1->id, 'company_id' => $company1->id,
            'community_id' => $padelCom1->id, 'name' => 'تخفيض الربع الأول',
            'type' => 'fixed', 'value' => 50, 'value_halalas' => 5000,
            'usage' => 'date_range', 'expires_at' => now()->addMonths(3)->toDateString(),
            'status' => 'active',
        ]);
        Discount::create([
            'partner_id' => $biz1->id, 'company_id' => $company1->id,
            'community_id' => $footballCom1->id, 'name' => 'خصم الولاء 10٪',
            'type' => 'percentage', 'value' => 10, 'value_halalas' => 0,
            'usage' => 'date_range', 'expires_at' => now()->addYear()->toDateString(),
            'status' => 'active',
        ]);
        Discount::create([
            'partner_id' => $biz2->id, 'company_id' => $company2->id,
            'community_id' => $padelCom2->id, 'name' => 'ترحيب بالمجتمع الجديد',
            'type' => 'fixed', 'value' => 100, 'value_halalas' => 10000,
            'usage' => 'one_time', 'status' => 'active',
        ]);
        // ساعات الهدوء وحدها — التخفيض لا يسري على حجز المساء.
        Discount::create([
            'partner_id' => $biz2->id, 'company_id' => $company1->id,
            'community_id' => $tennisCom1->id, 'name' => 'ساعات الصباح',
            'type' => 'percentage', 'value' => 20, 'value_halalas' => 0,
            'usage' => 'date_range', 'start_time' => '08:00', 'end_time' => '16:00',
            'status' => 'active',
        ]);
        // نسبة بنافذة ساعات على مجتمع البادل — أوضح شكل يُظهر شروط التخفيض
        // على البطاقة: القاعدة، والنافذة، وما تعنيه على الحجز المعروض.
        Discount::create([
            'partner_id' => $biz1->id, 'company_id' => $company1->id,
            'community_id' => $padelCom1->id, 'name' => 'خصم الصيف',
            'type' => 'percentage', 'value' => 20, 'value_halalas' => 0,
            'usage' => 'date_range', 'start_time' => '08:00', 'end_time' => '14:00',
            'expires_at' => now()->addMonths(2)->toDateString(),
            'status' => 'active',
        ]);
        // صفّ مؤرشف بختم A10 — موجود للقراءة، ولا يظهر في قائمة ولا حساب.
        Discount::create([
            'partner_id' => $biz1->id, 'company_id' => $company1->id,
            'community_id' => $padelCom1->id, 'name' => 'تخفيض قديم (مؤرشف)',
            'type' => 'fixed', 'value' => 75, 'value_halalas' => 7500,
            'usage' => 'date_range', 'status' => 'active',
        ])->forceFill(['archived_at' => now()->subYear()])->save();

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
            'question' => 'وش أفضل مرفق لكرة القدم؟',
            'status' => 'closed',
        ]);
        $opt2a = PollOption::create(['poll_id' => $poll2->id, 'label' => 'مرافق الرياض للبادل', 'sort_order' => 1]);
        $opt2b = PollOption::create(['poll_id' => $poll2->id, 'label' => 'مرافق جدة الرياضية', 'sort_order' => 2]);
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

        // Manual quick match poll — employee created
        $qm1 = QuickMatch::create([
            'community_id' => $padelCom1->id,
            'created_by' => $c1Employees[1]->id,
            'message' => 'نبي نلعب بادل بعد الدوام، صوّتوا على الوقت!',
            'source' => 'manual',
            'status' => 'open',
        ]);
        $qm1Opt1 = QuickMatchOption::create(['quick_match_id' => $qm1->id, 'date' => now()->addDays(2)->toDateString(), 'time' => '18:30', 'votes_count' => 2, 'sort_order' => 0]);
        $qm1Opt2 = QuickMatchOption::create(['quick_match_id' => $qm1->id, 'date' => now()->addDays(3)->toDateString(), 'time' => '20:00', 'votes_count' => 1, 'sort_order' => 1]);
        QuickMatchVote::create(['quick_match_id' => $qm1->id, 'option_id' => $qm1Opt1->id, 'employee_id' => $c1Employees[0]->id]);
        QuickMatchVote::create(['quick_match_id' => $qm1->id, 'option_id' => $qm1Opt1->id, 'employee_id' => $c1Employees[2]->id]);
        QuickMatchVote::create(['quick_match_id' => $qm1->id, 'option_id' => $qm1Opt2->id, 'employee_id' => $c1Employees[4]->id]);

        // Manual quick match poll in football community
        $qm2 = QuickMatch::create([
            'community_id' => $footballCom1->id,
            'created_by' => $c1Employees[3]->id,
            'message' => 'مباراة ودية، صوّتوا على الوقت الأنسب',
            'source' => 'manual',
            'status' => 'open',
        ]);
        $qm2Opt1 = QuickMatchOption::create(['quick_match_id' => $qm2->id, 'date' => now()->addDays(3)->toDateString(), 'time' => '20:00', 'votes_count' => 1, 'sort_order' => 0]);
        $qm2Opt2 = QuickMatchOption::create(['quick_match_id' => $qm2->id, 'date' => now()->addDays(4)->toDateString(), 'time' => '18:00', 'votes_count' => 1, 'sort_order' => 1]);
        QuickMatchVote::create(['quick_match_id' => $qm2->id, 'option_id' => $qm2Opt1->id, 'employee_id' => $c1Employees[4]->id]);
        QuickMatchVote::create(['quick_match_id' => $qm2->id, 'option_id' => $qm2Opt2->id, 'employee_id' => $c1Employees[5]->id]);

        // Auto-suggested quick match poll
        $qm3 = QuickMatch::create([
            'community_id' => $tennisCom1->id,
            'created_by' => null,
            'message' => 'مجتمعكم ما لعب من فترة، صوّتوا على الوقت المناسب!',
            'source' => 'auto',
            'status' => 'open',
        ]);
        QuickMatchOption::create(['quick_match_id' => $qm3->id, 'date' => now()->addDays(4)->toDateString(), 'time' => '18:00', 'sort_order' => 0]);
        QuickMatchOption::create(['quick_match_id' => $qm3->id, 'date' => now()->addDays(5)->toDateString(), 'time' => '20:00', 'sort_order' => 1]);
        QuickMatchOption::create(['quick_match_id' => $qm3->id, 'date' => now()->addDays(6)->toDateString(), 'time' => '18:00', 'sort_order' => 2]);

        // Auto-suggested for company 2
        $qm4 = QuickMatch::create([
            'community_id' => $basketCom2->id,
            'created_by' => null,
            'message' => 'مجتمعكم ما لعب من فترة، صوّتوا على الوقت المناسب!',
            'source' => 'auto',
            'status' => 'open',
        ]);
        QuickMatchOption::create(['quick_match_id' => $qm4->id, 'date' => now()->addDays(3)->toDateString(), 'time' => '19:00', 'sort_order' => 0]);
        QuickMatchOption::create(['quick_match_id' => $qm4->id, 'date' => now()->addDays(5)->toDateString(), 'time' => '17:00', 'sort_order' => 1]);

        // Converted quick match (already turned into event)
        $qm5 = QuickMatch::create([
            'community_id' => $padelCom2->id,
            'created_by' => $c2Employees[0]->id,
            'message' => 'بادل نهاية الأسبوع',
            'source' => 'manual',
            'status' => 'converted',
        ]);
        QuickMatchOption::create(['quick_match_id' => $qm5->id, 'date' => now()->subDays(3)->toDateString(), 'time' => '19:00', 'votes_count' => 3, 'sort_order' => 0]);
        QuickMatchOption::create(['quick_match_id' => $qm5->id, 'date' => now()->subDays(2)->toDateString(), 'time' => '20:00', 'votes_count' => 1, 'sort_order' => 1]);

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
            'body' => 'مجتمع التنس ما لعب من أسبوعين، وش رايك تسوي فعالية؟',
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
            'title' => 'تصويت جديد في فريق البادل',
            'body' => 'نبي نلعب بادل بعد الدوام، صوّتوا على الوقت!',
            'data' => ['community_id' => $padelCom1->id, 'quick_match_id' => $qm1->id],
        ]);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  GLOBAL IDENTITY (A3)                                    ║
        // ╚══════════════════════════════════════════════════════════╝
        // The seeder suppresses model events, so run the identity backfill
        // explicitly: users + company_memberships + role_assignments for
        // every account created above (phone = login identity).
        app(IdentityBackfillService::class)->run();

        // ╔══════════════════════════════════════════════════════════╗
        // ║  COMMUNITY LEADERSHIP (A5 — H §6)                        ║
        // ╚══════════════════════════════════════════════════════════╝
        // After the backfill so every employee has a global user id.
        // Leadership through role_assignments — exactly one primary each.
        $leadership = app(LeadershipService::class);
        $leadership->assignLeader($padelCom1, $c1Employees[0]->fresh(), asPrimary: true);
        $leadership->assignLeader($footballCom1, $c1Employees[3]->fresh(), asPrimary: true);
        $leadership->assignLeader($tennisCom1, $c1Employees[6]->fresh(), asPrimary: true);
        $leadership->assignLeader($padelCom2, $c2Employees[0]->fresh(), asPrimary: true);
        $leadership->assignLeader($basketCom2, $c2Employees[4]->fresh(), asPrimary: true);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  SCENARIOS — كل حالة وكل مسار                            ║
        // ╚══════════════════════════════════════════════════════════╝
        // بعد القيادة لأن إنشاء الفعالية يمرّ بالقائد، وبعد الهوية لأن
        // الخدمات تقرأ `user_id`. الترتيب هنا ليس تجميلاً: كل بذرة تفترض
        // ما قبلها موجوداً.
        $this->call(PlatformCatalogSeeder::class);
        $this->call(EventScenarioSeeder::class);
        $this->call(BillingScenarioSeeder::class);
        $this->call(OperationsSeeder::class);
        $this->call(EngagementSeeder::class);
    }
}

<?php

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Company;
use App\Models\Department;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Models\SettlementStatement;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;

/**
 * H §18 — «كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات (20 عنصراً)».
 *
 * قوائم ممثِّلة عن البوابات الأربع، تُثبت السلوك لا وجود الكود: الحجم 20،
 * والترتيب يغيّر الصف الأول فعلاً، والمفتاح المجهول يسقط للافتراضي بدل أن
 * يصل SQL، والبحث والفلترة يضيّقان ولا يوسّعان.
 */
function listsPlatformAdmin(): User
{
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    return $admin->fresh();
}

// ── admin/companies — الحجم والترتيب والبحث ──────────────────────────────

test('the companies list paginates at 20, not 15', function () {
    Company::factory()->count(22)->create();

    $this->actingAs(listsPlatformAdmin(), 'admin')
        ->get('/admin/companies')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('companies.per_page', 20)
            ->has('companies.data', 20)
        );
});

test('the companies list sorts by an allow-listed column in both directions', function () {
    Company::factory()->create(['name' => 'ألف']);
    Company::factory()->create(['name' => 'ياء']);
    Company::factory()->create(['name' => 'ميم']);

    $admin = listsPlatformAdmin();

    $this->actingAs($admin, 'admin')
        ->get('/admin/companies?sort=name&dir=asc')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sort.key', 'name')
            ->where('sort.direction', 'asc')
            ->where('companies.data.0.name', 'ألف')
        );

    $this->actingAs($admin, 'admin')
        ->get('/admin/companies?sort=name&dir=desc')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sort.direction', 'desc')
            ->where('companies.data.0.name', 'ياء')
        );
});

test('an unauthorised sort column never reaches the companies query', function (string $attack) {
    Company::factory()->count(3)->create();

    $this->actingAs(listsPlatformAdmin(), 'admin')
        ->get('/admin/companies?sort='.urlencode($attack).'&dir=asc')
        ->assertOk()
        // يسقط للافتراضي المعلن، لا خطأ 500 ولا ترتيب بعمود غير مصرّح به.
        ->assertInertia(fn (AssertableInertia $page) => $page->where('sort.key', 'created_at'));
})->with([
    'عمود غير معلن' => 'password',
    'عمود سرّي' => 'activation_token',
    'حقن' => "name'); drop table companies; --",
    'استعلام فرعي' => '(select 1)',
]);

test('search and sort survive each other and the pagination links', function () {
    Company::factory()->create(['name' => 'شركة الترتيب أ']);
    Company::factory()->create(['name' => 'شركة الترتيب ب']);
    Company::factory()->create(['name' => 'شركة أخرى تماماً']);

    $this->actingAs(listsPlatformAdmin(), 'admin')
        ->get('/admin/companies?search='.urlencode('الترتيب').'&sort=name&dir=desc')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('companies.total', 2)
            ->where('companies.data.0.name', 'شركة الترتيب ب')
            // `withQueryString` يحمل البحث والترتيب إلى روابط الصفحات.
            ->where('filters.search', 'الترتيب')
        );
});

// ── admin/admins — الفلترة التي كانت بلا واجهة ───────────────────────────

test('the admins list paginates at 20 and its status filter actually filters', function () {
    $admin = listsPlatformAdmin();

    $disabled = User::factory()->create(['status' => 'inactive']);
    $disabled->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin, 'admin')
        ->get('/admin/admins')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('admins.per_page', 20)
            ->where('sort.key', 'created_at')
            ->has('admins.data', 2)
        );

    $this->actingAs($admin, 'admin')
        ->get('/admin/admins?status=inactive')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('admins.data', 1)
            ->where('admins.data.0.status', 'inactive')
        );
});

// ── company/departments — قائمة كانت بلا ترقيم ولا بحث ولا ترتيب ─────────

test('the departments list gained pagination at 20, search and sort', function () {
    $company = Company::factory()->create();

    foreach (range(1, 21) as $index) {
        Department::create(['company_id' => $company->id, 'name' => 'قسم '.str_pad((string) $index, 2, '0', STR_PAD_LEFT)]);
    }

    Department::create(['company_id' => $company->id, 'name' => 'التسويق']);

    $this->actingAs($company, 'company')
        ->get('/company/departments')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('departments.per_page', 20)
            ->where('departments.total', 22)
            ->has('departments.data', 20)
        );

    $this->actingAs($company, 'company')
        ->get('/company/departments?search='.urlencode('التسويق'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('departments.total', 1)
            ->where('departments.data.0.name', 'التسويق')
        );

    $this->actingAs($company, 'company')
        ->get('/company/departments?sort=name&dir=desc')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sort.direction', 'desc')
            ->where('departments.data.0.name', 'قسم 21')
        );
});

test('a department list of one company never widens to another through sort or search', function () {
    $mine = Company::factory()->create();
    $theirs = Company::factory()->create();

    Department::create(['company_id' => $mine->id, 'name' => 'قسمي']);
    Department::create(['company_id' => $theirs->id, 'name' => 'قسمهم']);

    foreach (['?sort=name&dir=asc', '?search='.urlencode('قسم'), '?sort=employees_count&dir=desc', '?sort=company_id'] as $query) {
        $this->actingAs($mine, 'company')
            ->get('/company/departments'.$query)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('departments.total', 1)
                ->where('departments.data.0.name', 'قسمي')
            );
    }
});

// ── partner/settlements — الحجم والبحث والفلترة التي كانت مُهمَلة ────────

test('the provider statements list paginates at 20 with a working status filter and search', function () {
    $partner = Partner::factory()->create(['bank_status' => 'approved']);

    $make = function (string $periodKey, string $status, int $net) use ($partner) {
        return SettlementStatement::create([
            'partner_id' => $partner->id,
            'period_key' => $periodKey,
            'period_start' => Carbon::parse($periodKey.'-01'),
            'period_end' => Carbon::parse($periodKey.'-15'),
            'status' => $status,
            'items_count' => 1,
            'gross_amount_halalas' => $net,
            'commission_amount_halalas' => 0,
            'vat_amount_halalas' => 0,
            'net_amount_halalas' => $net,
        ]);
    };

    $make('2026-05', SettlementStatement::STATUS_DRAFT, 10_000);
    $make('2026-06', SettlementStatement::STATUS_APPROVED, 30_000);
    $make('2026-07', SettlementStatement::STATUS_PAID, 20_000);

    $this->actingAs($partner, 'partner')
        ->get('/partner/settlements')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('statements.per_page', 20)
            ->where('sort.key', 'period_end')
            ->where('statements.data.0.period_key', '2026-07')
        );

    // الفلتر الذي كان مُعلَناً في `Props` ثم يُهمَل — صار له ضابط وسلوك.
    $this->actingAs($partner, 'partner')
        ->get('/partner/settlements?status=draft')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('statements.total', 1)
            ->where('statements.data.0.period_key', '2026-05')
        );

    $this->actingAs($partner, 'partner')
        ->get('/partner/settlements?search=2026-06')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('statements.total', 1));

    // الترتيب بالصافي — عمود معروض في الجدول.
    $this->actingAs($partner, 'partner')
        ->get('/partner/settlements?sort=net_amount&dir=desc')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('statements.data.0.period_key', '2026-06')
        );
});

test('sorting a provider statements list never reaches another provider', function () {
    $mine = Partner::factory()->create();
    $theirs = Partner::factory()->create();

    foreach ([$mine, $theirs] as $partner) {
        SettlementStatement::create([
            'partner_id' => $partner->id,
            'period_key' => '2026-07',
            'period_start' => Carbon::parse('2026-07-01'),
            'period_end' => Carbon::parse('2026-07-15'),
            'status' => SettlementStatement::STATUS_DRAFT,
            'items_count' => 1,
            'gross_amount_halalas' => 10_000,
            'commission_amount_halalas' => 0,
            'vat_amount_halalas' => 0,
            'net_amount_halalas' => 10_000,
        ]);
    }

    foreach (['?sort=net_amount&dir=desc', '?sort=partner_id', '?search=2026'] as $query) {
        $this->actingAs($mine, 'partner')
            ->get('/partner/settlements'.$query)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('statements.total', 1));
    }
});

// ── coordinator/reports — كانت `limit(60)` بلا ترقيم ─────────────────────

test('the coordinator report list paginates at 20 and its scope survives sort and search', function () {
    fakeMessages();
    Carbon::setTestNow(Carbon::parse('2026-09-02 04:00'));

    $assigned = Company::factory()->create(['name' => 'شركة مسندة']);
    Company::factory()->create(['name' => 'شركة أخرى']);

    $this->artisan('app:generate-coordinator-reports')->assertSuccessful();

    $coordinator = User::factory()->create();
    $coordinator->assignRole(Role::Coordinator, RoleAssignment::SCOPE_COMPANY, $assigned->id);

    foreach (['', '?sort=period_key&dir=asc', '?sort=status', '?search='.urlencode('شركة'), '?sort=company_id'] as $query) {
        $this->actingAs($coordinator->fresh(), 'admin')
            ->get('/coordinator/reports'.$query)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('reports.per_page', 20)
                // الشركة غير المسندة لا تظهر مهما كان الترتيب أو البحث.
                ->where('reports.total', 1)
                ->where('reports.data.0.company_name', 'شركة مسندة')
            );
    }

    Carbon::setTestNow();
});

// ── admin/categories — الشجرة تبقى افتراضاً، والترتيب اختيار صريح ────────

test('the category tree keeps its parent-child adjacency until a sort is explicitly asked for', function () {
    $parent = Category::create(['name' => 'رياضات المضرب', 'name_en' => 'Racket', 'parent_id' => null]);
    Category::create(['name' => 'بادل', 'name_en' => 'Padel', 'parent_id' => $parent->id]);

    $other = Category::create(['name' => 'ألعاب ذهنية', 'name_en' => 'Mind', 'parent_id' => null]);
    Category::create(['name' => 'شطرنج', 'name_en' => 'Chess', 'parent_id' => $other->id]);

    $admin = listsPlatformAdmin();

    // بلا `sort` — الشجرة: كل أمّ يليها ابنها مباشرةً، لا ترتيب أبجدي مسطّح.
    $this->actingAs($admin, 'admin')
        ->get('/admin/categories')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sort.key', '')
            ->where('categories.data.0.name', 'رياضات المضرب')
            ->where('categories.data.1.name', 'بادل')
        );

    // ترتيب صريح — قائمة مسطّحة مرتَّبة، وهو ما طلبه المستخدم.
    $this->actingAs($admin, 'admin')
        ->get('/admin/categories?sort=name_en&dir=asc')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sort.key', 'name_en')
            ->where('categories.data.0.name_en', 'Chess')
        );

    // فلترة بالفئة الأمّ — الضابط الذي لم يكن للشاشة.
    $this->actingAs($admin, 'admin')
        ->get('/admin/categories?parent_id='.$parent->id)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('categories.total', 1)
            ->where('categories.data.0.name', 'بادل')
        );

    $this->actingAs($admin, 'admin')
        ->get('/admin/categories?parent_id=root')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('categories.total', 2));
});

// ── حارس عام: لا قائمة خادمية تُرقَّم بغير 20 ──────────────────────────────

test('no list in the codebase paginates at the old 15 per page', function () {
    $offenders = [];

    foreach ([base_path('app/Http/Controllers'), base_path('app/Services')] as $root) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root));

        foreach ($files as $file) {
            if (! $file->isFile() || $file->getExtension() !== 'php') {
                continue;
            }

            $source = (string) file_get_contents($file->getPathname());

            if (preg_match('/paginate\(\s*(?:[^)]*\?\?\s*)?15\s*\)/', $source)) {
                $offenders[] = str_replace(base_path().'/', '', $file->getPathname());
            }
        }
    }

    expect($offenders)->toBe([]);
});

test('no ordering clause anywhere is built from request input', function () {
    // القاعدة الأمنية الوحيدة التي تحمي الترتيب كله: اسم العمود يأتي من
    // القائمة البيضاء في {@see \App\Support\Lists\ListSort}، فلا يوجد موضع
    // واحد يمرّر قيمة من الطلب إلى `orderBy`/`orderByRaw`.
    $offenders = [];

    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path('app')));

    foreach ($files as $file) {
        if (! $file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }

        foreach (file($file->getPathname()) as $number => $line) {
            if (! preg_match('/->(orderBy|orderByRaw|orderByDesc|latest|oldest)\s*\(/', $line)) {
                continue;
            }

            if (preg_match('/\$request->|\$filters\s*\[|->input\(|->query\(|\$sort\b|\$dir\b|\$_GET/', $line)) {
                $offenders[] = str_replace(base_path().'/', '', $file->getPathname()).':'.($number + 1);
            }
        }
    }

    expect($offenders)->toBe([]);
});

test('an array-shaped sort parameter never 500s a live list', function (string $uri) {
    // `?sort[]=name` يصل مصفوفةً. المطلوب: صفحة سليمة أو رفض تحقّق — لا خطأ خادم.
    $response = $this->actingAs(listsPlatformAdmin(), 'admin')->get($uri.'?sort[]=name&dir[]=asc');

    expect($response->status())->toBeLessThan(500);
})->with([
    'الشركات' => '/admin/companies',
    'المشرفون' => '/admin/admins',
    'الفئات' => '/admin/categories',
    'المجتمعات' => '/admin/communities',
]);

// ── ثلاثة مُنتقين كانوا يُرسَلون للواجهة بلا تصفية خلفهم ──────────────────

test('the company audit list filters by action group, not just by exact action', function () {
    $company = Company::factory()->create();

    AuditLog::query()->create([
        'company_id' => $company->id,
        'action' => 'financial.topup.approved',
        'actor_type' => 'system',
    ]);
    AuditLog::query()->create([
        'company_id' => $company->id,
        'action' => 'permission.granted',
        'actor_type' => 'system',
    ]);

    // إنشاء الشركة نفسه يقيّد صفّاً، فالمرجع هنا هو ما تحذفه التصفية لا عدد مطلق.
    $unfiltered = $this->actingAs($company, 'company')->get('/company/audit')->assertOk();
    $total = $unfiltered->viewData('page')['props']['logs']['total'];

    expect($total)->toBeGreaterThanOrEqual(2);

    // البادئة هي المجموعة — `financial` تلتقط `financial.topup.approved`
    // ولا تلتقط `permission.granted`.
    $this->actingAs($company, 'company')
        ->get('/company/audit?group=financial')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('logs.total', 1)
            ->where('logs.data.0.action', 'financial.topup.approved')
        );
});

test('the provider venue list filters by the category picker it already rendered', function () {
    $partner = Partner::factory()->create();
    $padel = Category::factory()->create();
    $tennis = Category::factory()->create();

    Venue::factory()->count(2)->create(['partner_id' => $partner->id, 'category_id' => $padel->id]);
    Venue::factory()->create(['partner_id' => $partner->id, 'category_id' => $tennis->id]);

    $this->actingAs($partner, 'partner')
        ->get('/partner/venues')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('venues.data', 3));

    $this->actingAs($partner, 'partner')
        ->get('/partner/venues?category_id='.$tennis->id)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('venues.data', 1)
            ->where('venues.data.0.category_id', $tennis->id)
        );
});

test('the company notification list narrows to the unread when asked', function () {
    $company = Company::factory()->create();

    Notification::factory()->count(2)->unread()->create([
        'notifiable_type' => Company::class,
        'notifiable_id' => $company->id,
    ]);
    Notification::factory()->read()->create([
        'notifiable_type' => Company::class,
        'notifiable_id' => $company->id,
    ]);

    $this->actingAs($company, 'company')
        ->get('/company/notifications')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('notifications.data', 3));

    // التصفية تضيّق القائمة، لكن بطاقة «الإجمالي» تبقى على الرقم الحقيقي —
    // وإلا تطابقت مع «غير مقروءة» دائماً وفقدت معناها.
    $this->actingAs($company, 'company')
        ->get('/company/notifications?unread_only=1')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('notifications.data', 2)
            ->where('unreadCount', 2)
            ->where('totalCount', 3)
        );
});

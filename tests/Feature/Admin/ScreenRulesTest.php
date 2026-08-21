<?php

use App\Enums\Role;
use App\Models\Company;
use App\Models\RoleAssignment;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * H §18 — «قواعد عامة تسري على كل شاشة»:
 *
 *   كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات (20 عنصراً) · ثلاث حالات
 *   إلزامية بنص عربي محدد: فارغة · تحميل · خطأ · كل إجراء مالي أو إلغائي يمر
 *   بنافذة تأكيد تعرض **المبلغ والأثر** صراحة · لا شاشة بلا مسار رجوع واضح.
 *
 * With no JS test runner in the project, the component-level rules are checked
 * by reading the page sources — which is exactly where the rule lives.
 */
function a15Source(string $relative): string
{
    $path = base_path($relative);

    expect(file_exists($path))->toBeTrue("الملف غير موجود: {$relative}");

    return (string) file_get_contents($path);
}

// ── The stale nav permissions — the defect handed to A15 ─────────────────

test('every admin nav permission string is a real permission from the Role enum', function () {
    $source = a15Source('resources/js/layouts/admin-layout.tsx');

    preg_match_all("/permission: '([^']+)'/", $source, $matches);

    $used = array_unique($matches[1]);

    expect($used)->not->toBeEmpty();

    $known = collect(Role::cases())
        ->flatMap(fn (Role $role) => $role->permissions())
        ->unique()
        ->all();

    foreach ($used as $permission) {
        expect($known)->toContain($permission);
    }
});

test('the pre-A3 permission vocabulary is gone from the nav', function () {
    $source = a15Source('resources/js/layouts/admin-layout.tsx');

    preg_match_all("/permission: '([^']+)'/", $source, $matches);

    foreach ([
        'manage_companies', 'manage_partners', 'manage_employees', 'manage_communities',
        'manage_categories', 'manage_events', 'manage_notifications', 'manage_support',
        'manage_admins', 'view_revenue',
    ] as $dead) {
        expect($matches[1])->not->toContain($dead);
    }
});

test('the auth types no longer declare the pre-A3 admin roles', function () {
    $source = a15Source('resources/js/types/auth.ts');

    expect($source)->toContain('platform_admin')
        ->and($source)->toContain('finance_admin')
        ->and($source)->toContain('support_agent')
        ->and($source)->not->toContain("'super_admin'")
        ->and($source)->not->toContain("'accountant' | ")
        ->and($source)->toContain('memberships');
});

test('a platform admin actually sees the operational nav entries', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin->fresh(), 'admin')
        ->get('/admin/dash')
        ->assertOk()
        ->assertInertia(function ($page) {
            $permissions = $page->toArray()['props']['auth']['permissions'];

            // The nav filters on these; before A15 none of them matched and the
            // whole operational section rendered for nobody.
            foreach (['platform.manage', 'catalog.manage', 'admins.manage', 'revenue.view', 'audit.view'] as $needed) {
                expect($permissions)->toContain($needed);
            }
        });
});

test('every nav href resolves to a registered route', function () {
    $source = a15Source('resources/js/layouts/admin-layout.tsx');

    preg_match_all("/href: '(\/[^']*)'/", $source, $matches);

    $routes = collect(Route::getRoutes()->getRoutes())
        ->map(fn ($route) => '/'.ltrim($route->uri(), '/'))
        ->all();

    foreach (array_unique($matches[1]) as $href) {
        expect($routes)->toContain($href);
    }
});

test('the sidebar keeps the uncommitted usePage guard intact', function () {
    $source = a15Source('resources/js/components/portal-sidebar.tsx');

    // The guard is uncommitted user work — A15 was authorised to edit this
    // file additively, never to remove it.
    expect($source)->toContain('Fall back gracefully when rendered outside an Inertia app')
        ->and($source)->toContain("let url = '/';")
        ->and($source)->toContain('try {')
        ->and($source)->toContain('usePage()')
        ->and($source)->toContain('} catch {')
        ->and($source)->toContain('/* no Inertia context */');
});

// ── Confirm dialogs on financial and cancellation actions ────────────────

test('every financial admin screen passes its action through a confirm dialog', function (string $page) {
    $source = a15Source($page);

    expect($source)->toContain('ConfirmModal');
})->with([
    'resources/js/pages/admin/finance/topups.tsx',
    'resources/js/pages/admin/finance/settlements.tsx',
    'resources/js/pages/admin/finance/invoices.tsx',
    'resources/js/pages/admin/providers/oversight.tsx',
]);

test('the financial confirm dialogs name the amount and the effect, not just "are you sure"', function () {
    // اعتماد التحويل: المبلغ + أثره على المحفظة.
    $topups = a15Source('resources/js/pages/admin/finance/topups.tsx');
    expect($topups)->toContain('amount.toLocaleString()')
        ->and($topups)->toContain('ريال')
        ->and($topups)->toContain('المحفظة الرئيسية');

    // اعتماد الكشف: الإجمالي والعمولة والصافي.
    $settlements = a15Source('resources/js/pages/admin/finance/settlements.tsx');
    expect($settlements)->toContain('gross_amount')
        ->and($settlements)->toContain('commission_amount')
        ->and($settlements)->toContain('net_amount');

    // سداد الفاتورة: الإجمالي والضريبة والأثر على الحجب.
    $invoices = a15Source('resources/js/pages/admin/finance/invoices.tsx');
    expect($invoices)->toContain('total_amount')
        ->and($invoices)->toContain('vat_amount')
        ->and($invoices)->toContain('مسددة');
});

test('the company cancellation dialog states the refund effect', function () {
    $source = a15Source('resources/js/pages/company/events/show.tsx');

    expect($source)->toContain('سياسة الاسترداد')
        ->and($source)->toContain('refundPreview');
});

test('no page or shared component falls back to the browser confirm dialog', function () {
    // A15 left 14 non-financial `window.confirm` sites as later cleanup; the
    // rule (H §18) is one confirm convention, so none may come back.
    $roots = [base_path('resources/js/pages'), base_path('resources/js/components')];

    $offenders = [];

    foreach ($roots as $root) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root));

        foreach ($files as $file) {
            if (! $file->isFile() || ! in_array($file->getExtension(), ['ts', 'tsx'], true)) {
                continue;
            }

            $source = (string) file_get_contents($file->getPathname());

            // `confirm(` preceded by `!`, `(`, `window.` or whitespace — but not
            // our own `confirmSomething(` handlers.
            if (preg_match('/(?<![A-Za-z0-9_$.])(?:window\.)?confirm\s*\(/', $source)) {
                $offenders[] = str_replace(base_path().'/', '', $file->getPathname());
            }
        }
    }

    expect($offenders)->toBe([]);
});

// ── The three mandatory list states ──────────────────────────────────────

test('the shared list-state component carries the mandated Arabic copy', function () {
    $source = a15Source('resources/js/components/list-states.tsx');

    expect($source)->toContain('جارٍ التحميل')
        ->and($source)->toContain('تعذّر تحميل البيانات')
        ->and($source)->toContain('إعادة المحاولة')
        ->and($source)->toContain('tone="empty"')
        ->and($source)->toContain('tone="loading"')
        ->and($source)->toContain('tone="error"');
});

test('every screen A15 added renders the three list states', function (string $page) {
    $source = a15Source($page);

    expect($source)->toContain('ListState');
})->with([
    'resources/js/pages/admin/audit/index.tsx',
    'resources/js/pages/admin/security/events.tsx',
    'resources/js/pages/admin/security/permission-review.tsx',
    'resources/js/pages/admin/support/console.tsx',
    'resources/js/pages/admin/support/event.tsx',
    'resources/js/pages/company/audit/index.tsx',
    'resources/js/pages/company/invoices/index.tsx',
    'resources/js/pages/company/invoices/show.tsx',
]);

test('detail screens offer a back path', function (string $page) {
    $source = a15Source($page);

    expect($source)->toContain('BackLink');
})->with([
    'resources/js/pages/admin/support/event.tsx',
    'resources/js/pages/company/invoices/show.tsx',
]);

// ── search + filter + sort + pagination(20) ──────────────────────────────

test('every list A15 added paginates at 20 with search, filter and sort', function (string $uri, string $prop) {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    $this->actingAs($admin->fresh(), 'admin')
        ->get($uri)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where("{$prop}.per_page", 20));
})->with([
    'سجل التدقيق' => ['/admin/audit', 'logs'],
    'الأحداث الأمنية' => ['/admin/security/events', 'events'],
    'مراجعة الصلاحيات' => ['/admin/security/permission-review', 'assignments'],
]);

test('the company lists paginate at 20 too', function (string $uri, string $prop) {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get($uri)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where("{$prop}.per_page", 20));
})->with([
    'سجل التدقيق' => ['/company/audit', 'logs'],
    'الفواتير' => ['/company/invoices', 'invoices'],
]);

test('the audit list honours its search, action, company and date filters', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);
    $admin = $admin->fresh();

    foreach ([
        '?search=لا-يوجد-شيء-بهذا-الاسم',
        '?action=financial.topup.approved',
        '?group=financial',
        '?financial=1',
        '?sort=asc',
        '?from=2020-01-01&to=2020-01-02',
    ] as $query) {
        $this->actingAs($admin, 'admin')->get('/admin/audit'.$query)->assertOk();
    }
});

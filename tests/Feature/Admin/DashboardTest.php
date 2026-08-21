<?php

use App\Enums\Role;
use App\Models\Company;
use App\Models\Employee;
use App\Models\partner;
use App\Models\RoleAssignment;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/** أرقام الإيراد الأربعة التي تحرسها `revenue.view` على هذه الشاشة. */
const DASH_REVENUE_PROPS = ['monthlyRevenue', 'revenueGrowth', 'last6Months', 'maxRevenue'];

function dashStaff(Role $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role, RoleAssignment::SCOPE_PLATFORM);

    return $user->fresh();
}

test('admin can access dashboard', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dash'))
        ->assertOk();
});

test('guest is redirected from admin dashboard', function () {
    $this->get(route('admin.dash'))->assertRedirect();
});

test('employee cannot access admin dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

test('partner cannot access admin dashboard', function () {
    $partner = partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

test('company cannot access admin dashboard', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

// ── H §4: اللوحة ليست خلف `permission:` لأن تحويل ما بعد الدخول يصبّ فيها،
//    فالأرقام هي المحروسة. وكيل الدعم (G — «قراءة وتدخل محدود») لا يملك
//    `revenue.view` وتردّه 403 على /admin/revenue، فلا يجوز أن تصله الأرقام
//    نفسها من الشاشة الأولى التي يراها. ────────────────────────────────────

test('the support agent reaches the dashboard but no revenue figure reaches him', function () {
    $support = dashStaff(Role::SupportAgent);

    // نفس الحدّ المثبَّت في RoleSeparationTest: /admin/revenue مقفلة عليه.
    $this->actingAs($support, 'admin')->get('/admin/revenue')->assertForbidden();

    $this->actingAs($support, 'admin')
        ->get(route('admin.dash'))
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) {
            $page->where('canViewRevenue', false);

            foreach (DASH_REVENUE_PROPS as $prop) {
                $page->missing($prop);
            }
        });
});

test('a platform admin without any role assignment gets the dashboard without the revenue figures', function () {
    // مستخدم بلا إسناد دور: `revenue.view` غير متحققة ⇒ الشاشة تعمل بدونها.
    $this->actingAs(User::factory()->create(), 'admin')
        ->get(route('admin.dash'))
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) {
            $page->where('canViewRevenue', false);

            foreach (DASH_REVENUE_PROPS as $prop) {
                $page->missing($prop);
            }
        });
});

test('the roles that hold revenue.view do receive the revenue figures', function (Role $role) {
    $this->actingAs(dashStaff($role), 'admin')
        ->get(route('admin.dash'))
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) {
            $page->where('canViewRevenue', true);

            foreach (DASH_REVENUE_PROPS as $prop) {
                $page->has($prop);
            }
        });
})->with([
    'أدمن المنصة' => Role::PlatformAdmin,
    'الأدمن المالي' => Role::FinanceAdmin,
]);

test('the dashboard company rows never carry contract terms, tax identifiers, contact PII or the activation token', function (Role $role) {
    Company::factory()->create([
        'status' => 'active',
        'contract_fee_per_activated_employee' => 1_500,
        'contract_monthly_minimum' => 900_000,
        'contract_coordinator_service' => true,
        'vat_number' => '300000000000003',
        'commercial_registration' => '1010101010',
        'notes' => 'ملاحظة داخلية لا تخرج للواجهة',
        'requester_name' => 'مقدّم الطلب',
        'requester_email' => 'requester@example.com',
        'requester_phone' => '0500000001',
        'activation_token' => 'tok_'.str_repeat('a', 60),
    ]);

    $this->actingAs(dashStaff($role), 'admin')
        ->get(route('admin.dash'))
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) {
            $rows = $page->toArray()['props']['topCompanies'];

            expect($rows)->not->toBeEmpty();

            foreach ($rows as $row) {
                // إسقاط صريح: الاسم والعدّادان فقط — لا شيء آخر يغادر الخادم.
                expect(array_keys((array) $row))
                    ->toEqualCanonicalizing(['id', 'name', 'employees_count', 'events_count']);
            }
        });
})->with([
    'وكيل الدعم' => Role::SupportAgent,
    'الأدمن المالي' => Role::FinanceAdmin,
    'أدمن المنصة' => Role::PlatformAdmin,
]);

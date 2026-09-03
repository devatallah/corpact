<?php

use App\Enums\Role;
use App\Models\RoleAssignment;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * H §12.9 — «قرار ضريبي غير نهائي».
 *
 * الشاشة تعرض ما يطبّقه النظام فعلاً، فالاختبار يقارنها بـ`config/billing.php`
 * لا بنصّ مكتوب: لو تغيّر التصنيف في الإعدادات ولم تتبعه الشاشة يسقط الاختبار.
 */
function taxStaff(Role $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role, RoleAssignment::SCOPE_PLATFORM);

    return $user->fresh();
}

test('the finance admin can open the tax status screen', function () {
    $this->actingAs(taxStaff(Role::FinanceAdmin), 'admin')
        ->get('/admin/finance/tax-status')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/finance/tax-status')
            ->has('flows')
            ->where('vatRatePercent', config('billing.vat_rate_percent'))
            ->where('realInvoicesEnabled', (bool) config('billing.real_invoices_enabled'))
        );
});

test('every configured tax flow reaches the screen with its real treatment', function () {
    $configured = config('billing.tax');

    $this->actingAs(taxStaff(Role::FinanceAdmin), 'admin')
        ->get('/admin/finance/tax-status')
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) use ($configured) {
            $flows = collect($page->toArray()['props']['flows'])->keyBy('key');

            expect($flows)->toHaveCount(count($configured));

            foreach ($configured as $key => $rule) {
                expect($flows[$key]['treatment'])->toBe($rule['treatment'])
                    ->and($flows[$key]['issuer'])->toBe($rule['issuer'])
                    ->and($flows[$key]['label'])->not->toBe('');
            }
        });
});

test('the support agent and a plain platform admin cannot open it', function () {
    // الشاشة مالية بحتة: خلف `invoice.approve` مثل بقيّة شاشات الفوترة.
    $this->actingAs(taxStaff(Role::SupportAgent), 'admin')
        ->get('/admin/finance/tax-status')
        ->assertForbidden();

    $this->actingAs(taxStaff(Role::PlatformAdmin), 'admin')
        ->get('/admin/finance/tax-status')
        ->assertForbidden();
});

test('a guest is redirected to the admin login', function () {
    $this->get('/admin/finance/tax-status')->assertRedirect('/admin/login');
});

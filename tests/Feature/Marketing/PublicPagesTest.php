<?php

use App\Enums\Role;
use App\Models\RoleAssignment;
use App\Models\SupportMessage;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * الموقع العام: لا مسار يردّ 500، ونموذج «اطلب عرضاً» يصل قاعدة البيانات.
 *
 * ستة مسارات عامة كانت `Route::view` تشير إلى قوالب Blade حُذفت في إعادة
 * البناء، فكانت تردّ خطأ خادم لا 404. وهذه الاختبارات تمنع تكرارها: كل
 * مسار عام يُفتح، والنموذج يُرسل ويُحفظ ثم يعود إلى صفحة سليمة.
 */
function supportInboxAdmin(): User
{
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    return $admin->fresh();
}

test('every public route answers without a server error', function (string $uri) {
    $response = $this->get($uri);

    expect($response->status())->toBeLessThan(400);
})->with([
    'الرئيسية' => '/',
    'كيف تعمل' => '/how-it-works',
    'للشركات' => '/for-companies',
    'للمزوّدين' => '/for-providers',
    'الأنشطة' => '/activities',
    'النموذج المالي' => '/model',
    'تواصل معنا' => '/contact',
    'الشروط والأحكام' => '/terms',
    'سياسة الخصوصية' => '/privacy',
    'الدعم' => '/support',
    'الباقات' => '/packages',
    'الأسعار' => '/pricing',
    'عن تيمات' => '/about',
    'المدونة' => '/blog',
]);

test('every portal the header offers a login for actually has one', function (string $uri) {
    // قائمة «دخول المنصة» تعرض ثلاث بوابات. إعادة تسمية أي مسار منها تكسر
    // عنصراً في القائمة بصمت، فيُثبَّت هنا بدل أن يُكتشف من زائر.
    $this->get($uri)->assertOk();
})->with([
    'الموظف' => '/employee/login',
    'الشركة' => '/company/login',
    'مزوّد الخدمة' => '/partner/login',
]);

test('the legal pages resolve to their own component, not a shared shell', function () {
    // صفحة Inertia تُبنى في المتصفح: نص البنود لا يظهر في HTML الخادم أصلاً،
    // فالتحقق منه بـ`assertSee` يختبر شيئاً لا وجود له. المُتحقَّق منه هو أن
    // المسار يوصل إلى المكوّن الصحيح — وهو ما يكسره خطأ في التوجيه فعلاً.
    $this->get('/terms')->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('marketing/terms'));

    $this->get('/privacy')->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('marketing/privacy'));
});

test('a route that lost its blade view redirects to its successor instead of erroring', function (string $from, string $to) {
    $this->get($from)->assertRedirect($to);
})->with([
    ['/support', '/contact'],
    ['/packages', '/for-providers'],
    ['/pricing', '/for-providers'],
    ['/about', '/how-it-works'],
    ['/blog', '/'],
]);

// ── النموذج نفسه ────────────────────────────────────────────────────────

test('the contact form reaches the database with every field it collects', function () {
    $response = $this->post('/support', [
        'name' => 'محمد بن سعود',
        'company_name' => 'شركة الرواد للتقنية',
        'email' => 'lead@company.sa',
        'phone' => '0501234567',
        'employees_range' => '201-500',
        'financial_track' => 'community-wallet',
        'message' => 'نرغب بعرض مخصص لفريق التقنية.',
    ]);

    // العودة إلى صفحة سليمة: الوجهة القديمة `/support#contact` كانت 500.
    $response->assertRedirect('/contact#form');
    $response->assertSessionHas('success');

    $message = SupportMessage::sole();

    expect($message->name)->toBe('محمد بن سعود')
        ->and($message->company_name)->toBe('شركة الرواد للتقنية')
        ->and($message->employees_range)->toBe('201-500')
        ->and($message->financial_track)->toBe('community-wallet')
        ->and($message->status)->toBe('new');
});

test('the pickers only accept values the form actually offers', function (string $field, string $value) {
    $this->post('/support', [
        'name' => 'محمد',
        'email' => 'a@b.sa',
        'message' => 'رسالة',
        $field => $value,
    ])->assertSessionHasErrors($field);

    expect(SupportMessage::count())->toBe(0);
})->with([
    'نطاق موظفين ملفَّق' => ['employees_range', '900-plus'],
    'مسار مالي ملفَّق' => ['financial_track', 'free-forever'],
]);

test('a submission missing what the form marks required is rejected', function () {
    $this->post('/support', ['name' => 'محمد'])
        ->assertSessionHasErrors(['email', 'message']);

    expect(SupportMessage::count())->toBe(0);
});

test('the admin inbox shows a lead and finds it by company name', function () {
    SupportMessage::create([
        'name' => 'محمد بن سعود',
        'company_name' => 'شركة الرواد للتقنية',
        'email' => 'lead@company.sa',
        'employees_range' => '50-200',
        'financial_track' => 'employee-pay',
        'message' => 'رسالة',
    ]);

    $admin = supportInboxAdmin();

    $this->actingAs($admin, 'admin')
        ->get('/admin/support')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('messages.per_page', 20)
            ->has('messages.data', 1)
            ->where('messages.data.0.company_name', 'شركة الرواد للتقنية')
            ->where('messages.data.0.financial_track', 'employee-pay')
        );

    // البحث باسم الشركة — أوّل ما يُبحث به في متابعة طلب عرض. النص العربي
    // يُرمَّز في المسار: تمريره خاماً إلى `get()` يشوّه بايتاته فيبحث بغيره.
    $this->actingAs($admin, 'admin')
        ->get('/admin/support?search='.urlencode('الرواد'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('messages.data', 1));
});

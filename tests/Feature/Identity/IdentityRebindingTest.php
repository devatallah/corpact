<?php

use App\Enums\Role;
use App\Models\Category;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

/*
 * H §4 — رقم الجوال هو **بيان الاعتماد**: من يملك الرقم يفتح الحساب برمز
 * تحقق. يترتب على ذلك قاعدتان تحرسهما هذه الملفات:
 *
 *   1. لا يكتب أي مسار عام رقمَ هوية قائمة. ربط الهوية يقرأ ولا يكتب؛ الكتابة
 *      خطوة منفصلة لا تُنادى إلا من مسار موثَّق (IdentityResolver::bindPhone).
 *   2. لا يصل مسار عام إلى هوية قائمة بذكر بريدها. التسجيل العام للشركة
 *      والمزوّد والموظف يشترط بريداً لم تره المنصة في أي جدول هوية.
 *
 * وفي المقابل: مسؤول الحساب الذي أنشأه الأدمن بلا جوال يجب أن يظل قابلاً
 * للوصول إلى دخول عامل عندما يُملأ رقمه من مسار موثَّق.
 */

/**
 * موظف أنشأه الأدمن بلا رقم جوال: بريده في `employees` و`users` ولا أثر له في
 * `companies` أو `partners` — وهذه بالضبط الثغرة العابرة للبوابات، إذ كان كل
 * تسجيل عام يفحص جدوله وحده.
 */
function phonelessEmployeeIdentity(string $email): array
{
    $company = Company::factory()->create(['status' => 'active']);

    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'email' => $email,
        'phone' => null,
        'status' => 'active',
    ]);

    $user = User::query()->where('email', $email)->firstOrFail();

    expect($user->phone)->toBeNull()
        ->and($employee->fresh()->user_id)->toBe($user->id);

    return [$employee, $user];
}

/** مسؤول حساب أنشأه الأدمن بلا رقم جوال — الضحية النموذجية. */
function phonelessAccountManager(string $email, string $domain = 'victim.example'): array
{
    $company = Company::factory()->create([
        'email' => $email,
        'domain' => $domain,
        'contact_phone' => null,
        'status' => 'active',
    ]);

    $user = User::query()->where('email', $email)->firstOrFail();

    expect($user->phone)->toBeNull();

    return [$company, $user];
}

test('a public company registration cannot rebind an existing identity by reusing its email', function () {
    [, $victim] = phonelessEmployeeIdentity('person@victim.example');

    $this->post('/company/register', [
        'name' => 'شركة المهاجم',
        'email' => 'person@victim.example',
        'sector' => 'تقنية',
        'employee_count_range' => '50-100',
        'domain' => 'attacker.example',
        'city' => 'الرياض',
        'contact_name' => 'مهاجم',
        'contact_title' => 'مدير',
        'contact_phone' => '0501112233',
    ])->assertSessionHasErrors('email');

    // لا رقم كُتب على هوية الضحية، ولا شركة أُنشئت باسم بريدها.
    expect($victim->fresh()->phone)->toBeNull()
        ->and(User::query()->where('phone', '966501112233')->exists())->toBeFalse()
        ->and(Company::query()->where('domain', 'attacker.example')->exists())->toBeFalse();

    $this->assertGuest('company');
});

test('a public provider registration cannot rebind an existing identity by reusing its email', function () {
    [, $victim] = phonelessEmployeeIdentity('owner@victim.example');
    $category = Category::factory()->create();

    $this->post('/partner/register', [
        'name' => 'مزوّد المهاجم',
        'email' => 'owner@victim.example',
        'city' => 'الرياض',
        'district' => 'العليا',
        'categories' => [$category->id],
        'venues_count' => 1,
        'working_hours' => '9-5',
        'contact_name' => 'مهاجم',
        'contact_title' => 'مدير',
        'contact_phone' => '0501112244',
    ])->assertSessionHasErrors('email');

    expect($victim->fresh()->phone)->toBeNull()
        ->and(User::query()->where('phone', '966501112244')->exists())->toBeFalse();

    $this->assertGuest('partner');
});

test('a public employee registration cannot rebind an existing identity by reusing its email', function () {
    [, $victim] = phonelessAccountManager('am@victim.example');

    $this->post('/employee/register', [
        'name' => 'مهاجم',
        'email' => 'am@victim.example',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '0501112255',
    ])->assertSessionHasErrors('email');

    expect($victim->fresh()->phone)->toBeNull()
        ->and(Employee::withoutGlobalScopes()->where('email', 'am@victim.example')->exists())->toBeFalse();

    $this->assertGuest('employee');
});

test('a phone the identity never verified authenticates nobody', function () {
    $otp = fakeOtp();
    [$employee, $victim] = phonelessEmployeeIdentity('person@victim.example');

    // سلسلة الاستيلاء كاملة: سجّل شركة ببريد الضحية ورقمك، ثم اطلب رمزاً.
    $this->post('/company/register', [
        'name' => 'شركة المهاجم',
        'email' => 'person@victim.example',
        'sector' => 'تقنية',
        'employee_count_range' => '50-100',
        'domain' => 'attacker.example',
        'city' => 'الرياض',
        'contact_name' => 'مهاجم',
        'contact_title' => 'مدير',
        'contact_phone' => '0501112233',
    ]);

    expect($victim->fresh()->phone)->toBeNull();

    // الرقم لا يفتح بوابة الموظف (حيث للضحية عضوية) ولا بوابة الشركة.
    $this->post(route('employee.otp.request'), ['phone' => '0501112233'])
        ->assertSessionHasErrors('phone');

    $this->post(route('company.otp.request'), ['phone' => '0501112233'])
        ->assertSessionHasErrors('phone');

    // لا رمز أُرسل أصلاً إلى رقم المهاجم — فلا شيء يُتحقق به.
    expect($otp->sent)->toBeEmpty();

    $this->post(route('employee.otp.verify'), ['phone' => '0501112233', 'code' => '123456'])
        ->assertSessionHasErrors();

    $this->assertGuest('employee');
    $this->assertGuest('company');

    expect($employee->fresh()->phone)->toBeNull();
});

test('an admin filling in the missing contact phone still gives the account manager a working login', function () {
    $otp = fakeOtp();
    [$company, $user] = phonelessAccountManager('am@newco.example', 'newco.example');

    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.companies.update', $company), [
            'name' => $company->name,
            'contact_phone' => '0509000111',
        ])->assertRedirect();

    // المسار الموثَّق يربط الرقم — والدخول برمز التحقق يعمل من طرف إلى طرف.
    expect($user->fresh()->phone)->toBe('966509000111');

    $this->post(route('company.otp.request'), ['phone' => '0509000111'])
        ->assertSessionHasNoErrors();

    $this->post(route('company.otp.verify'), ['phone' => '0509000111', 'code' => $otp->lastCode()])
        ->assertRedirect(route('company.dash'));

    $this->assertAuthenticatedAs($company->fresh(), 'company');
});

test('an employee record gaining a phone binds the identity that had none', function () {
    [$company, $user] = phonelessAccountManager('am@fillco.example', 'fillco.example');

    // نفس البريد ⇒ صف الموظف يلتقي بهوية مسؤول الحساب نفسها.
    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'email' => 'am@fillco.example',
        'phone' => null,
    ]);

    expect($employee->fresh()->user_id)->toBe($user->id)
        ->and($user->fresh()->phone)->toBeNull();

    $employee->update(['phone' => '0509000222']);

    expect($user->fresh()->phone)->toBe('966509000222');
});

test('binding never moves a phone that already belongs to another identity', function () {
    $owner = User::factory()->create(['phone' => '966509000333']);
    [$company, $user] = phonelessAccountManager('am@sharedco.example', 'sharedco.example');

    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.companies.update', $company), [
            'name' => $company->name,
            'contact_phone' => '0509000333',
        ]);

    // الرقم يبقى لصاحبه؛ الهوية الأخرى تبقى بلا رقم بدل أن تسرقه.
    expect($owner->fresh()->phone)->toBe('966509000333')
        ->and($user->fresh()->phone)->toBeNull();
});

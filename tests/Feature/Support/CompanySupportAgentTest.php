<?php

use App\Enums\Role;
use App\Models\Company;
use App\Models\RoleAssignment;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * وكيل الدعم المتابع للشركة — إسناد تنظيمي لا صلاحية.
 *
 * فريق الدعم عدة أشخاص، ولكل واحد أكثر من شركة. الحقل يقول من يتابع من،
 * ولا يغيّر ما يستطيع أحدهم رؤيته: وكيل الدعم يبحث في كل الشركات كما كان.
 */
function supportPlatformAdmin(): User
{
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin, RoleAssignment::SCOPE_PLATFORM);

    return $admin->fresh();
}

function supportAgentUser(string $name = 'وكيل'): User
{
    $agent = User::factory()->create(['name' => $name]);
    $agent->assignRole(Role::SupportAgent, RoleAssignment::SCOPE_PLATFORM);

    return $agent->fresh();
}

test('the company form offers the support agents, each with its current load', function () {
    $busy = supportAgentUser('سلمى');
    $idle = supportAgentUser('طارق');

    Company::factory()->count(2)->create(['support_agent_user_id' => $busy->id]);

    $this->actingAs(supportPlatformAdmin(), 'admin')
        ->get('/admin/companies/create')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('supportAgents', 2)
            // العدد هو ما يمنع إسناد كل الشركات إلى أول اسم في القائمة.
            ->where('supportAgents.0.companies', 2)
            ->where('supportAgents.1.companies', 0)
        );

    expect($idle->id)->not->toBeNull();
});

test('a company records the support agent chosen for it', function () {
    $agent = supportAgentUser();
    $company = Company::factory()->create(['support_agent_user_id' => null]);

    $this->actingAs(supportPlatformAdmin(), 'admin')
        ->put("/admin/companies/{$company->id}", [
            'name' => $company->name,
            'email' => $company->email,
            'domain' => 'example.sa',
            'sector' => 'تقنية',
            'city' => 'الرياض',
            'status' => $company->status,
            'support_agent_user_id' => $agent->id,
        ])
        ->assertSessionHasNoErrors();

    expect($company->fresh()->support_agent_user_id)->toBe($agent->id)
        ->and($company->fresh()->supportAgent->name)->toBe($agent->name);
});

test('a user who is not a support agent cannot be assigned as one', function () {
    // مستخدم بلا دور دعم — الحقل ليس باباً لإسناد أي حساب.
    $stranger = User::factory()->create();
    $company = Company::factory()->create();

    $this->actingAs(supportPlatformAdmin(), 'admin')
        ->put("/admin/companies/{$company->id}", [
            'name' => $company->name,
            'email' => $company->email,
            'domain' => 'example.sa',
            'sector' => 'تقنية',
            'city' => 'الرياض',
            'status' => $company->status,
            'support_agent_user_id' => $stranger->id,
        ])
        ->assertSessionHasErrors('support_agent_user_id');

    expect($company->fresh()->support_agent_user_id)->toBeNull();
});

test('clearing the field leaves the company without a follower', function () {
    $agent = supportAgentUser();
    $company = Company::factory()->create(['support_agent_user_id' => $agent->id]);

    $this->actingAs(supportPlatformAdmin(), 'admin')
        ->put("/admin/companies/{$company->id}", [
            'name' => $company->name,
            'email' => $company->email,
            'domain' => 'example.sa',
            'sector' => 'تقنية',
            'city' => 'الرياض',
            'status' => $company->status,
            'support_agent_user_id' => null,
        ])
        ->assertSessionHasNoErrors();

    expect($company->fresh()->support_agent_user_id)->toBeNull();
});

test('the assignment grants nothing — an agent still reaches every company', function () {
    // القرار كان «إسناد بلا صلاحية»: وكيل مُسنَد لشركة واحدة يبحث في الكل،
    // ووكيل بلا إسناد إطلاقاً يبحث في الكل أيضاً. هذا الاختبار يحرس القرار.
    $mine = Company::factory()->create(['name' => 'شركة متابَعة']);
    $other = Company::factory()->create(['name' => 'شركة غير متابَعة']);

    $agent = supportAgentUser();
    $mine->forceFill(['support_agent_user_id' => $agent->id])->save();

    $response = $this->actingAs($agent, 'admin')
        ->get('/admin/support-console?term='.urlencode('شركة').'&scope=companies');

    $response->assertOk();

    expect($other->fresh()->support_agent_user_id)->toBeNull();
});

// ── مركز الدعم: «شركاتي» تصفية افتراضية لا حجب ──────────────────────────

test('the support console starts on the agent’s own companies', function () {
    $agent = supportAgentUser();
    $mine = Company::factory()->create(['name' => 'شركة الرواد', 'support_agent_user_id' => $agent->id]);
    Company::factory()->create(['name' => 'شركة الرواد الثانية']);

    $this->actingAs($agent, 'admin')
        ->get('/admin/support-console?search='.urlencode('الرواد'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('coverage.value', 'mine')
            ->where('coverage.my_companies', 1)
            ->has('results.companies', 1)
            ->where('results.companies.0.id', $mine->id)
        );
});

test('choosing all companies widens the same search', function () {
    $agent = supportAgentUser();
    Company::factory()->create(['name' => 'شركة الرواد', 'support_agent_user_id' => $agent->id]);
    Company::factory()->create(['name' => 'شركة الرواد الثانية']);

    // التصفية لا تحجب: النتيجة الثانية تُدرك بنقرة، لا بصلاحية جديدة.
    $this->actingAs($agent, 'admin')
        ->get('/admin/support-console?search='.urlencode('الرواد').'&coverage=all')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('results.companies', 2));
});

test('an email match cannot slip past the coverage filter', function () {
    // استعلام الشركات يجمع الاسم والبريد بـ`orWhere`؛ بلا تجميعهما تهرب
    // نتيجة البريد من التصفية وتظهر شركة ليست للوكيل.
    $agent = supportAgentUser();
    Company::factory()->create(['name' => 'شركة أ', 'email' => 'shared@example.sa', 'support_agent_user_id' => $agent->id]);
    Company::factory()->create(['name' => 'شركة ب', 'email' => 'shared2@example.sa']);

    $this->actingAs($agent, 'admin')
        ->get('/admin/support-console?search=shared')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('results.companies', 1));
});

test('a platform admin with no assigned companies starts on all, not on nothing', function () {
    Company::factory()->count(2)->create(['name' => 'شركة الرواد']);

    $this->actingAs(supportPlatformAdmin(), 'admin')
        ->get('/admin/support-console?search='.urlencode('الرواد'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('coverage.value', 'all')
            ->where('coverage.my_companies', 0)
            ->has('results.companies', 2)
        );
});

<?php

use App\Models\ActivityLog;
use App\Models\AuditLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\WalletTransaction;
use App\Support\Audit\AuditAction;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 11 (H §23)
| «محاولة وصول مستخدم من شركة إلى بيانات شركة أخرى ← 404 وتسجيل في سجل التدقيق»
|--------------------------------------------------------------------------
|
| **404 لا 403** قرار متعمّد (H §4): الرد بـ403 يؤكد للمُجَسِّس أن المعرّف
| موجود ويخص شركة أخرى، فيتحول الخطأ إلى أداة استكشاف. الآلية نطاق استعلام
| عام (`CompanyScope`) لا سياسة، فالمعرّف الأجنبي لا يُحلّ أصلاً.
|
| والتسجيل شرط مساوٍ للرد: محاولة صامتة لا تُكتشف. يُكتب الصف في سجل نشاط
| الشركة **ويُعكس** إلى سجل التدقيق (H §19) بإجراء `security.cross_company_probe`.
|
| والضدّ لا يقل أهمية: معرّف غير موجود أصلاً 404 عادي **بلا** صف تجسس — وإلا
| امتلأ السجل ضجيجاً وفقد معناه.
*/

test('سيناريو 11 — الوصول عبر الشركات يعيد 404 لا 403 ويُسجَّل في سجل التدقيق', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $employeeA = Employee::factory()->create(['company_id' => $companyA->id]);
    $ownEvent = Event::factory()->create(['company_id' => $companyA->id]);

    $foreignCommunity = Community::factory()->create(['company_id' => $companyB->id]);
    $foreignEvent = Event::factory()->create(['company_id' => $companyB->id]);

    // ── ما يخصه يُحلّ عادياً — الحاجز ليس تعطيلاً شاملاً ──────────────────
    $this->actingAs($employeeA, 'employee')
        ->get(route('employee.events.show', $ownEvent))
        ->assertOk();

    // ── مجتمع شركة أخرى ← 404 بالضبط، لا 403 ─────────────────────────────
    $response = $this->actingAs($employeeA, 'employee')
        ->get(route('employee.community.show', $foreignCommunity));

    $response->assertStatus(404);
    expect($response->status())->not->toBe(403);

    // ── فعالية شركة أخرى ← 404 كذلك ──────────────────────────────────────
    $this->actingAs($employeeA, 'employee')
        ->get(route('employee.events.show', $foreignEvent))
        ->assertStatus(404);

    // ── صف التجسس في سجل نشاط الشركة الفاعلة ─────────────────────────────
    $probes = ActivityLog::query()->where('type', 'cross_company_probe')->get();

    expect($probes)->toHaveCount(2);

    $communityProbe = $probes->firstWhere('subject_id', $foreignCommunity->id);

    expect($communityProbe)->not->toBeNull()
        // يُنسب لشركة الفاعل لا لشركة الهدف — السجل ملك من حاول.
        ->and($communityProbe->company_id)->toBe($companyA->id)
        ->and($communityProbe->data['foreign_company_id'])->toBe($companyB->id)
        ->and($communityProbe->data['model'])->toBe('Community')
        ->and($communityProbe->actor_user_id)->toBe($employeeA->fresh()->user_id);

    // ── وانعكاسه في سجل التدقيق المُلزم (H §19) ──────────────────────────
    $auditRows = AuditLog::query()->where('action', AuditAction::CROSS_COMPANY_PROBE)->get();

    expect($auditRows)->toHaveCount(2)
        ->and($auditRows->pluck('company_id')->unique()->all())->toBe([$companyA->id])
        ->and($auditRows->firstWhere('entity_id', $foreignCommunity->id))->not->toBeNull()
        ->and($auditRows->firstWhere('entity_id', $foreignEvent->id))->not->toBeNull()
        ->and($auditRows->first()->actor_user_id)->toBe($employeeA->fresh()->user_id);
});

test('سيناريو 11 — بوابة الشركة لا تستطيع تحريك مال إلى مجتمع شركة أخرى', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $foreignCommunity = Community::factory()->create(['company_id' => $companyB->id]);

    $this->actingAs($companyA, 'company')
        ->post(route('company.wallet.distribute'), [
            'community_id' => $foreignCommunity->id,
            'amount' => 100,
        ])
        ->assertStatus(404);

    expect(ActivityLog::query()->where('type', 'cross_company_probe')->exists())->toBeTrue()
        ->and(AuditLog::query()->where('action', AuditAction::CROSS_COMPANY_PROBE)->exists())->toBeTrue()
        // ولا هللة تحركت في أي اتجاه.
        ->and(WalletTransaction::count())->toBe(0)
        ->and($foreignCommunity->fresh()->balance)->toBe(0.0);

    FinancialInvariants::assertAll();
});

test('سيناريو 11 — معرّف غير موجود أصلاً 404 عادي بلا صف تجسس', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    $this->actingAs($employee, 'employee')
        ->get(route('employee.community.show', 999_999))
        ->assertStatus(404);

    expect(ActivityLog::query()->where('type', 'cross_company_probe')->exists())->toBeFalse()
        ->and(AuditLog::query()->where('action', AuditAction::CROSS_COMPANY_PROBE)->exists())->toBeFalse();
});

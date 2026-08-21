<?php

use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\User;
use App\Services\Company\InvitationService;

// H §5 — دعوة برابط تفعيل صالح 7 أيام قابل لإعادة الإرسال؛ الرابط المنتهي
// يُعاد إرساله فقط ولا يُنشأ حساب جديد؛ الجوال المسجل في شركة أخرى يُربط
// بنفس الحساب العالمي كعضوية جديدة.

test('an invitation carries a 7-day expiry and is delivered over the message channel', function () {
    $messages = fakeMessages();
    $company = Company::factory()->create();

    $invitation = app(InvitationService::class)->invite($company, [
        'email' => 'new@corp.example',
        'name' => 'موظف جديد',
        'phone' => '0553000001',
    ]);

    expect($invitation->expires_at->isFuture())->toBeTrue()
        ->and(round($invitation->expires_at->diffInDays(now(), true)))->toEqual(7.0)
        ->and($invitation->send_count)->toBe(1)
        ->and($invitation->phone)->toBe('966553000001');

    expect($messages->sent)->toHaveCount(1)
        ->and($messages->sent[0]['phone'])->toBe('966553000001')
        ->and($messages->sent[0]['purpose'])->toBe('invitation')
        ->and($messages->sent[0]['message'])->toContain($invitation->token);
});

test('resending revives an expired invitation with a fresh window — same row, never a new account', function () {
    $messages = fakeMessages();
    $company = Company::factory()->create();

    $invitation = Invitation::factory()->create([
        'company_id' => $company->id,
        'phone' => '966553000002',
        'status' => 'expired',
        'expires_at' => now()->subDay(),
        'send_count' => 1,
    ]);

    $this->actingAs($company, 'company')
        ->post(route('company.invitations.resend', $invitation))
        ->assertRedirect();

    $invitation->refresh();

    expect($invitation->status)->toBe('pending')
        ->and($invitation->expires_at->isFuture())->toBeTrue()
        ->and($invitation->send_count)->toBe(2)
        ->and(Invitation::withoutGlobalScopes()->where('company_id', $company->id)->count())->toBe(1);

    expect($messages->sent)->toHaveCount(1);
});

test('an accepted invitation cannot be resent', function () {
    $company = Company::factory()->create();

    $invitation = Invitation::factory()->accepted()->create(['company_id' => $company->id]);

    $this->actingAs($company, 'company')
        ->post(route('company.invitations.resend', $invitation))
        ->assertSessionHasErrors('invitation');
});

test('an expired link never creates an account — resend only', function () {
    $company = Company::factory()->create();

    $invitation = Invitation::factory()->create([
        'company_id' => $company->id,
        'email' => 'late@corp.example',
        'status' => 'pending',
        'expires_at' => now()->subHour(),
    ]);

    $this->get(route('invitation.show', $invitation->token))
        ->assertRedirect(route('employee.login'));

    $this->post(route('invitation.accept', $invitation->token), [
        'name' => 'متأخر',
        'phone' => '0553000003',
    ])->assertRedirect(route('employee.login'));

    expect(Employee::withoutGlobalScopes()->where('email', 'late@corp.example')->exists())->toBeFalse()
        ->and($invitation->fresh()->status)->toBe('pending');
});

test('accepting an import invitation creates the employee with department, employee number and membership', function () {
    $company = Company::factory()->create();
    $department = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);

    $invitation = Invitation::factory()->create([
        'company_id' => $company->id,
        'email' => 'joiner@corp.example',
        'name' => 'أحمد السالم',
        'phone' => '966553000004',
        'department_id' => $department->id,
        'employee_number' => 'E-44',
        'expires_at' => now()->addDays(7),
    ]);

    $this->post(route('invitation.accept', $invitation->token), [
        'name' => 'أحمد السالم',
    ])->assertRedirect(route('employee.home'));

    $employee = Employee::withoutGlobalScopes()->where('email', 'joiner@corp.example')->first();

    expect($employee)->not->toBeNull()
        ->and($employee->department_id)->toBe($department->id)
        ->and($employee->employee_number)->toBe('E-44')
        ->and($employee->phone)->toBe('966553000004')
        ->and($employee->user_id)->not->toBeNull();

    $membership = CompanyMembership::query()
        ->where('user_id', $employee->user_id)
        ->where('company_id', $company->id)
        ->first();

    expect($membership)->not->toBeNull()
        ->and($membership->status)->toBe('active')
        ->and($invitation->fresh()->status)->toBe('accepted');
});

test('a phone already registered under another company joins the SAME global account as a new membership', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    // Existing identity under company A.
    Employee::factory()->create([
        'company_id' => $companyA->id,
        'phone' => '0553000005',
        'email' => 'person@a.example',
    ]);

    $usersBefore = User::count();

    $invitation = Invitation::factory()->create([
        'company_id' => $companyB->id,
        'email' => 'person@b.example',
        'phone' => '966553000005',
        'expires_at' => now()->addDays(7),
    ]);

    $this->post(route('invitation.accept', $invitation->token), [
        'name' => 'نفس الشخص',
    ])->assertRedirect(route('employee.home'));

    // No duplicate global account.
    expect(User::count())->toBe($usersBefore);

    $user = User::where('phone', '966553000005')->firstOrFail();

    expect(CompanyMembership::query()->where('user_id', $user->id)->count())->toBe(2)
        ->and(CompanyMembership::query()->where('user_id', $user->id)->pluck('company_id')->sort()->values()->all())
        ->toBe(collect([$companyA->id, $companyB->id])->sort()->values()->all());
});

test('a used invitation link cannot create a second account', function () {
    $company = Company::factory()->create();

    $invitation = Invitation::factory()->create([
        'company_id' => $company->id,
        'email' => 'once@corp.example',
        'phone' => '966553000006',
        'expires_at' => now()->addDays(7),
    ]);

    $this->post(route('invitation.accept', $invitation->token), ['name' => 'الأول'])
        ->assertRedirect(route('employee.home'));

    $this->post(route('invitation.accept', $invitation->token), ['name' => 'محتال'])
        ->assertRedirect(route('employee.login'));

    expect(Employee::withoutGlobalScopes()->where('email', 'once@corp.example')->count())->toBe(1);
});

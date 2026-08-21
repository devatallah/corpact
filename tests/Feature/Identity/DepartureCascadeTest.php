<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Notification;
use App\Models\RoleAssignment;
use App\Services\Community\LeadershipService;

// H §4/§5 departure cascade: deactivating the employee revokes every session
// immediately, removes community leaderships (account manager notified),
// and cancels unconfirmed participations — confirmed ones survive.

test('deactivation revokes the user\'s sessions immediately', function () {
    $otp = fakeOtp();
    $employee = Employee::factory()->create(['phone' => '0509600001']);

    $this->post(route('employee.otp.request'), ['phone' => '0509600001']);
    $this->post(route('employee.otp.verify'), ['phone' => '0509600001', 'code' => $otp->lastCode()]);
    $this->get(route('employee.home'))->assertOk();

    // Account manager deactivates the employee (legacy status flip is the
    // single trigger — every code path funnels through the observer).
    $employee->fresh()->update(['status' => 'inactive']);

    $this->get(route('employee.home'))->assertRedirect();
    $this->assertGuest('employee');
});

test('deactivation removes community leaderships and notifies the account manager', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    // A5/H §6: leadership lives in role_assignments only.
    app(LeadershipService::class)
        ->assignLeader($community, $employee->fresh(), asPrimary: true);

    $userId = $employee->fresh()->user_id;
    expect(RoleAssignment::where('user_id', $userId)->where('role', 'community_leader')->exists())->toBeTrue();

    $employee->fresh()->update(['status' => 'inactive']);

    expect(RoleAssignment::where('user_id', $userId)->where('role', 'community_leader')->exists())->toBeFalse()
        ->and($community->fresh()->leaderless_since)->not->toBeNull();

    $notification = Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('type', 'community_leaderless')
        ->first();

    expect($notification)->not->toBeNull()
        ->and($notification->data['community_id'])->toBe($community->id);
});

test('deactivation cancels unconfirmed participations but confirmed ones survive', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    $openEvent = Event::factory()->open()->create(['company_id' => $company->id, 'participants_count' => 3]);
    $waitlistEvent = Event::factory()->waitingpartner()->create(['company_id' => $company->id]);
    $confirmedEvent = Event::factory()->confirmed()->create(['company_id' => $company->id]);
    $completedEvent = Event::factory()->completed()->create(['company_id' => $company->id]);

    foreach ([[$openEvent, 'reserved'], [$waitlistEvent, 'waitlisted'], [$confirmedEvent, 'reserved'], [$completedEvent, 'reserved']] as [$event, $status]) {
        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => $status,
        ]);
    }

    $employee->fresh()->update(['status' => 'inactive']);

    $statusFor = fn (Event $event) => EventParticipant::where('event_id', $event->id)
        ->where('employee_id', $employee->id)
        ->value('seat_status');

    expect($statusFor($openEvent))->toBe('cancelled')
        ->and($statusFor($waitlistEvent))->toBe('cancelled')
        ->and($statusFor($confirmedEvent))->toBe('reserved')   // confirmed paid participation survives
        ->and($statusFor($completedEvent))->toBe('reserved')   // history untouched
        // A7: العدّاد يُعاد اشتقاقه من صفوف المقاعد المحجوزة الفعلية —
        // الصف الوحيد أُلغي فيصبح صفراً (كان قديماً decrement أعمى 3←2).
        ->and($openEvent->fresh()->participants_count)->toBe(0); // seat released
});

test('deactivating one membership marks it inactive but keeps the other company\'s membership', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $employeeA = Employee::factory()->create(['company_id' => $companyA->id, 'phone' => '0509600002']);
    $employeeB = Employee::factory()->create([
        'company_id' => $companyB->id,
        'phone' => '0509600002',
        'email' => 'dual@example.com',
    ]);

    $employeeA->fresh()->update(['status' => 'inactive']);

    $user = $employeeB->fresh()->user;

    expect($user->memberships()->where('company_id', $companyA->id)->value('status'))->toBe('inactive')
        ->and($user->memberships()->where('company_id', $companyB->id)->value('status'))->toBe('active')
        // All sessions are revoked regardless — the user logs in again and
        // lands only on the surviving membership.
        ->and($user->auth_epoch)->toBeGreaterThan(0);
});

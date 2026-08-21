<?php

use App\Enums\Role;
use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventComment;
use App\Models\Notification;
use App\Models\User;
use App\Services\Community\LeadershipService;
use App\Services\Community\MembershipService;

// H §6: announcements are text + link only, leader/coordinator only; member
// comments exist ONLY under events; author edit/delete within 15 minutes;
// report button routes to the account manager. No chat, no DMs.

function announcementSetup(): array
{
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $member = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);
    app(MembershipService::class)->join($member->fresh(), $community);

    return [$company, $community, $leader->fresh(), $member->fresh()];
}

test('a leader posts an announcement with text and link; a plain member cannot', function () {
    [, $community, $leader, $member] = announcementSetup();

    $this->actingAs($leader, 'employee')
        ->post(route('employee.community.announce', $community), [
            'body' => 'تجمع الخميس القادم',
            'link_url' => 'https://maps.example.com/venue',
        ])
        ->assertRedirect();

    $announcement = CommunityAnnouncement::query()->latest('id')->first();

    expect($announcement->body)->toBe('تجمع الخميس القادم')
        ->and($announcement->link_url)->toBe('https://maps.example.com/venue');

    $this->actingAs($member, 'employee')
        ->post(route('employee.community.announce', $community), ['body' => 'إعلان من عضو'])
        ->assertForbidden();
});

test('a coordinator may post announcements (leader or coordinator only — H §6)', function () {
    [, $community, , $member] = announcementSetup();

    // Grant the member the coordinator role on the community scope.
    User::query()->find($member->user_id)
        ->assignRole(Role::Coordinator, 'community', $community->id);

    $this->actingAs($member->fresh(), 'employee')
        ->post(route('employee.community.announce', $community), ['body' => 'إعلان المنسق'])
        ->assertRedirect();

    expect(CommunityAnnouncement::query()->where('employee_id', $member->id)->exists())->toBeTrue();
});

test('the author edits or deletes an announcement only within 15 minutes', function () {
    [, $community, $leader] = announcementSetup();

    $this->actingAs($leader, 'employee')
        ->post(route('employee.community.announce', $community), ['body' => 'النص الأصلي']);

    $announcement = CommunityAnnouncement::query()->latest('id')->first();

    // Within the window: edit works and stamps edited_at.
    $this->actingAs($leader, 'employee')
        ->patch(route('employee.community.announce.update', [$community, $announcement]), [
            'body' => 'النص المعدل',
        ])
        ->assertRedirect();

    expect($announcement->fresh()->body)->toBe('النص المعدل')
        ->and($announcement->fresh()->edited_at)->not->toBeNull();

    // After the window: both edit and delete are refused.
    $this->travel(16)->minutes();

    $this->actingAs($leader, 'employee')
        ->patch(route('employee.community.announce.update', [$community, $announcement]), [
            'body' => 'محاولة متأخرة',
        ])
        ->assertForbidden();

    $this->actingAs($leader, 'employee')
        ->delete(route('employee.community.announce.delete', [$community, $announcement]))
        ->assertForbidden();

    expect(CommunityAnnouncement::query()->whereKey($announcement->id)->exists())->toBeTrue();
});

test('deleting an announcement inside the window works — and only for its author', function () {
    [, $community, $leader, $member] = announcementSetup();

    $this->actingAs($leader, 'employee')
        ->post(route('employee.community.announce', $community), ['body' => 'سيُحذف']);

    $announcement = CommunityAnnouncement::query()->latest('id')->first();

    // Another member (not the author) cannot delete even inside the window.
    $this->actingAs($member, 'employee')
        ->delete(route('employee.community.announce.delete', [$community, $announcement]))
        ->assertForbidden();

    $this->actingAs($leader, 'employee')
        ->delete(route('employee.community.announce.delete', [$community, $announcement]))
        ->assertRedirect();

    expect(CommunityAnnouncement::query()->whereKey($announcement->id)->exists())->toBeFalse();
});

test('members comment under an event; non-members cannot', function () {
    [$company, $community, , $member] = announcementSetup();
    $stranger = Employee::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->open()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
    ]);

    $this->actingAs($member, 'employee')
        ->post(route('employee.events.comments.store', $event), ['body' => 'من معكم الخميس؟'])
        ->assertRedirect();

    expect(EventComment::query()->where('event_id', $event->id)->where('employee_id', $member->id)->exists())->toBeTrue();

    $this->actingAs($stranger->fresh(), 'employee')
        ->post(route('employee.events.comments.store', $event), ['body' => 'لست عضواً'])
        ->assertForbidden();
});

test('a comment author edits and deletes within 15 minutes only — deletion is soft', function () {
    [$company, $community, , $member] = announcementSetup();

    $event = Event::factory()->open()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
    ]);

    $this->actingAs($member, 'employee')
        ->post(route('employee.events.comments.store', $event), ['body' => 'النص الأول']);

    $comment = EventComment::query()->latest('id')->first();

    $this->actingAs($member, 'employee')
        ->patch(route('employee.events.comments.update', $comment), ['body' => 'نص معدل'])
        ->assertRedirect();

    expect($comment->fresh()->body)->toBe('نص معدل')
        ->and($comment->fresh()->edited_at)->not->toBeNull();

    $this->travel(16)->minutes();

    $this->actingAs($member, 'employee')
        ->patch(route('employee.events.comments.update', $comment), ['body' => 'متأخر'])
        ->assertForbidden();

    $this->actingAs($member, 'employee')
        ->delete(route('employee.events.comments.destroy', $comment))
        ->assertForbidden();

    // A second fresh comment can be deleted inside the window — softly, so
    // reported content stays inspectable.
    $this->actingAs($member, 'employee')
        ->post(route('employee.events.comments.store', $event), ['body' => 'سيُحذف']);

    $second = EventComment::query()->latest('id')->first();

    $this->actingAs($member, 'employee')
        ->delete(route('employee.events.comments.destroy', $second))
        ->assertRedirect();

    expect(EventComment::query()->whereKey($second->id)->exists())->toBeFalse()
        ->and(EventComment::withTrashed()->whereKey($second->id)->exists())->toBeTrue();
});

test('reporting a comment routes to the account manager', function () {
    [$company, $community, $leader, $member] = announcementSetup();

    $event = Event::factory()->open()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
    ]);

    $this->actingAs($member, 'employee')
        ->post(route('employee.events.comments.store', $event), ['body' => 'محتوى مسيء']);

    $comment = EventComment::query()->latest('id')->first();

    $this->actingAs($leader, 'employee')
        ->post(route('employee.events.comments.report', $comment), ['reason' => 'محتوى غير لائق'])
        ->assertRedirect();

    $notification = Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('type', 'comment_reported')
        ->first();

    expect($notification)->not->toBeNull()
        ->and($notification->data['comment_id'])->toBe($comment->id)
        ->and($notification->data['reported_by'])->toBe($leader->id);
});

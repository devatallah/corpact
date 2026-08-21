<?php

use App\Enums\Role;
use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Models\User;

// H §9 القاعدة 2: أدمن تيمات وحده يغيّر حالة فعالية يدوياً، بسبب مكتوب،
// ويُسجَّل في سجل التدقيق وسجل الانتقالات.

function forcedEvent(): Event
{
    $event = Event::factory()->create(['event_date' => now()->subDay()->toDateString()]);
    $event->forceFill(['status' => 'completed'])->save();

    return $event->fresh();
}

it('lets a platform admin force a status change outside the table with a written reason, audited', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $event = forcedEvent();

    $this->actingAs($admin, 'admin')
        ->post("/admin/events/{$event->id}/force-status", [
            'status' => 'confirmed',
            'reason' => 'ثبت أن الفعالية لم تُقم — إرجاع يدوي',
        ])
        ->assertSessionHas('success');

    expect($event->fresh()->status)->toBe('confirmed');

    $history = EventStatusHistory::where('event_id', $event->id)->latest('id')->first();
    expect($history->is_manual)->toBeTrue()
        ->and($history->from_status)->toBe('completed')
        ->and($history->reason)->toBe('ثبت أن الفعالية لم تُقم — إرجاع يدوي')
        ->and($history->actor_id)->toBe($admin->id);

    expect(ActivityLog::where('type', 'event_status_forced')->exists())->toBeTrue();
});

it('refuses a manual change without a written reason', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $event = forcedEvent();

    $this->actingAs($admin, 'admin')
        ->post("/admin/events/{$event->id}/force-status", ['status' => 'confirmed'])
        ->assertSessionHasErrors('reason');

    expect($event->fresh()->status)->toBe('completed');
});

it('blocks admins without the event.force_state permission (finance admin)', function () {
    $finance = User::factory()->create();
    $finance->assignRole(Role::FinanceAdmin);

    $event = forcedEvent();

    $this->actingAs($finance, 'admin')
        ->post("/admin/events/{$event->id}/force-status", [
            'status' => 'confirmed',
            'reason' => 'محاولة غير مخولة',
        ])
        ->assertForbidden();

    expect($event->fresh()->status)->toBe('completed');
});

it('admin destroy no longer hard-deletes events', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $event = forcedEvent();

    $this->actingAs($admin, 'admin')
        ->delete("/admin/events/{$event->id}")
        ->assertSessionHas('error');

    expect(Event::find($event->id))->not->toBeNull(); // السجل المالي لا يُمحى
});

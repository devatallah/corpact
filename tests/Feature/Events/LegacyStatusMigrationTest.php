<?php

use App\Enums\EventStatus;
use App\Models\Event;
use App\Services\Events\EventStateMachine;
use App\Services\Events\LegacyStatusMap;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

// خريطة ترحيل A7 الموثقة (تستخدمها migration 2026_08_20_700001):
// كل حالة قديمة إلى مقابلها في آلة §9، و`full` تموت لصالح عَلَم is_full.

it('maps every legacy status to its documented section-9 state', function () {
    expect(LegacyStatusMap::MAP)->toBe([
        'open' => 'open',
        'full' => 'open', // + is_full=1 في الـ migration — الامتلاء عَلَم لا حالة
        'waiting_business' => 'pending_provider',
        'waiting_partner' => 'pending_provider',
        'alternative_proposed' => 'provider_alternative',
        'confirmed' => 'confirmed',
        'in_progress' => 'in_progress',
        'rejected' => 'cancelled_provider',
        'completed' => 'completed',
        'cancelled' => 'cancelled_company', // إلا «مهلة الدفع» ← cancelled_payment_failed
    ]);
});

it('maps only onto valid section-9 states, and no legacy-only value survives in the enum', function () {
    $valid = EventStatus::values();

    foreach (LegacyStatusMap::MAP as $to) {
        expect($valid)->toContain($to);
    }

    foreach (['full', 'waiting_business', 'waiting_partner', 'alternative_proposed', 'cancelled'] as $dead) {
        expect($valid)->not->toContain($dead);
    }
});

it('covers all sixteen states in the machine transition table', function () {
    expect(array_keys(EventStateMachine::TRANSITIONS))->toEqualCanonicalizing(EventStatus::values());
});

it('the events table CHECK no longer accepts the dead full state', function () {
    $event = Event::factory()->create();

    expect(fn () => DB::table('events')
        ->where('id', $event->id)
        ->update(['status' => 'full']))->toThrow(QueryException::class);
});

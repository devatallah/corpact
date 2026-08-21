<?php

use App\Models\Employee;
use App\Models\Notification;
use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Services\Notifications\PreferenceService;
use App\Support\Notify;

/**
 * H §14 — «المستخدم يستطيع إيقاف الإشعارات الاختيارية فقط، ولا يستطيع إيقاف
 * الإلزامية».
 */
it('lets a user switch off an optional notification, and then sends nothing at all', function () {
    $employee = Employee::factory()->create();

    expect(app(PreferenceService::class)->set($employee, 'event.reminder.24h', false))->toBeTrue();

    $notification = Notify::send('event.reminder.24h', $employee, ['community' => 'البادل']);

    expect($notification)->toBeNull()
        ->and(Notification::query()->where('notifiable_id', $employee->id)->count())->toBe(0);

    $log = NotificationLog::query()->where('template_key', 'event.reminder.24h')->first();

    expect($log->status->value)->toBe('skipped')
        ->and($log->reason)->toBe('opted_out');
});

it('refuses to store a preference for a mandatory template — the service, not just the screen', function () {
    $employee = Employee::factory()->create();

    $stored = app(PreferenceService::class)->set($employee, 'payment.demand', false);

    expect($stored)->toBeFalse()
        ->and(NotificationPreference::query()->where('template_key', 'payment.demand')->exists())->toBeFalse();
});

it('delivers a mandatory notification even when a preference row somehow says otherwise', function () {
    $employee = Employee::factory()->create();

    // صف مكتوب مباشرة في القاعدة (تجاوز الخدمة) — يجب ألا يوقف الإلزامي.
    NotificationPreference::query()->create([
        'notifiable_type' => $employee->getMorphClass(),
        'notifiable_id' => $employee->id,
        'template_key' => 'payment.demand',
        'enabled' => false,
    ]);

    $notification = Notify::send('payment.demand', $employee, [
        'community' => 'البادل', 'amount' => '75.00', 'deadline' => '21:00', 'url' => 'https://x.test/pay',
    ]);

    expect($notification)->not->toBeNull();
});

it('only offers optional templates in the profile preference list', function () {
    $employee = Employee::factory()->create();

    $editable = app(PreferenceService::class)->editable($employee);

    expect($editable)->not->toBeEmpty();

    foreach ($editable as $row) {
        expect($row['enabled'])->toBeBool();
    }

    $keys = $editable->pluck('key');

    expect($keys)->toContain('event.reminder.24h')
        ->and($keys)->not->toContain('payment.demand')
        ->and($keys)->not->toContain('auth.otp');
});

it('saves preferences from the employee profile and silently ignores mandatory keys sent by hand', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->put('/employee/profile/notification-preferences', [
            'preferences' => [
                'event.reminder.24h' => false,
                'event.reminder.2h' => true,
                'payment.demand' => false,   // محاولة إيقاف إلزامي
            ],
        ])
        ->assertSessionHas('success');

    expect(NotificationPreference::query()->where('template_key', 'event.reminder.24h')->first()->enabled)->toBeFalse()
        ->and(NotificationPreference::query()->where('template_key', 'event.reminder.2h')->first()->enabled)->toBeTrue()
        ->and(NotificationPreference::query()->where('template_key', 'payment.demand')->exists())->toBeFalse();
});

it('keeps every user opted in until they say otherwise', function () {
    $employee = Employee::factory()->create();

    expect(app(PreferenceService::class)->allows($employee, 'event.reminder.24h'))->toBeTrue()
        ->and(Notify::send('event.reminder.24h', $employee, ['community' => 'البادل']))->not->toBeNull();
});

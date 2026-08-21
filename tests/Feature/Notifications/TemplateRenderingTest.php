<?php

use App\Models\Employee;
use App\Models\Notification;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Services\Notifications\TemplateRenderer;
use App\Support\Notify;

/**
 * H §14 — «القوالب يديرها أدمن تيمات فقط، ولا تُكتب نصوص الرسائل داخل الكود».
 */
it('renders the managed template with its variables', function () {
    $rendered = app(TemplateRenderer::class)->render('event.reminder.2h', [
        'community' => 'مجتمع البادل',
        'time' => '20:00',
        'location' => 'ملعب 3',
    ]);

    expect($rendered->body)->toContain('مجتمع البادل')
        ->and($rendered->body)->toContain('20:00')
        ->and($rendered->body)->toContain('ملعب 3')
        ->and($rendered->body)->not->toContain('{community}')
        ->and($rendered->hasTemplate())->toBeTrue();
});

it('defaults to Arabic even though APP_LOCALE is en, and renders English only on request', function () {
    config(['app.locale' => 'en']);

    $renderer = app(TemplateRenderer::class);

    expect($renderer->render('auth.otp', ['code' => '123456'])->locale)->toBe('ar')
        ->and($renderer->render('auth.otp', ['code' => '123456'])->body)->toContain('رمز دخولك')
        ->and($renderer->render('auth.otp', ['code' => '123456'], 'en')->body)->toContain('login code');
});

it('leaves an unsupplied variable literal and reports it as missing rather than hiding the gap', function () {
    $rendered = app(TemplateRenderer::class)->render('event.reminder.2h', ['community' => 'البادل']);

    expect($rendered->body)->toContain('{time}')
        ->and($rendered->missingVariables)->toContain('time')
        ->and($rendered->missingVariables)->toContain('location');
});

it('falls back to a generic body when the template key does not exist — never throws, never drops the notification', function () {
    $employee = Employee::factory()->create();

    $notification = Notify::send('does.not.exist', $employee, ['event_id' => 7]);

    expect($notification)->not->toBeNull()
        ->and($notification->body)->toContain('7');

    $log = NotificationLog::query()->where('template_key', 'does.not.exist')->first();

    expect($log)->not->toBeNull()
        ->and($log->reason)->toBe('template_missing');
});

it('treats a deactivated template as missing rather than sending an empty message', function () {
    $template = NotificationTemplate::query()->where('key', 'community.poll')->first();
    $template->forceFill(['active' => false])->save();

    $employee = Employee::factory()->create();

    Notify::send('community.poll', $employee, ['community' => 'البادل', 'question' => 'متى نلعب؟']);

    $log = NotificationLog::query()->where('template_key', 'community.poll')->latest('id')->first();

    expect($log->reason)->toBe('template_missing');
});

it('stamps the in-app row with the template key and the template-owned type', function () {
    $employee = Employee::factory()->create();

    Notify::send('community.member.banned', $employee, ['community' => 'البادل', 'reason' => 'مخالفة']);

    $notification = Notification::query()->where('notifiable_id', $employee->id)->latest('created_at')->first();

    expect($notification->template_key)->toBe('community.member.banned')
        ->and($notification->type)->toBe('community_banned')
        ->and($notification->body)->toContain('مخالفة');
});

it('never lets a call site hardcode text: every seeded template carries a body and a class', function () {
    $templates = NotificationTemplate::query()->get();

    expect($templates)->not->toBeEmpty();

    foreach ($templates as $template) {
        expect($template->body_ar)->not->toBe('')
            ->and($template->title_ar)->not->toBe('')
            ->and(in_array($template->class->value, ['mandatory', 'optional'], true))->toBeTrue();
    }
});

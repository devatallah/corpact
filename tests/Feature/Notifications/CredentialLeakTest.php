<?php

use App\Enums\DeliveryStatus;
use App\Enums\Role;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Invitation;
use App\Models\NotificationLog;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Services\Company\InvitationService;
use App\Support\Messaging\SecretLink;
use Illuminate\Support\Facades\DB;
use Tests\Support\FallbackFakeChannel;
use Tests\Support\PrimaryFakeChannel;

/*
 * H §14 — كل رسالة تُسجَّل بمتحوّلاتها ونصها المرسوم، وسجل الإشعارات مفتوح
 * لوكيل الدعم (G). لذلك يمتد الاستثناء الذي يطبّقه `OtpService` على الرموز
 * إلى **كل ما يصلح وحده لفتح باب**: رابط الدعوة يُخزَّن إشارةً لا نصاً،
 * ويُركَّب لحظة التسليم فقط.
 *
 * وفي المقابل: النص المخزَّن يبقى كاملاً لأن `MessageDispatcher::clone()`
 * يعيد قراءته عند التصعيد واتساب ← SMS — تفريغه كان سيرسل رسائل فارغة بصمت.
 */

function leakTestChain(): array
{
    $primary = new PrimaryFakeChannel;
    $fallback = new FallbackFakeChannel;

    app()->instance(PrimaryFakeChannel::class, $primary);
    app()->instance(FallbackFakeChannel::class, $fallback);

    config([
        'messaging.channels.primary' => PrimaryFakeChannel::class,
        'messaging.channels.fallback' => FallbackFakeChannel::class,
        'messaging.chain' => ['primary', 'fallback'],
    ]);

    return [$primary, $fallback];
}

function supportAgent(): User
{
    $agent = User::factory()->create();
    $agent->assignRole(Role::SupportAgent);

    return $agent;
}

test('an invitation log row holds no usable token while the delivered message still carries the link', function () {
    $messages = fakeMessages();
    $company = Company::factory()->create();

    $invitation = app(InvitationService::class)->invite($company, [
        'email' => 'invitee@corp.example',
        'name' => 'مدعو',
        'phone' => '0553000101',
    ]);

    $log = NotificationLog::query()->where('template_key', 'invite.employee')->latest('id')->firstOrFail();

    // لا الرمز في المتحوّلات، ولا في النص المرسوم، ولا في الصف الخام.
    $raw = DB::table('notification_logs')->where('id', $log->id)->first();

    expect(json_encode($log->variables, JSON_UNESCAPED_UNICODE))->not->toContain($invitation->token)
        ->and($log->rendered_body)->not->toContain($invitation->token)
        ->and($raw->variables.$raw->rendered_body)->not->toContain($invitation->token)
        // …والنص لم يُفرَّغ: سلسلة القنوات تعيد قراءته عند التصعيد.
        ->and($log->rendered_body)->toContain($company->name)
        ->and($log->rendered_body)->toContain(SecretLink::ref(SecretLink::INVITATION, $invitation->id));

    // الرسالة المسلَّمة فعلاً تحمل الرابط الحقيقي.
    expect($messages->sent)->toHaveCount(1)
        ->and($messages->sent[0]['message'])->toContain($invitation->token)
        ->and($messages->sent[0]['message'])->toContain('/invite/');
});

test('the delivery log screen hands a support agent no usable link — not even from a historical row', function () {
    fakeMessages();
    $company = Company::factory()->create();

    $invitation = app(InvitationService::class)->invite($company, [
        'email' => 'invitee@corp.example',
        'phone' => '0553000102',
    ]);

    // صف كُتب قبل الآلية: رابط صالح نصاً في المتحوّلات وفي النص المرسوم.
    $legacyUrl = route('invitation.show', 'LEGACYTOKEN0000000000000000000000000000000000');

    NotificationLog::query()->create([
        'template_key' => 'invite.employee',
        'recipient_phone' => '966553000103',
        'channel' => 'fake',
        'status' => DeliveryStatus::Delivered,
        'attempt' => 1,
        'variables' => ['company' => 'شركة', 'days' => 7, 'url' => $legacyUrl],
        'rendered_body' => "دعوة قديمة عبر الرابط: {$legacyUrl}",
        'locale' => 'ar',
        'purpose' => 'invitation',
        'queued_at' => now(),
    ]);

    $response = $this->actingAs(supportAgent(), 'admin')
        ->get('/admin/notification-logs')
        ->assertOk();

    $response->assertDontSee($invitation->token)
        ->assertDontSee('LEGACYTOKEN0000000000000000000000000000000000')
        ->assertDontSee($legacyUrl);

    // والبحث بجزء من الرابط لم يعد طريقاً لاصطياد الصف الذي يحمله.
    $this->actingAs(supportAgent(), 'admin')
        ->get('/admin/notification-logs?search=LEGACYTOKEN')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('logs.data', 0));
});

test('the WhatsApp → SMS escalation still sends the full body with a working link', function () {
    [$primary, $fallback] = leakTestChain();
    $company = Company::factory()->create();

    // القناة الأولى تفشل نهائياً ⇒ تصعيد فوري إلى البديلة.
    $primary->configured = false;

    $invitation = app(InvitationService::class)->invite($company, [
        'email' => 'escalated@corp.example',
        'phone' => '0553000104',
    ]);

    expect($primary->sent)->toBeEmpty()
        ->and($fallback->sent)->toHaveCount(1);

    $body = $fallback->sent[0]['message'];

    expect($body)->not->toBeEmpty()
        ->and($body)->toContain($company->name)
        ->and($body)->toContain($invitation->token)
        ->and($body)->not->toContain('[[link:');

    // السطر المُستنسخ للقناة البديلة حافظ على النص كاملاً (بلا اعتماد).
    $clone = NotificationLog::query()->where('channel', 'fallback')->latest('id')->firstOrFail();

    expect($clone->rendered_body)->not->toBeEmpty()
        ->and($clone->rendered_body)->not->toContain($invitation->token);
});

test('a retry on the same channel also re-renders the link instead of replaying a stored one', function () {
    [$primary] = leakTestChain();
    $company = Company::factory()->create();

    $primary->failNext = 1;

    $invitation = app(InvitationService::class)->invite($company, [
        'email' => 'retried@corp.example',
        'phone' => '0553000105',
    ]);

    expect($primary->sent)->toHaveCount(1)
        ->and($primary->sent[0]['message'])->toContain($invitation->token);

    $attempts = NotificationLog::query()->where('channel', 'primary')->orderBy('attempt')->get();

    expect($attempts)->toHaveCount(2)
        ->and($attempts->last()->rendered_body)->not->toContain($invitation->token)
        ->and($attempts->last()->rendered_body)->not->toBeEmpty();
});

test('the invitation link alone opens no session — the phone must be proven first', function () {
    $otp = fakeOtp();
    $company = Company::factory()->create();

    $invitation = Invitation::factory()->create([
        'company_id' => $company->id,
        'email' => 'bearer@corp.example',
        'phone' => '966553000106',
        'expires_at' => now()->addDays(7),
    ]);

    // من يحمل الرابط يصل إلى نموذج، لا إلى جلسة.
    $this->get(route('invitation.show', $invitation->token))->assertOk();

    $this->post(route('invitation.accept', $invitation->token), ['name' => 'حامل الرابط'])
        ->assertRedirect(route('invitation.show', $invitation->token));

    $this->assertGuest('employee');
    expect(Employee::withoutGlobalScopes()->where('email', 'bearer@corp.example')->exists())->toBeFalse()
        ->and($invitation->fresh()->status)->toBe('pending');

    // رمز خاطئ لا يُنشئ شيئاً.
    $this->post(route('invitation.verify', $invitation->token), ['code' => '000000'])
        ->assertSessionHasErrors('code');

    $this->assertGuest('employee');
    expect(Employee::withoutGlobalScopes()->where('email', 'bearer@corp.example')->exists())->toBeFalse();

    // الرمز الصحيح — على رقم الدعوة — هو وحده ما يفتح الحساب.
    expect($otp->sent[0]['phone'])->toBe('966553000106');

    $this->post(route('invitation.verify', $invitation->token), ['code' => $otp->lastCode()])
        ->assertRedirect(route('employee.home'));

    $this->assertAuthenticated('employee');
});

test('a payment demand log stores no signed payment url while the message still carries one', function () {
    $messages = fakeMessages();

    $world = a10Event(['close' => true, 'joiners' => 2]);
    $intent = PaymentIntent::query()->where('event_id', $world['event']->id)->first();

    expect($intent)->not->toBeNull();

    $log = NotificationLog::query()
        ->where('template_key', 'payment.demand')
        ->whereNotNull('recipient_phone')
        ->latest('id')
        ->firstOrFail();

    expect($log->rendered_body)->not->toBeEmpty()
        ->and($log->rendered_body)->not->toContain('signature=')
        ->and(json_encode($log->variables, JSON_UNESCAPED_UNICODE))->not->toContain('signature=');

    $demand = collect($messages->sent)->first(fn (array $m) => $m['purpose'] === 'payment_demand');

    expect($demand)->not->toBeNull()
        ->and($demand['message'])->toContain('signature=');
});

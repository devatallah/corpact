<?php

use App\Enums\Role;
use App\Enums\WalletTransactionType;
use App\Jobs\CompleteEvent;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Partner;
use App\Models\PaymentIntent;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Attendance\AttendanceService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Messaging\Channels\MessageChannel;
use App\Services\Otp\Channels\OtpChannel;
use App\Services\Payments\FundingService;
use App\Services\Payments\Gateway\GatewayWebhookEvent;
use App\Services\Payments\Gateway\LocalTestGateway;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\ReportPeriod;
use App\Services\Wallet\LedgerService;
use App\Support\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Tests\Support\FakeMessageChannel;
use Tests\Support\FakeOtpChannel;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(function () {
        $this->withoutVite();
    })
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Bind a fake OTP delivery channel and return it, so tests can read the
 * codes the application "sent".
 */
function fakeOtp(): FakeOtpChannel
{
    $channel = new FakeOtpChannel;

    app()->instance(OtpChannel::class, $channel);

    return $channel;
}

/**
 * Bind a fake outbound-message channel and return it, so tests can read what
 * the application "sent".
 *
 * A14: the fake is registered twice — as the legacy `MessageChannel` binding
 * (A4's direct senders) and as the sole channel of the delivery chain, so a
 * test sees the same object whichever path a message takes.
 */
function fakeMessages(): FakeMessageChannel
{
    $channel = new FakeMessageChannel;

    app()->instance(MessageChannel::class, $channel);
    app()->instance(FakeMessageChannel::class, $channel);

    config([
        'messaging.channels.fake' => FakeMessageChannel::class,
        'messaging.chain' => ['fake'],
    ]);

    return $channel;
}

/**
 * A10 — فعالية تمر بخط السير الحقيقي كاملاً حتى عتبة التحصيل (H §12.2/§12.3):
 * إنشاء بمبالغ هللات + سقف ملزم، تمويل محفظة المجتمع، انضمام أعضاء حقيقيين
 * عبر ParticipationService (بلوغ الحد يرسل طلب المزوّد فيُقبل)، ثم — إن طُلب —
 * إغلاق التسجيل عبر app:close-registration ليبدأ التحصيل.
 *
 * @param  array{total?: float, subsidy?: float, subsidy_type?: string, min?: int, capacity?: int, joiners?: int, wallet?: int, close?: bool, accept_provider?: bool}  $options
 * @return array{event: Event, community: Community, company: Company, employees: array<int, Employee>}
 */
function a10Event(array $options = []): array
{
    $total = $options['total'] ?? 300.0;
    $subsidy = $options['subsidy'] ?? 0.0;
    $min = $options['min'] ?? 2;
    $capacity = $options['capacity'] ?? 8;
    $joiners = $options['joiners'] ?? $min;
    $walletHalalas = $options['wallet'] ?? 0;

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => $capacity,
        'min_participants' => $min,
        'participants_count' => 0,
        'status' => 'open',
        // يومان لا يوم واحد: إغلاق التسجيل يُشتق من `registration_close_hours`
        // (24 ساعة افتراضياً)، فـ«غداً 20:00» يجعل التسجيل مُغلقاً أصلاً كلما
        // شُغّلت الحزمة بعد الساعة 20:00 — هشاشة زمنية لا علاقة لها بالمختبَر.
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '20:00',
        'total_amount' => $total,
        'budget_deducted_at' => null,
    ]);

    // الدعم: fixed بمبلغ ريالات يُحوَّل هللات، أو percentage بنسبة 0–100.
    if (($options['subsidy_type'] ?? 'fixed') === 'percentage') {
        $event->forceFill(['subsidy_type' => 'percentage', 'subsidy_value' => (int) $subsidy])->save();
    } else {
        $event->forceFill(['subsidy_type' => 'fixed', 'subsidy_value' => Money::toHalalas($subsidy)])->save();
    }

    // السقف الملزم يُعلن كما في الإنشاء الحقيقي (H §12.2).
    app(FundingService::class)->announceCeiling($event->fresh());

    if ($walletHalalas > 0) {
        app(LedgerService::class)->credit(
            Wallet::subFor($community),
            WalletTransactionType::TopUp,
            $walletHalalas,
            'a10:fund:'.$community->id,
        );
    }

    $participation = app(ParticipationService::class);
    $employees = [];

    for ($i = 0; $i < $joiners; $i++) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);
        $participation->join($event->fresh(), $employee);
        $employees[] = $employee;
    }

    $event = $event->fresh();

    if (($options['accept_provider'] ?? true) && $event->status === 'pending_provider') {
        app(EventStateMachine::class)->providerAccepted($event);
        $event = $event->fresh();
    }

    if ($options['close'] ?? false) {
        $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();
        test()->artisan('app:close-registration')->assertSuccessful();
        $event = $event->fresh();
    }

    return [
        'event' => $event,
        'community' => $community,
        'company' => $company,
        'employees' => $employees,
    ];
}

/**
 * A10 — ويبهوك نجاح دفع موقَّع كما يرسله المشغّل التجريبي.
 *
 * @return array{payload: string, signature: string}
 */
function a10SignedWebhook(PaymentIntent $intent, ?string $reference = null, ?string $idempotencyKey = null, ?string $type = null): array
{
    $reference ??= $intent->gateway_reference ?? 'local_test_'.$intent->id;

    $payload = json_encode([
        'type' => $type ?? GatewayWebhookEvent::TYPE_PAYMENT_SUCCEEDED,
        'reference' => $reference,
        'payment_intent_id' => $intent->id,
        'amount_halalas' => (int) $intent->amount_halalas,
        'idempotency_key' => $idempotencyKey ?? 'local-webhook:'.$reference.':success',
    ], JSON_UNESCAPED_UNICODE);

    return [
        'payload' => (string) $payload,
        'signature' => app(LocalTestGateway::class)->sign((string) $payload),
    ];
}

/**
 * A12 — فعالية اكتملت بمشاركين مسجَّلين حاضرين تلقائياً (H §13)، مع قائد
 * مجتمع يحمل صلاحيات نافذة الحضور والنتائج.
 *
 * @return array{event: Event, community: Community, company: Company, employees: array<int, Employee>, leader: Employee, leaderUser: User}
 */
function a12CompletedEvent(int $participants = 2, ?Carbon $completedAt = null, ?Company $company = null): array
{
    $company ??= Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'status' => 'completed',
        'event_date' => now()->subDay()->toDateString(),
        'capacity' => 10,
        'min_participants' => 1,
    ]);

    $completedAt ??= now()->subHours(2);

    $event->forceFill([
        'completed_at' => $completedAt,
        'starts_at' => $completedAt->copy()->subHours(2),
        'ends_at' => $completedAt,
        'participants_count' => $participants,
    ])->save();

    $employees = [];

    for ($i = 0; $i < $participants; $i++) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()->subMonth()]);

        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => 'reserved',
            'payment_status' => 'paid',
            'attendance_status' => 'attended',
            'joined_at' => now()->subMonth(),
        ]);

        $employees[] = $employee;
    }

    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($leader->id, ['status' => 'active', 'joined_at' => now()->subMonth()]);
    $leader = $leader->fresh();
    $leaderUser = $leader->user;
    $leaderUser->assignRole(Role::CommunityLeader, RoleAssignment::SCOPE_COMMUNITY, $community->id, true);

    return [
        'event' => $event->fresh(),
        'community' => $community,
        'company' => $company,
        'employees' => $employees,
        'leader' => $leader,
        'leaderUser' => $leaderUser->fresh(),
    ];
}

/**
 * فعالية إضافية مكتملة في نفس المجتمع بمشاركين محددين.
 *
 * @param  array<int, Employee>  $attendees
 */
function a12ExtraCompletedEvent(Community $community, array $attendees, ?Carbon $completedAt = null): Event
{
    $completedAt ??= now()->subHours(3);

    $event = Event::factory()->create([
        'company_id' => $community->company_id,
        'community_id' => $community->id,
        'status' => 'completed',
        'event_date' => $completedAt->toDateString(),
        'capacity' => 10,
        'min_participants' => 1,
    ]);

    $event->forceFill([
        'completed_at' => $completedAt,
        'starts_at' => $completedAt->copy()->subHours(2),
        'ends_at' => $completedAt,
        'participants_count' => count($attendees),
    ])->save();

    foreach ($attendees as $employee) {
        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => 'reserved',
            'payment_status' => 'paid',
            'attendance_status' => AttendanceService::ATTENDED,
            'joined_at' => now()->subMonth(),
        ]);
    }

    return $event->fresh();
}

/**
 * A11 — فعالية تصل إلى `completed` عبر المسار الحقيقي مع لقطة مالية مجمّدة
 * (H §12.10) وحضور تلقائي، فيُنشئ مستمع الاكتمال بند التسوية وقيدي الدفتر.
 *
 * تُبنى الفعالية في `awaiting_payment` بمبالغها بالهللة، ثم تمر بانتقالات آلة
 * A7 نفسها: collectionComplete (يكتب اللقطة) ← job الاكتمال (يفعّل الحضور
 * التلقائي ويطلق EventCompleted). لا تُكتب أي لقطة يدوياً في الاختبارات.
 *
 * @param  array{total?: float, commission_rate?: float|null, attendees?: int, absent?: int, completed_at?: Carbon|null, company?: Company|null, partner?: Partner|null, community?: Community|null, complete?: bool}  $options
 * @return array{event: Event, company: Company, partner: Partner, community: Community, attendees: array<int, Employee>, absentees: array<int, Employee>}
 */
function a11CompletedEvent(array $options = []): array
{
    $company = $options['company'] ?? Company::factory()->create();
    $community = $options['community'] ?? Community::factory()->create(['company_id' => $company->id]);

    $partner = $options['partner'] ?? Partner::factory()->create([
        'commission_rate' => array_key_exists('commission_rate', $options)
            ? $options['commission_rate']
            : 12.00,
        'bank_status' => 'approved',
    ]);

    $attendeeCount = $options['attendees'] ?? 2;
    $absentCount = $options['absent'] ?? 0;
    $completedAt = $options['completed_at'] ?? Carbon::now()->subHours(2);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'capacity' => max(2, $attendeeCount + $absentCount + 1),
        'min_participants' => 1,
        'status' => 'awaiting_payment',
        'event_date' => $completedAt->copy()->toDateString(),
        'start_time' => '18:00',
        'total_amount' => $options['total'] ?? 300.0,
    ]);

    $attendees = [];
    $absentees = [];

    for ($i = 0; $i < $attendeeCount + $absentCount; $i++) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => Carbon::now()->subMonths(2)]);

        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => 'reserved',
            'payment_status' => 'paid',
            'joined_at' => Carbon::now()->subMonth(),
        ]);

        if ($i < $attendeeCount) {
            $attendees[] = $employee;
        } else {
            $absentees[] = $employee;
        }
    }

    $event->forceFill(['participants_count' => $attendeeCount + $absentCount])->save();

    // الانتقال الحقيقي: هنا تُكتب `event_snapshot` بالنسبة السارية (H §12.10).
    app(EventStateMachine::class)->collectionComplete($event);
    $event = $event->fresh();

    if ($options['complete'] ?? true) {
        (new CompleteEvent($event->id))->handle();
        $event = $event->fresh();

        // الغياب يُسجَّل بعد الحضور التلقائي (نافذة القائد — A12).
        foreach ($absentees as $absentee) {
            EventParticipant::where('event_id', $event->id)
                ->where('employee_id', $absentee->id)
                ->update(['attendance_status' => 'absent']);
        }

        $event->forceFill(['completed_at' => $completedAt])->save();
        $event = $event->fresh();
    }

    return [
        'event' => $event,
        'company' => $company,
        'partner' => $partner,
        'community' => $community,
        'attendees' => $attendees,
        'absentees' => $absentees,
    ];
}

/**
 * A11 — مستخدم أدمن مالي (اعتماد الكشوف وصرفها والفوترة).
 */
function a11FinanceAdmin(string $name = 'الأدمن المالي'): User
{
    $user = User::factory()->create(['name' => $name]);
    $user->assignRole(Role::FinanceAdmin, RoleAssignment::SCOPE_PLATFORM);

    return $user->fresh();
}

/**
 * A13 — فعالية بحالة حضور محددة لكل مشارك، بمرساة زمنية دقيقة.
 *
 * الفِخاخ التي يتفاداها: `Event::factory()` يشتق `starts_at` من
 * `event_date`/`start_time`، و`completed_at` هو ما تقرأه كل مؤشرات القاموس —
 * فيُضبطان معاً صراحةً. الحضور يُكتب على `event_participants` مباشرةً لأن
 * المختبَر هو المعادلة لا مسار التسجيل (يغطيه A12).
 *
 * @param  array<int, string|null>  $attendance  employee_id => attended|absent|null
 * @param  array{status?: string, completed_at?: Carbon|null, starts_at?: Carbon|null, created_at?: Carbon|null, total_halalas?: int}  $options
 */
function a13Event(Community $community, array $attendance, array $options = []): Event
{
    // `?? ` لا يصلح هنا: تمرير `completed_at => null` **مقصود** (فعالية ملغاة)
    // والـ null-coalescing يبتلعه ويعيد القيمة الافتراضية.
    $completedAt = array_key_exists('completed_at', $options)
        ? $options['completed_at']
        : Carbon::now()->subHours(2);
    $startsAt = $options['starts_at'] ?? ($completedAt ?? Carbon::now())->copy()->subHours(2);

    $event = Event::factory()->create([
        'company_id' => $community->company_id,
        'community_id' => $community->id,
        'status' => $options['status'] ?? 'completed',
        'event_date' => $startsAt->toDateString(),
        'start_time' => $startsAt->format('H:i:s'),
        'capacity' => max(2, count($attendance)),
        'min_participants' => 1,
    ]);

    $event->forceFill([
        'starts_at' => $startsAt,
        'ends_at' => $startsAt->copy()->addHours(2),
        'completed_at' => $completedAt,
        'participants_count' => count($attendance),
        'total_amount_halalas' => $options['total_halalas'] ?? 30_000,
    ])->save();

    if (isset($options['created_at'])) {
        Event::withoutGlobalScopes()->whereKey($event->id)->update(['created_at' => $options['created_at']]);
    }

    foreach ($attendance as $employeeId => $status) {
        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employeeId,
            'seat_status' => 'reserved',
            'payment_status' => 'paid',
            'attendance_status' => $status,
            'joined_at' => $startsAt->copy()->subWeek(),
        ]);
    }

    return $event->fresh();
}

/**
 * A13 — نطاق تصدير جاهز لفترة أغسطس 2026 (الفترة المرجعية في اختبارات
 * التقارير). الشركة إلزامية دائماً؛ تمرير مجتمع يضيّق النطاق لتصدير القائد.
 */
function a13Context(Company $company, ExportAudience $audience, ?Community $community = null): ExportContext
{
    return new ExportContext(
        company: $company,
        audience: $audience,
        period: ReportPeriod::month(2026, 8),
        community: $community,
    );
}

/**
 * A15 — H §19: «فحص نوع MIME الفعلي لا الامتداد». `UploadedFile::fake()->create()`
 * produces zero-filled placeholder bytes that sniff as nothing, so a test using
 * it would only pass against a check that trusts the extension. These helpers
 * upload **genuinely valid** bytes, so the security property stays true and
 * tested rather than worked around.
 */
function a15FakePdf(string $name = 'document.pdf', int $padBytes = 512): UploadedFile
{
    $content = "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n";

    return UploadedFile::fake()->createWithContent($name, $content.str_repeat(' ', max(0, $padBytes)));
}

function a15FakePng(string $name = 'logo.png', int $padBytes = 256): UploadedFile
{
    // 8-byte PNG signature + a minimal IHDR chunk header.
    $content = "\x89PNG\r\n\x1a\n".pack('N', 13).'IHDR'.pack('NN', 1, 1)."\x08\x06\x00\x00\x00";

    return UploadedFile::fake()->createWithContent($name, $content.str_repeat("\0", max(0, $padBytes)));
}

function a15FakeJpeg(string $name = 'receipt.jpg', int $padBytes = 256): UploadedFile
{
    $content = "\xFF\xD8\xFF\xE0".pack('n', 16)."JFIF\x00";

    return UploadedFile::fake()->createWithContent($name, $content.str_repeat("\0", max(0, $padBytes)));
}

/** An ELF binary renamed to look like a harmless image — must always be refused. */
function a15FakeExecutable(string $name = 'payload.png'): UploadedFile
{
    return UploadedFile::fake()->createWithContent($name, "\x7FELF\x02\x01\x01\x00".str_repeat("\0", 512));
}

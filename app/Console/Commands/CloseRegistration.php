<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Enums\EventStatus;
use App\Models\Employee;
use App\Models\Event;
use App\Models\JobRun;
use App\Models\Partner;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Events\RescheduleService;
use App\Services\Payments\CollectionService;
use App\Support\Notify;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * إغلاق التسجيل عند registration_closes_at (A7 — H §9/§10/§20، كل 5 دقائق):
 *
 * - booked والعدد ≥ الحد الأدنى ← awaiting_payment (تثبيت العدد) ثم خط
 *   تحصيل A10 (H §12.3): حجز الدعم + تثبيت الحصة النهائية + مطالبات دفع
 *   برابط موقّع بنافذة 120 دقيقة/6 ساعات قبل البدء — confirmed لا تُكتب إلا
 *   باكتمال الدعم وكل الحصص (المسار أ المدعوم كلياً يتأكد فوراً).
 * - open أو booked والعدد < الحد الأدنى (H §8 — A8): **إعادة الجدولة مرة
 *   واحدة** +7 أيام (قابلة للإعداد على القالب) على نفس السجل — إبلاغ مزوّدٍ
 *   قَبِل بالإلغاء فوراً وفك حجزه؛ **فشل المحاولة الثانية** ←
 *   cancelled_min_not_met نهائياً + تنبيه القائد بمراجعة الحد الأدنى.
 *   لا استقطاع مالي على أي طرف في أي من المحاولتين.
 * - كل الحالات الجارية: قائمة الانتظار تُغلق مع التسجيل ويُشعَر من بقي فيها.
 * - pending_provider/provider_alternative تحسمها مهل الرد
 *   (app:expire-provider-deadlines)؛ expired بقيت لفعالية open مرّ موعد بدئها
 *   دون إغلاق تسجيل يعالجها (H §9: «دون إعادة جدولة»).
 *
 * idempotency: JobRun::runOnce بمفتاح (الفعالية + المهمة + وقت الإغلاق) —
 * تغيّر وقت الإغلاق (إعادة جدولة A8) يفتح تشغيلاً جديداً عمداً.
 */
class CloseRegistration extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:close-registration';

    protected $description = 'إغلاق التسجيل وتثبيت العدد وبدء التحصيل (H §20 — كل 5 دقائق)';

    public function __construct(
        private EventStateMachine $machine,
        private CollectionService $collection,
        private ParticipationService $participation,
        private RescheduleService $reschedule,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $processed = 0;
        $failed = 0;

        $due = Event::query()
            ->whereIn('status', EventStatus::joinableValues())
            ->whereNotNull('registration_closes_at')
            ->where('registration_closes_at', '<=', now())
            ->get();

        foreach ($due as $event) {
            try {
                $ran = JobRun::runOnce(
                    job: 'event:close-registration',
                    entityType: 'event',
                    entityId: $event->id,
                    period: $event->registration_closes_at->format('Y-m-d H:i:s'),
                    callback: fn () => $this->closeEvent($event),
                );

                if ($ran) {
                    $processed++;
                }
            } catch (Throwable $e) {
                $failed++;
                Log::error("فشل إغلاق تسجيل الفعالية #{$event->id}.", ['exception' => $e->getMessage()]);
            }
        }

        $this->recordHeartbeat();

        $this->info("أُغلق التسجيل: {$processed} · فشلت: {$failed}");

        return self::SUCCESS;
    }

    private function closeEvent(Event $event): void
    {
        // قائمة الانتظار تُغلق مع التسجيل في كل الحالات (H §10).
        $this->participation->closeWaitlist($event);

        $status = (string) $event->status;

        if (! in_array($status, [EventStatus::Open->value, EventStatus::Booked->value], true)) {
            // pending_provider/provider_alternative تحسمها مهل الرد (A7/A9).
            return;
        }

        $reserved = (int) $event->reservedParticipants()->count();

        if ($reserved >= (int) $event->min_participants) {
            if ($status !== EventStatus::Booked->value) {
                // open بالغة الحد لكن طلب المزوّد لم يُرسل/يُحسم — تُترك لمسار
                // بلوغ الحد ومهل الرد (A7)، لا شأن للإغلاق بها.
                return;
            }

            // تثبيت العدد وبدء التحصيل (H §9 / §12.3).
            $event->forceFill(['participants_count' => $reserved])->save();
            $this->machine->closeRegistration($event);

            // خط تحصيل A10: الدعم الفعلي وحجزه، الحصة النهائية المقفلة،
            // مطالبات الدفع — أو التأكيد الفوري للمسار المدعوم كلياً.
            $this->collection->beginCollection($event);

            return;
        }

        // لم يبلغ الحد الأدنى عند الإغلاق — H §8 (A8): المحاولة الأولى إعادة
        // جدولة على نفس السجل (+7 أيام، إبلاغ المزوّد إن كان قد قبل، صفر أثر
        // مالي)؛ استُنفدت المحاولة ← فشل المحاولة الثانية = الإلغاء النهائي.
        if ($this->reschedule->rescheduleOnce($event)) {
            return;
        }

        $providerNotified = $this->reschedule->cancelActiveProviderRequest(
            $event,
            'لم يبلغ العدد الحد الأدنى عند إغلاق التسجيل — فشلت المحاولة الثانية وأُلغيت الفعالية نهائياً',
        );

        $this->machine->cancelMinNotMet(
            $event,
            "لم يبلغ العدد ({$reserved}) الحد الأدنى ({$event->min_participants}) عند إغلاق التسجيل — فشلت المحاولة الثانية، لا استقطاع على أي طرف",
        );

        $this->notifyMinNotMet($event, $reserved, $providerNotified);
    }

    private function notifyMinNotMet(Event $event, int $reserved, bool $providerNotified = false): void
    {
        // إبلاغ المزوّد فوراً — ما لم يكن قد أُشعر لتوّه عند إلغاء طلبه الفعال.
        if ($event->partner_id !== null && ! $providerNotified) {
            Notify::sendToId(
                'event.min_not_met.partner',
                Partner::class,
                (int) $event->partner_id,
                ['event_id' => $event->id],
                ['data' => ['event_id' => $event->id]],
            );
        }

        // إشعار المشاركين المحجوزين — لا استقطاع على أي طرف.
        foreach ($event->reservedParticipants()->pluck('employees.id') as $employeeId) {
            Notify::sendToId(
                'event.min_not_met.participant',
                Employee::class,
                (int) $employeeId,
                ['event_id' => $event->id],
                ['data' => ['event_id' => $event->id]],
            );
        }

        // تنبيه القائد بمراجعة الحد الأدنى (H §8 بند 3).
        $community = $event->community;
        foreach ($community?->leaderEmployees() ?? [] as $leader) {
            Notify::send(
                'event.min_not_met.leader',
                $leader,
                [
                    'community' => $community->name,
                    'minimum' => $event->min_participants,
                    'reserved' => $reserved,
                ],
                ['data' => ['event_id' => $event->id]],
            );
        }
    }
}

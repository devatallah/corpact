<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Enums\EventStatus;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\JobRun;
use App\Support\Notify;
use Illuminate\Console\Command;

/**
 * تذكيرات الفعالية (H §14 / H §20 — كل ١٥ دقيقة).
 *
 * **مرتان لكل فعالية ولا ثالثة**: تذكير قبل ٢٤ ساعة وتذكير قبل ساعتين، إلى
 * المشاركين المؤكدين (المقاعد `reserved` في فعالية `confirmed`).
 *
 * ضمانة «لا رسالة ثالثة» ليست في التوقيت بل في المفتاح: كل تذكير يمر عبر
 * `JobRun::runOnce` بمفتاح (نوع التذكير + الفعالية + وقت بدئها). تشغيل المهمة
 * مئة مرة لا يرسل أكثر من رسالة واحدة لكل نوع — وإعادة جدولة الفعالية تغيّر
 * `starts_at` فتفتح تذكيراً مشروعاً جديداً للموعد الجديد.
 *
 * التذكيرات **اختيارية** في مصفوفة H §14، فتمر على تفضيلات المستخدم وعلى
 * سياسة عدم الإزعاج (٢٢:٠٠–٠٨:٠٠) — كلاهما يطبَّق داخل `Notify`.
 */
class SendScheduledReminders extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:send-reminders';

    protected $description = 'إرسال تذكيرات الفعاليات — 24 ساعة وساعتان (H §14/§20)';

    /** نوعا التذكير: المفتاح ⇒ [ساعات قبل البدء، قالب الرسالة]. */
    private const REMINDERS = [
        '24h' => [24, 'event.reminder.24h'],
        '2h' => [2, 'event.reminder.2h'],
    ];

    public function handle(): int
    {
        $this->recordHeartbeat();

        $sent = 0;

        foreach (self::REMINDERS as $type => [$hours, $templateKey]) {
            $sent += $this->dispatchWindow($type, $hours, $templateKey);
        }

        $this->info("أُرسل {$sent} تذكيراً.");

        return self::SUCCESS;
    }

    /**
     * فعاليات مؤكدة دخلت نافذة هذا التذكير ولم يُرسل لها بعد.
     */
    private function dispatchWindow(string $type, int $hours, string $templateKey): int
    {
        $now = now();

        $events = Event::query()
            ->withoutGlobalScopes()
            ->where('status', EventStatus::Confirmed->value)
            ->whereNotNull('starts_at')
            ->where('starts_at', '>', $now)
            ->where('starts_at', '<=', $now->copy()->addHours($hours))
            // التذكير الأبكر لا يُرسل بعد دخول نافذة الأقرب: فعالية أُنشئت قبل
            // ساعة من موعدها تأخذ تذكير الساعتين فقط، لا تذكيرين متلاصقين.
            ->when($type === '24h', fn ($q) => $q->where('starts_at', '>', $now->copy()->addHours(2)))
            ->with('community')
            ->get();

        $sent = 0;

        foreach ($events as $event) {
            JobRun::runOnce(
                job: 'event:reminder-'.$type,
                entityType: 'event',
                entityId: (int) $event->id,
                period: $event->startsAt()->format('Y-m-d H:i:s'),
                callback: function () use ($event, $templateKey, &$sent): void {
                    $sent += $this->remind($event, $templateKey);
                },
            );
        }

        return $sent;
    }

    /**
     * @return int عدد المستلمين
     */
    private function remind(Event $event, string $templateKey): int
    {
        $employeeIds = EventParticipant::query()
            ->where('event_id', $event->id)
            ->where('seat_status', 'reserved')
            ->pluck('employee_id');

        if ($employeeIds->isEmpty()) {
            return 0;
        }

        $localStart = $event->startsAt()->timezone('Asia/Riyadh');

        return Notify::sendToIds(
            $templateKey,
            Employee::class,
            $employeeIds,
            [
                'community' => $event->community?->name,
                'date' => $localStart->format('Y-m-d H:i'),
                'time' => $localStart->format('H:i'),
                'location' => $this->location($event),
            ],
            ['data' => ['event_id' => $event->id]],
        );
    }

    /**
     * موقع الفعالية كما يُعرض للمشارك — أول وحدة/ملعب محجوز، وإلا اسم المزوّد.
     */
    private function location(Event $event): string
    {
        $event->loadMissing(['venues', 'partner']);

        $venue = $event->venues->first();

        return (string) ($venue?->name ?? $event->partner?->name ?? 'الموقع المتفق عليه');
    }
}

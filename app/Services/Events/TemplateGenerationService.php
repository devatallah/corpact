<?php

namespace App\Services\Events;

use App\Enums\EventStatus;
use App\Models\Community;
use App\Models\Event;
use App\Models\EventTemplate;
use App\Models\JobRun;
use App\Services\ActivityLogService;
use App\Services\Employee\EventCreationService;
use App\Services\Payments\FundingService;
use App\Services\Provider\AvailabilityService;
use App\Support\Money;
use App\Support\Notify;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * توليد الفعاليات من قوالب التكرار (H §8) — يشغّله app:generate-template-events
 * يومياً 02:00 (وإنشاء القالب يشغّله فوراً لقالبه):
 *
 * - الفعالية تُولَّد قبل 14 يوماً من موعدها، عبر EventStateMachine::initialize
 *   (سطر التاريخ الافتتاحي — شرط A7).
 * - idempotent لكل (قالب + تاريخ نمطي) عبر JobRun::runOnce + فحص وجود مباشر
 *   (يشمل الفعاليات المرحّلة المربوطة بالقالب).
 * - يتخطى: القوالب الموقوفة (الإيقاف يوقف التوليد المستقبلي فقط)، المجتمعات
 *   الخاملة (قرار A5)، والوحدات غير المتاحة عبر حارس توفر A9 نفسه —
 *   «لا تُنشأ فعالية بمزوّد غير متاح» — مع إشعار القادة بسبب التخطي.
 * - أيام الحظر: إسقاط أو إزاحة أسبوع حسب إعداد القالب (TemplateScheduleService)
 *   مع إشعار القادة بما أُسقط/أُزيح.
 * - قرار التخطي (حظر أو توفر) يُتخذ مرة واحدة للتاريخ النمطي ولا يُعاد فتحه —
 *   القائد يستطيع الإنشاء يدوياً إن تغيّر الوضع.
 */
class TemplateGenerationService
{
    public function __construct(
        private TemplateScheduleService $schedule,
        private AvailabilityService $availability,
        private EventStateMachine $machine,
        private EventCreationService $creation,
    ) {}

    /**
     * توليد كل المستحق لكل القوالب النشطة.
     *
     * @return array{generated: int, skipped: int, failed: int}
     */
    public function generateAll(?CarbonInterface $today = null): array
    {
        $totals = ['generated' => 0, 'skipped' => 0, 'failed' => 0];

        EventTemplate::query()
            ->where('status', EventTemplate::STATUS_ACTIVE)
            ->with(['community', 'activityUnit.branch', 'creator'])
            ->orderBy('id')
            ->chunkById(50, function ($templates) use (&$totals, $today) {
                foreach ($templates as $template) {
                    $result = $this->generateForTemplate($template, $today);
                    $totals['generated'] += $result['generated'];
                    $totals['skipped'] += $result['skipped'];
                    $totals['failed'] += $result['failed'];
                }
            });

        return $totals;
    }

    /**
     * توليد المستحق لقالب واحد.
     *
     * @return array{generated: int, skipped: int, failed: int}
     */
    public function generateForTemplate(EventTemplate $template, ?CarbonInterface $today = null): array
    {
        $result = ['generated' => 0, 'skipped' => 0, 'failed' => 0];

        if (! $template->isActive()) {
            return $result;
        }

        $community = $template->community;

        // A5: المجتمع الخامل لا تُولَّد له فعاليات حتى يُعيَّن قائد.
        if ($community === null || $community->status === Community::STATUS_DORMANT) {
            Log::info("توليد القوالب: تخطي القالب #{$template->id} — المجتمع خامل أو محذوف.");

            return $result;
        }

        foreach ($this->schedule->dueOccurrences($template, $today) as $occurrence) {
            try {
                $ran = JobRun::runOnce(
                    job: 'template:generate-event',
                    entityType: 'event_template',
                    entityId: $template->id,
                    period: $occurrence['pattern_date']->toDateString(),
                    callback: function () use ($template, $occurrence, &$result): void {
                        if ($occurrence['action'] === TemplateScheduleService::ACTION_SKIP_BLACKOUT) {
                            $this->recordBlackoutSkip($template, $occurrence);
                            $result['skipped']++;

                            return;
                        }

                        if ($this->generateEvent($template, $occurrence)) {
                            $result['generated']++;
                        } else {
                            $result['skipped']++;
                        }
                    },
                );

                if (! $ran) {
                    continue;
                }
            } catch (\Throwable $e) {
                $result['failed']++;
                Log::error("فشل توليد فعالية من القالب #{$template->id} لتاريخ {$occurrence['pattern_date']->toDateString()}.", [
                    'exception' => $e->getMessage(),
                ]);
            }
        }

        return $result;
    }

    /**
     * توليد فعالية واحدة لموعد فعلي — يعيد false عند تخطيها (وحدة غير متاحة
     * أو فعالية قائمة لنفس القالب والتاريخ).
     */
    private function generateEvent(EventTemplate $template, array $occurrence): bool
    {
        /** @var Carbon $effective */
        $effective = $occurrence['effective_date'];
        $startsAt = Carbon::parse($effective->toDateString().' '.substr((string) $template->start_time, 0, 5));

        // فحص الوجود: فعالية قائمة لنفس القالب في نفس اليوم (مولّدة سابقاً أو
        // مرحّلة من السلسلة القديمة) — لا ازدواج.
        $exists = Event::withoutGlobalScopes()
            ->where('template_id', $template->id)
            ->whereDate('event_date', $effective->toDateString())
            ->exists();

        if ($exists) {
            return false;
        }

        // A11 — H §12.8: شركة محجوبة لتأخر السداد لا يُولَّد لها شيء جديد —
        // التوليد إنشاءٌ كسائر الإنشاء. الفعاليات القائمة لا تُمس.
        if ($template->company?->eventCreationBlocked()) {
            return false;
        }

        // حارس توفر A9 نفسه: لا تُولَّد فعالية على وحدة/فتحة غير متاحة.
        $unit = $template->activityUnit;

        if ($unit !== null && ! $this->availability->isAvailable($unit, $startsAt, (int) $template->duration_minutes)) {
            $this->recordUnavailableSkip($template, $effective);

            return false;
        }

        $event = DB::transaction(function () use ($template, $startsAt, $effective, $occurrence) {
            $creator = $template->creator;

            $event = Event::create([
                'template_id' => $template->id,
                'community_id' => $template->community_id,
                'company_id' => $template->company_id,
                'partner_id' => $template->partner_id,
                'category_id' => $template->category_id,
                'venue_pricing_id' => $template->venue_pricing_id,
                'created_by' => $template->created_by,
                'creator_role' => $creator !== null
                    ? $this->creation->creatorRoleFor($creator, $template->community)
                    : null,
                'title' => $template->title,
                'event_date' => $effective->toDateString(),
                'start_time' => $startsAt->format('H:i'),
                'duration_minutes' => (int) $template->duration_minutes,
                'venues_count' => (int) $template->venues_count,
                'capacity' => (int) $template->capacity,
                'min_participants' => min((int) $template->min_participants, (int) $template->capacity),
                'participants_count' => 0,
                // A10 — H §12.2: مال القالب هللات صحيحة، والسقف الملزم يُشتق
                // لحظة التوليد = (الإجمالي − الدعم المخطط) ÷ الحد الأدنى.
                'total_amount_halalas' => (int) $template->total_amount_halalas,
                'subsidy_type' => (string) $template->subsidy_type,
                'subsidy_value' => (int) $template->subsidy_value,
                'notes' => $template->notes,
                'status' => EventStatus::Open->value,
            ]);

            $vat = Money::decomposeVat((int) $template->total_amount_halalas);
            $event->forceFill([
                'base_amount_halalas' => $vat['base'],
                'vat_amount_halalas' => $vat['vat'],
            ])->save();
            app(FundingService::class)->announceCeiling($event);

            // شرط A7: كل فعالية مولّدة تمر عبر initialize (سطر التاريخ الافتتاحي).
            $this->machine->initialize($event, $template->creator, $occurrence['shifted']
                ? "توليد تلقائي من قالب التكرار #{$template->id} — أُزيح الموعد أسبوعاً لوقوعه في «{$occurrence['blackout']?->name}»"
                : "توليد تلقائي من قالب التكرار #{$template->id}");

            $venueIds = array_values(array_filter(array_unique([
                ...(array) ($template->venue_ids ?? []),
                $template->activityUnit?->venue_id,
            ])));

            if ($venueIds !== []) {
                $event->venues()->attach($venueIds);
            }

            return $event;
        });

        ActivityLogService::log(
            $template->company_id,
            $event,
            'template_event_generated',
            "وُلّدت الفعالية #{$event->id} تلقائياً من القالب #{$template->id} لموعد {$effective->toDateString()}",
        );

        $this->notifyMembers($template, $event);

        if ($occurrence['shifted']) {
            $this->notifyLeaders(
                $template,
                'event.template.shifted',
                [
                    'template' => $this->templateLabel($template),
                    'pattern_date' => $occurrence['pattern_date']->toDateString(),
                    'blackout' => $occurrence['blackout']?->name,
                    'date' => $effective->toDateString(),
                ],
                ['event_id' => $event->id],
            );
        }

        return true;
    }

    /**
     * تسجيل إسقاط تاريخ لوقوعه في حظر (إعداد skip) + إشعار القادة.
     */
    private function recordBlackoutSkip(EventTemplate $template, array $occurrence): void
    {
        $date = $occurrence['pattern_date']->toDateString();
        $name = $occurrence['blackout']?->name ?? 'فترة حظر';

        ActivityLogService::log(
            $template->company_id,
            $template,
            'template_occurrence_skipped',
            "تُخطي توليد فعالية القالب #{$template->id} ليوم {$date} — يقع في «{$name}»",
        );

        $this->notifyLeaders(
            $template,
            'event.template.skipped.blackout',
            ['template' => $this->templateLabel($template), 'date' => $date, 'blackout' => $name],
        );
    }

    /**
     * تسجيل تخطي التوليد لعدم توفر الوحدة + إشعار القادة بالسبب (شرط A9).
     */
    private function recordUnavailableSkip(EventTemplate $template, Carbon $effective): void
    {
        $date = $effective->toDateString();

        Log::warning("توليد القوالب: وحدة القالب #{$template->id} غير متاحة يوم {$date} — لم تُولَّد الفعالية.");

        ActivityLogService::log(
            $template->company_id,
            $template,
            'template_occurrence_unavailable',
            "لم تُولَّد فعالية القالب #{$template->id} ليوم {$date} — الوحدة/الفتحة غير متاحة لدى المزوّد",
        );

        $this->notifyLeaders(
            $template,
            'event.template.skipped.unavailable',
            ['template' => $this->templateLabel($template), 'date' => $date],
        );
    }

    private function notifyMembers(EventTemplate $template, Event $event): void
    {
        $community = $template->community;
        $community->loadMissing('members');

        foreach ($community->members as $member) {
            Notify::send(
                'event.generated.member',
                $member,
                ['community' => $community->name, 'date' => $event->event_date->format('Y-m-d')],
                ['data' => ['event_id' => $event->id]],
            );
        }
    }

    /**
     * A14: النص يملكه القالب — موضع الاستدعاء يمرر مفتاحاً ومتحوّلات فقط.
     *
     * @param  array<string, scalar|null>  $variables
     * @param  array<string, mixed>  $data
     */
    private function notifyLeaders(EventTemplate $template, string $templateKey, array $variables = [], array $data = []): void
    {
        Notify::sendMany(
            $templateKey,
            $template->community?->leaderEmployees() ?? [],
            $variables,
            ['data' => $data + ['event_template_id' => $template->id]],
        );
    }

    private function templateLabel(EventTemplate $template): string
    {
        return $template->title ?: "قالب #{$template->id}";
    }
}

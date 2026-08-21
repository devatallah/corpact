<?php

namespace App\Services\Provider;

use App\Exceptions\ProviderRequestAlreadyDecided;
use App\Models\ActivityUnit;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\JobRun;
use App\Models\Partner;
use App\Models\ProviderReliabilityLog;
use App\Services\ActivityLogService;
use App\Services\Messaging\Channels\MessageChannel;
use App\Support\Notify;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * قناة قرار المزوّد (H §11):
 *
 * - الطلب يُنشأ حين تحتاج الفعالية مزوّداً، بكمية محددة نهائياً — «للشخص»
 *   يُثبَّت العدد لحظة الإرسال.
 * - الإشعار يحمل رابطاً موقّعاً أحادي الاستخدام صالح 72 ساعة يفتح صفحة
 *   القرار (الدخول مطلوب — الرابط مؤشر لا تجاوز للمصادقة).
 * - القرار في اللوحة حصراً: قبول / رفض / اقتراح وقت بديل. قبول نصي عبر
 *   واتساب لا يُلزم أحداً.
 * - المهلة 12 ساعة أو حتى 6 ساعات قبل الموعد أيهما أقرب.
 * - أول رد يثبّت الحالة؛ أي رد لاحق يُرفض برسالة «تم اتخاذ القرار مسبقاً»
 *   ويُسجَّل.
 * - القبول يحجز الوحدة في تقويم المنصة داخل معاملة بقفل — لا حجز مزدوج.
 */
class ProviderRequestService
{
    public const ALREADY_DECIDED_MESSAGE = 'تم اتخاذ القرار مسبقاً';

    public function __construct(
        private AvailabilityService $availability,
        private ReliabilityService $reliability,
        private ProviderEventTransitions $transitions,
        private MessageChannel $messages,
    ) {}

    /**
     * إنشاء طلب لفعالية تحتاج مزوّداً — idempotent: طلب مفتوح/مقبول قائم
     * يُعاد كما هو.
     */
    public function createForEvent(Event $event): ?EventProviderRequest
    {
        if ($event->partner_id === null) {
            return null;
        }

        $existing = EventProviderRequest::query()
            ->where('event_id', $event->id)
            ->whereIn('status', [
                EventProviderRequest::STATUS_PENDING,
                EventProviderRequest::STATUS_ACCEPTED,
                EventProviderRequest::STATUS_ALTERNATIVE,
            ])
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $partner = Partner::find($event->partner_id);
        if ($partner === null) {
            return null;
        }

        $unit = $this->resolveUnit($event, $partner);
        $sentAt = now();
        $startsAt = $event->startsAt();
        $startTime = substr((string) $event->start_time, 0, 5);

        $plainToken = Str::random(48);

        $request = EventProviderRequest::create([
            'event_id' => $event->id,
            'partner_id' => $partner->id,
            'activity_unit_id' => $unit?->id,
            'requested_date' => $event->event_date->format('Y-m-d'),
            'start_time' => $startTime,
            'duration_minutes' => (int) $event->duration_minutes,
            // كمية محددة نهائياً — لا تتغير بزيادة المشاركين
            'quantity' => max(1, (int) $event->venues_count),
            'pricing_type' => $unit?->pricing_type,
            // للشخص: العدد يُثبَّت لحظة إرسال الطلب (H §12.1)
            'frozen_participants_count' => $unit?->pricing_type === ActivityUnit::PRICING_PER_PERSON
                ? (int) $event->participants_count
                : null,
            'total_amount' => $event->total_amount,
            'status' => EventProviderRequest::STATUS_PENDING,
            'sent_at' => $sentAt,
            'deadline_at' => $this->computeDeadline($sentAt, $startsAt),
            'link_token_hash' => hash('sha256', $plainToken),
            'link_expires_at' => $sentAt->copy()->addHours(72),
        ]);

        $this->notifyProvider($partner, $request, $plainToken);

        ActivityLogService::log(
            $event->company_id,
            $request,
            'provider_request_sent',
            "أُرسل طلب الحجز للمزوّد #{$partner->id} للفعالية #{$event->id}",
            ['deadline_at' => $request->deadline_at->toIso8601String()],
        );

        return $request;
    }

    /**
     * قبول — يحجز الوحدة داخل معاملة بقفل ثم يستدعي انتقال A7 المسمى.
     */
    public function accept(Partner $panelAccount, EventProviderRequest $request): EventProviderRequest
    {
        return $this->runDecision($panelAccount, function () use ($panelAccount, $request) {
            $locked = $this->lockOpenRequest($panelAccount, $request);
            $late = now()->gt($locked->deadline_at);

            // القبول يحجز الوحدة في تقويم المنصة فوراً داخل معاملة بقفل
            if ($locked->activity_unit_id !== null) {
                $unit = ActivityUnit::findOrFail($locked->activity_unit_id);
                $this->availability->book($unit, $locked);
            }

            $provider = $panelAccount->resolvedPartner();
            $this->transitions->providerAccepted($provider, $locked->event);

            $locked->update([
                'status' => EventProviderRequest::STATUS_ACCEPTED,
                'responded_at' => now(),
                'responded_by' => $panelAccount->id,
                'late_response' => $late,
            ]);

            $this->reliability->apply(
                $provider,
                $late
                    ? ProviderReliabilityLog::REASON_LATE_RESPONSE
                    : ProviderReliabilityLog::REASON_ACCEPT_WITHIN_DEADLINE,
                request: $locked,
            );

            return $locked;
        });
    }

    /**
     * رفض بسبب.
     */
    public function reject(Partner $panelAccount, EventProviderRequest $request, string $reason): EventProviderRequest
    {
        return $this->runDecision($panelAccount, function () use ($panelAccount, $request, $reason) {
            $locked = $this->lockOpenRequest($panelAccount, $request);
            $late = now()->gt($locked->deadline_at);

            $provider = $panelAccount->resolvedPartner();
            $this->transitions->providerRejected($provider, $locked->event, $reason);

            $locked->update([
                'status' => EventProviderRequest::STATUS_REJECTED,
                'responded_at' => now(),
                'responded_by' => $panelAccount->id,
                'late_response' => $late,
                'rejection_reason' => $reason,
            ]);

            $this->reliability->apply(
                $provider,
                $late
                    ? ProviderReliabilityLog::REASON_LATE_RESPONSE
                    : ProviderReliabilityLog::REASON_REJECT,
                request: $locked,
            );

            return $locked;
        });
    }

    /**
     * اقتراح وقت بديل — رد يثبّت الحالة (لا تغيّر في المؤشر إلا لو تأخر).
     *
     * @param  array{proposed_date: string, proposed_start_time: string, proposed_venues_count?: int|null, proposed_amount?: float|null, notes?: string|null}  $data
     */
    public function proposeAlternative(Partner $panelAccount, EventProviderRequest $request, array $data): EventProviderRequest
    {
        return $this->runDecision($panelAccount, function () use ($panelAccount, $request, $data) {
            $locked = $this->lockOpenRequest($panelAccount, $request);
            $late = now()->gt($locked->deadline_at);

            $provider = $panelAccount->resolvedPartner();
            $this->transitions->providerProposedAlternative($provider, $locked->event, $data);

            $locked->update([
                'status' => EventProviderRequest::STATUS_ALTERNATIVE,
                'responded_at' => now(),
                'responded_by' => $panelAccount->id,
                'late_response' => $late,
            ]);

            if ($late) {
                $this->reliability->apply($provider, ProviderReliabilityLog::REASON_LATE_RESPONSE, request: $locked);
            }

            return $locked;
        });
    }

    /**
     * إلغاء المزوّد بعد القبول — الأشد أثراً: −15، استرداد كامل، وتُطبَّق
     * سياسة إلغاء المزوّد. تعارضٌ سببه عدم تحديث التوفر يتحمله المزوّد
     * (stale = true → السبب stale_availability_conflict).
     */
    public function cancelAccepted(Partner $panelAccount, EventProviderRequest $request, string $reason, bool $staleAvailability = false): EventProviderRequest
    {
        return DB::transaction(function () use ($panelAccount, $request, $reason, $staleAvailability) {
            /** @var EventProviderRequest $locked */
            $locked = EventProviderRequest::query()->whereKey($request->id)->lockForUpdate()->firstOrFail();

            $this->ensureBelongsToProvider($panelAccount, $locked);

            if ($locked->status !== EventProviderRequest::STATUS_ACCEPTED) {
                throw ValidationException::withMessages([
                    'status' => ['لا يمكن الإلغاء إلا لطلب مقبول.'],
                ]);
            }

            if (now()->gte($locked->slotStartsAt())) {
                throw ValidationException::withMessages([
                    'status' => ['لا يمكن الإلغاء بعد بدء الفعالية.'],
                ]);
            }

            $this->availability->release($locked);

            $provider = $panelAccount->resolvedPartner();
            $this->transitions->providerCancelled($provider, $locked->event, $reason);

            $locked->update([
                'status' => EventProviderRequest::STATUS_CANCELLED,
                'cancellation_reason' => $reason,
            ]);

            $this->reliability->apply(
                $provider,
                $staleAvailability
                    ? ProviderReliabilityLog::REASON_STALE_AVAILABILITY
                    : ProviderReliabilityLog::REASON_CANCEL_AFTER_ACCEPT,
                request: $locked,
                note: $staleAvailability
                    ? 'تعارض ناتج عن عدم تحديث التوفر — يتحمل المزوّد الإلغاء وتُطبَّق سياسة إلغاء المزوّد.'
                    : 'إلغاء بعد القبول — تُطبَّق سياسة إلغاء المزوّد.',
            );

            return $locked;
        });
    }

    /**
     * انتهاء مهلة الرد (لأمر app:expire-provider-deadlines): الطلب يسقط
     * ويصل أثره في مؤشر الموثوقية (−3 رد متأخر).
     *
     * @return int عدد الطلبات المُسقطة
     */
    public function expireOverdue(): int
    {
        $expired = 0;

        $overdueIds = EventProviderRequest::query()
            ->pending()
            ->where('deadline_at', '<', now())
            ->pluck('id');

        foreach ($overdueIds as $id) {
            $ran = JobRun::runOnce(
                job: 'provider-request:expire',
                entityType: 'event_provider_request',
                entityId: $id,
                period: 'once',
                callback: function () use ($id): void {
                    DB::transaction(function () use ($id): void {
                        /** @var EventProviderRequest|null $request */
                        $request = EventProviderRequest::query()->whereKey($id)->lockForUpdate()->first();

                        if ($request === null || ! $request->isPending()) {
                            return;
                        }

                        $request->update([
                            'status' => EventProviderRequest::STATUS_EXPIRED,
                            'late_response' => true,
                        ]);

                        $this->reliability->apply(
                            $request->partner,
                            ProviderReliabilityLog::REASON_LATE_RESPONSE,
                            request: $request,
                            note: 'انتهت مهلة الرد بلا قرار — الطلب سقط.',
                        );

                        $this->notifyExpiry($request);
                    });
                },
            );

            if ($ran) {
                $expired++;
            }
        }

        return $expired;
    }

    /**
     * فتح رابط موقّع: أحادي الاستخدام — أول فتح ناجح (بحساب لوحة مخوَّل)
     * يستهلكه؛ أي فتح لاحق يُرفض، وصفحة القرار تبقى متاحة من اللوحة.
     *
     * @return array{request: EventProviderRequest, state: 'ok'|'used'|'expired_link'}
     */
    public function openSignedLink(string $plainToken, Partner $panelAccount): array
    {
        $request = EventProviderRequest::query()
            ->where('link_token_hash', hash('sha256', $plainToken))
            ->first();

        if ($request === null) {
            throw (new ModelNotFoundException)->setModel(EventProviderRequest::class);
        }

        $this->ensureBelongsToProvider($panelAccount, $request);

        if ($request->link_used_at !== null) {
            return ['request' => $request, 'state' => 'used'];
        }

        if ($request->link_expires_at !== null && now()->gt($request->link_expires_at)) {
            return ['request' => $request, 'state' => 'expired_link'];
        }

        $request->update(['link_used_at' => now()]);

        return ['request' => $request, 'state' => 'ok'];
    }

    /**
     * أول رد يثبّت الحالة: طلب سبق البت فيه يرمي ProviderRequestAlreadyDecided
     * داخل المعاملة، وتحوّله runDecision خارجها إلى «تم اتخاذ القرار مسبقاً»
     * مع تسجيل المحاولة.
     */
    private function lockOpenRequest(Partner $panelAccount, EventProviderRequest $request): EventProviderRequest
    {
        /** @var EventProviderRequest $locked */
        $locked = EventProviderRequest::query()->whereKey($request->id)->lockForUpdate()->firstOrFail();

        $this->ensureBelongsToProvider($panelAccount, $locked);

        if (! $locked->isPending()) {
            throw new ProviderRequestAlreadyDecided($locked);
        }

        return $locked;
    }

    /**
     * تنفيذ قرار داخل معاملة، مع تحويل «سبق البت» إلى رسالة ثابتة وتسجيل
     * المحاولة خارج المعاملة (فلا يبتلعها التراجع).
     *
     * @template TReturn
     *
     * @param  \Closure(): TReturn  $callback
     * @return TReturn
     */
    private function runDecision(Partner $panelAccount, \Closure $callback)
    {
        try {
            return DB::transaction($callback);
        } catch (ProviderRequestAlreadyDecided $e) {
            ActivityLogService::log(
                $e->request->event?->company_id,
                $e->request,
                'provider_request_duplicate_response',
                "رد لاحق مرفوض على الطلب #{$e->request->id} — القرار اتُّخذ مسبقاً (الحالة: {$e->request->status}).",
                ['attempted_by' => $panelAccount->id],
            );

            throw ValidationException::withMessages([
                'status' => [self::ALREADY_DECIDED_MESSAGE],
            ]);
        }
    }

    /**
     * الطلب يخص المزوّد (أو أحد حسابات موظفيه) فقط — أي كيان أجنبي = 404 (H §4).
     */
    private function ensureBelongsToProvider(Partner $panelAccount, EventProviderRequest $request): void
    {
        if ($request->partner_id !== $panelAccount->resolvedPartnerId()) {
            throw (new ModelNotFoundException)
                ->setModel(EventProviderRequest::class, [$request->id]);
        }
    }

    /**
     * المهلة: 12 ساعة من الإرسال أو حتى 6 ساعات قبل الموعد أيهما أقرب.
     * موعد قريب جداً (أقل من 6 ساعات): المهلة حتى موعد البدء نفسه.
     */
    private function computeDeadline(Carbon $sentAt, Carbon $startsAt): Carbon
    {
        $deadline = $sentAt->copy()->addHours(12)->min($startsAt->copy()->subHours(6));

        if ($deadline->lte($sentAt)) {
            $deadline = $sentAt->copy()->addHours(12)->min($startsAt);
        }

        return $deadline;
    }

    /**
     * وحدة النشاط المقابلة للفعالية: وحدة قالب التكرار مباشرة إن وُلّدت من
     * قالب (A8)، وإلا جسر venue_id من ملاعب الفعالية في مرحلة الانتقال.
     */
    private function resolveUnit(Event $event, Partner $partner): ?ActivityUnit
    {
        $templateUnitId = $event->template_id !== null
            ? $event->template?->activity_unit_id
            : null;

        if ($templateUnitId !== null) {
            $unit = ActivityUnit::query()
                ->whereKey($templateUnitId)
                ->whereHas('branch', fn ($q) => $q->where('partner_id', $partner->id))
                ->first();

            if ($unit !== null) {
                return $unit;
            }
        }

        $venueIds = $event->venues()->pluck('venues.id');

        if ($venueIds->isNotEmpty()) {
            $unit = ActivityUnit::query()
                ->whereIn('venue_id', $venueIds)
                ->whereHas('branch', fn ($q) => $q->where('partner_id', $partner->id))
                ->first();

            if ($unit !== null) {
                return $unit;
            }
        }

        return null;
    }

    private function notifyProvider(Partner $partner, EventProviderRequest $request, string $plainToken): void
    {
        $url = URL::temporarySignedRoute(
            'partner.requests.link',
            $request->link_expires_at,
            ['token' => $plainToken],
        );

        // A14: نداء واحد — إشعار داخل المنصة + واتساب/SMS من القالب نفسه.
        // واتساب للإشعار فقط: القرار في اللوحة حصراً، والرد النصي «تمام محجوز»
        // لا يحجز شيئاً ولا يُلزم أحداً (H §11).
        Notify::send(
            'provider.request.new',
            $partner,
            [
                'request_id' => $request->id,
                'url' => $url,
                'deadline' => $request->deadline_at->format('Y-m-d H:i'),
            ],
            [
                'purpose' => 'provider_request',
                'data' => ['event_provider_request_id' => $request->id, 'event_id' => $request->event_id],
            ],
        );
    }

    private function notifyExpiry(EventProviderRequest $request): void
    {
        $event = $request->event;

        Notify::sendToId(
            'provider.request.deadline_expired.partner',
            Partner::class,
            (int) $request->partner_id,
            ['request_id' => $request->id],
            ['data' => ['event_provider_request_id' => $request->id]],
        );

        if ($event !== null) {
            Notify::sendToId(
                'provider.request.deadline_expired.company',
                Company::class,
                (int) $event->company_id,
                ['event_id' => $event->id],
                ['data' => ['event_id' => $event->id]],
            );

            if ($event->created_by) {
                Notify::sendToId(
                    'provider.request.deadline_expired.creator',
                    Employee::class,
                    (int) $event->created_by,
                    ['event_id' => $event->id],
                    ['data' => ['event_id' => $event->id]],
                );
            }
        }
    }
}

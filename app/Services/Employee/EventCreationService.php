<?php

namespace App\Services\Employee;

use App\Enums\EventStatus;
use App\Enums\Role;
use App\Models\Community;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\Event;
use App\Models\QuickMatch;
use App\Models\RoleAssignment;
use App\Models\VenuePricing;
use App\Services\ActivityLogService;
use App\Services\Authorization\AuthorizationService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Payments\EventRefundService;
use App\Services\Payments\FundingService;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventCreationService
{
    public function __construct(
        private EventStateMachine $machine,
        private ParticipationService $participation,
        private AuthorizationService $authorization,
    ) {}

    /**
     * H §7: القائد/المنسّق/مسؤول الحساب ينشرون مباشرة (open)؛ الموظف حسب إعداد
     * الشركة `employee_can_create_event` — معطلاً (الافتراضي) يذهب اقتراحه
     * pending_approval لاعتماد القائد أو المنسّق خلال 48 ساعة.
     */
    public function initialStatusFor(Employee $creator, Community $community): EventStatus
    {
        if ($this->canCreateDirect($creator, $community)) {
            return EventStatus::Open;
        }

        $allowed = (bool) CompanySetting::query()
            ->where('company_id', $community->company_id)
            ->value('employee_can_create_event');

        return $allowed ? EventStatus::Open : EventStatus::PendingApproval;
    }

    private function canCreateDirect(Employee $creator, Community $community): bool
    {
        if ($community->isLeader($creator)) {
            return true;
        }

        return $creator->user !== null && $this->authorization->can(
            $creator->user,
            'event.create_direct',
            RoleAssignment::SCOPE_COMMUNITY,
            $community->id,
        );
    }

    /**
     * دور المنشئ وقت الإنشاء (H §7: `creator_role`) — اسمه وجواله جهة اتصال
     * المزوّد.
     */
    public function creatorRoleFor(Employee $creator, Community $community): string
    {
        if ($community->isLeader($creator)) {
            return 'community_leader';
        }

        $roles = $creator->user?->roleAssignments
            ?->pluck('role')
            ->map(fn ($role) => $role instanceof Role ? $role->value : (string) $role)
            ->all() ?? [];

        foreach (['platform_admin', 'account_manager', 'coordinator'] as $role) {
            if (in_array($role, $roles, true)) {
                return $role;
            }
        }

        return 'employee';
    }

    /**
     * تسعير الفعالية بالهللة (A10 — H §12.1/§12.2): الإجمالي مجموع أسعار
     * المرافق للمدة المختارة (شامل الضريبة)، الدعم subsidy_type/subsidy_value
     * (لا تخفيضات — الميزة محذوفة)، والسقف الملزم = (الإجمالي − الدعم
     * المخطط) ÷ الحد الأدنى بلا تقريب لأعلى.
     *
     * @param  array{venue_pricing_id: int, venue_ids: array<int>, min_participants: int, subsidy_type?: string, subsidy_value_halalas?: int}  $params
     * @return array{total_amount_halalas: int, subsidy_type: string, subsidy_value: int, planned_subsidy_halalas: int, max_share_halalas: int}
     */
    public function calculateCosts(array $params): array
    {
        $pricing = VenuePricing::findOrFail($params['venue_pricing_id']);
        $duration = $pricing->duration_minutes;

        // مجموع أسعار المرافق المختارة للمدة — هللات صحيحة، لا float.
        //
        // **التسعيرة المختارة تحكم مرفقها** (A16): المرفق الواحد قد يحمل عدة
        // تسعيرات بنفس المدة (صباحي/مسائي/نهاية أسبوع)، وواجهة الاختيار تصفّي
        // بالتاريخ والوقت وتعرض المنطبقة؛ فأخذ «أول» تسعيرة بنفس المدة كان
        // يتجاهل ما اختاره المستخدم فعلاً ويحتسب تسعيرة أخرى — سعر معروض
        // يخالف السعر المحتسَب على المرفق نفسه.
        //
        // للمرافق الأخرى في نفس الطلب: تُفضَّل تسعيرة **بنفس المدة وبنفس صفة
        // الذروة** المختارة، وإلا يبقى السلوك القائم (أول تسعيرة بنفس المدة ثم
        // سعر التسعيرة المختارة) — انظر بند المالك في docs/acceptance.md §7.
        $totalHalalas = 0;
        foreach ($params['venue_ids'] as $venueId) {
            if ((int) $venueId === (int) $pricing->venue_id) {
                $totalHalalas += (int) $pricing->price_halalas;

                continue;
            }

            $venuePricing = VenuePricing::where('venue_id', $venueId)
                ->where('duration_minutes', $duration)
                ->orderByRaw('CASE WHEN is_peak = ? THEN 0 ELSE 1 END', [$pricing->is_peak ? 1 : 0])
                ->first();

            $totalHalalas += (int) ($venuePricing->price_halalas ?? $pricing->price_halalas);
        }

        $subsidyType = $params['subsidy_type'] ?? 'fixed';
        $subsidyValue = max(0, (int) ($params['subsidy_value_halalas'] ?? 0));

        $planned = $subsidyType === 'percentage'
            ? intdiv($totalHalalas * min(100, $subsidyValue), 100)
            : min($subsidyValue, $totalHalalas);

        $minParticipants = max(1, (int) $params['min_participants']);
        $maxShare = Money::splitShare($totalHalalas - $planned, $minParticipants)['share'];

        return [
            'total_amount_halalas' => $totalHalalas,
            'subsidy_type' => $subsidyType,
            'subsidy_value' => $subsidyValue,
            'planned_subsidy_halalas' => $planned,
            'max_share_halalas' => $maxShare,
        ];
    }

    /**
     * Create a new single event.
     *
     * التكرار لم يعد هنا (A8): مساره الوحيد قوالب `event_templates` بتوليد
     * دوري قبل 14 يوماً (H §8) — مات التوليد المسبق دفعة واحدة.
     *
     * @param  array{
     *     community_id: int,
     *     partner_id: int,
     *     category_id: int,
     *     venue_pricing_id: int,
     *     date: string,
     *     time: string,
     *     capacity: int,
     *     venues_count: int,
     *     company_subsidy: float,
     *     title?: string,
     *     notes?: string
     * }  $data
     */
    public function create(Employee $creator, array $data): Event
    {
        $community = Community::findOrFail($data['community_id']);

        if ($community->company_id !== $creator->company_id) {
            // Cross-company community id → 404, never 403 (H §4).
            throw (new ModelNotFoundException)
                ->setModel(Community::class, [$data['community_id'] ?? null]);
        }

        // H §6: a dormant (خامل) community generates no events until a
        // leader is manually assigned again.
        if ($community->status === Community::STATUS_DORMANT) {
            throw ValidationException::withMessages([
                'community_id' => ['هذا المجتمع خامل — لا يمكن إنشاء فعاليات حتى يُعيَّن له قائد.'],
            ]);
        }

        // A11 — H §12.8: تأخر سداد الشركة 30 يوماً يوقف **إنشاء** الفعاليات
        // الجديدة وحده. لا إيقاف دخول، ولا مساس بفعالية مؤكدة قائمة.
        $company = $community->company;

        if ($company !== null && $company->eventCreationBlocked()) {
            throw ValidationException::withMessages([
                'community_id' => ['أُوقف إنشاء الفعاليات الجديدة لتأخر سداد فواتير الشركة. الفعاليات المؤكدة قائمة كما هي — راجع مسؤول الحساب.'],
            ]);
        }

        $isMember = $community->members()
            ->where('employee_id', $creator->id)
            ->exists();

        if (! $isMember) {
            throw ValidationException::withMessages([
                'community_id' => ['يجب أن تكون عضواً في المجتمع لإنشاء الفعاليات.'],
            ]);
        }

        $pricing = VenuePricing::findOrFail($data['venue_pricing_id']);

        $venueIds = $data['venue_ids'];
        $venuesCount = count($venueIds);

        $minParticipants = min((int) ($data['min_participants'] ?? 2), (int) $data['capacity']);

        // الدعم (H §12.2): قيمة الطلب (المنشئ المخوَّل) وإلا افتراضي إعدادات
        // الشركة — subsidy_type fixed | percentage (المسار أ = percentage 100).
        $funding = app(FundingService::class);
        $defaults = $funding->defaultSubsidyFor($community->company_id);
        $subsidyType = $data['subsidy_type'] ?? (isset($data['company_subsidy']) ? 'fixed' : $defaults['subsidy_type']);
        $subsidyValue = isset($data['company_subsidy'])
            ? Money::toHalalas($data['company_subsidy'])
            : $defaults['subsidy_value'];

        $costs = $this->calculateCosts([
            'venue_pricing_id' => $data['venue_pricing_id'],
            'venue_ids' => $venueIds,
            'min_participants' => $minParticipants,
            'subsidy_type' => $subsidyType,
            'subsidy_value_halalas' => $subsidyValue,
        ]);

        $initialStatus = $this->initialStatusFor($creator, $community);
        $creatorRole = $this->creatorRoleFor($creator, $community);

        return DB::transaction(function () use ($creator, $community, $data, $costs, $pricing, $venueIds, $venuesCount, $minParticipants, $initialStatus, $creatorRole) {
            // لا استقطاع عند الإنشاء ولا عند قبول المزوّد — المال كله عند
            // إغلاق التسجيل (H §12.3): حجز الدعم + مطالبات الحصص.

            $event = Event::create([
                'community_id' => $data['community_id'],
                'company_id' => $community->company_id,
                'partner_id' => $data['partner_id'],
                'category_id' => $data['category_id'],
                'venue_pricing_id' => $data['venue_pricing_id'],
                'created_by' => $creator->id,
                'creator_role' => $creatorRole,
                'title' => $data['title'] ?? null,
                'event_date' => $data['date'],
                'start_time' => $data['time'],
                'duration_minutes' => $pricing->duration_minutes,
                'venues_count' => $venuesCount,
                'total_amount_halalas' => $costs['total_amount_halalas'],
                'subsidy_type' => $costs['subsidy_type'],
                'subsidy_value' => $costs['subsidy_value'],
                'max_share_halalas' => $costs['max_share_halalas'],
                'capacity' => $data['capacity'],
                'min_participants' => $minParticipants,
                'participants_count' => 1,
                'notes' => $data['notes'] ?? null,
                'status' => $initialStatus->value,
            ]);

            // تفكيك الضريبة (base/vat) يكتبه mutator الإجمالي — هنا نضمنه
            // للكتابة المباشرة بالهللة.
            $vat = Money::decomposeVat($costs['total_amount_halalas']);
            $event->forceFill([
                'base_amount_halalas' => $vat['base'],
                'vat_amount_halalas' => $vat['vat'],
            ])->save();

            // سطر التاريخ الافتتاحي في event_status_history (H §9).
            $this->machine->initialize($event, $creator, $initialStatus === EventStatus::PendingApproval
                ? 'اقتراح موظف — بانتظار اعتماد القائد أو المنسّق خلال 48 ساعة'
                : 'إنشاء فعالية منشورة مباشرة');

            // Attach selected venues
            $event->venues()->attach($venueIds);

            // Creator auto-joins the event — مقعد محجوز، لا تحصيل عند الانضمام.
            $event->participants()->attach($creator->id, [
                'seat_status' => 'reserved',
                'joined_at' => now(),
            ]);
            $this->participation->logChange($event, $creator->id, 'seat_status', null, 'reserved', $creator, 'منشئ الفعالية — انضمام تلقائي');

            // Auto-join voters from quick match
            if (! empty($data['quick_match_id'])) {
                $quickMatch = QuickMatch::find($data['quick_match_id']);
                if ($quickMatch && $quickMatch->community_id === (int) $data['community_id']) {
                    $voterIds = $quickMatch->votes()->pluck('employee_id')
                        ->filter(fn ($id) => $id !== $creator->id)
                        ->take($data['capacity'] - 1); // leave room respecting capacity

                    foreach ($voterIds as $empId) {
                        $event->participants()->attach($empId, [
                            'seat_status' => 'reserved',
                            'joined_at' => now(),
                        ]);
                        $event->increment('participants_count');
                        $this->participation->logChange($event, (int) $empId, 'seat_status', null, 'reserved', $creator, 'انضمام تلقائي من تصويت مباراة سريعة');
                    }
                }
            }

            $event->refresh();
            $event->forceFill(['is_full' => $event->participants_count >= (int) $event->capacity])->save();

            // بلوغ الحد الأدنى منذ الإنشاء (تصويت جماعي مثلاً) → الطلب للمزوّد.
            if ((string) $event->status === EventStatus::Open->value
                && $event->participants_count >= (int) $event->min_participants) {
                $this->machine->minimumReached($event, $creator);
                // تنبيه استباقي إلزامي: رصيد لا يغطي الدعم (A10 — H §12.3).
                app(FundingService::class)->alertIfSubsidyUncovered($event);
            }

            ActivityLogService::log(
                $community->company_id,
                $event,
                'event_created',
                "تم إنشاء الفعالية #{$event->id} بواسطة موظف #{$creator->id}",
            );

            if ($event->status === EventStatus::PendingApproval->value) {
                // اقتراح: يُشعَر قادة المجتمع للاعتماد خلال 48 ساعة — لا الأعضاء.
                foreach ($community->leaderEmployees() as $leader) {
                    Notify::send(
                        'event.proposal.pending_leader',
                        $leader,
                        ['creator' => $creator->name, 'community' => $community->name],
                        ['data' => ['event_id' => $event->id]],
                    );
                }
            } else {
                // Notify community members about the new event
                $community->load('members');
                foreach ($community->members as $member) {
                    if ($member->id === $creator->id) {
                        continue;
                    }
                    Notify::send(
                        'event.created.member',
                        $member,
                        ['community' => $community->name],
                        ['data' => ['event_id' => $event->id]],
                    );
                }
            }

            return $event->fresh(['community', 'partner', 'category', 'creator', 'occurrences']);
        });
    }

    /**
     * إلغاء تكرارات سلسلة قديمة مستقبلية — عبر آلة الحالات حصراً (H §9):
     * cancelled_company مشروع من booked/confirmed فقط؛ التكرارات المفتوحة التي
     * لم يقبلها مزوّد لا يعرف الجدول إلغاءها — تُترك لتنتهي (expired) تلقائياً.
     * «إيقاف التوليد» نفسه صار إيقاف القالب (A8 — H §8)؛ هذا المسار باقٍ
     * للسلاسل المرحّلة المولّدة سلفاً فقط. يعيد عدد ما أُلغي فعلاً.
     */
    public function cancelSeries(Event $parentEvent, ?Employee $actor = null): int
    {
        $cancelled = 0;

        $occurrences = $parentEvent->occurrences()
            ->where('event_date', '>=', now()->toDateString())
            ->whereIn('status', ['booked', 'confirmed'])
            ->get();

        foreach ($occurrences as $occurrence) {
            $this->cancelOccurrence($occurrence, $actor);
            $cancelled++;
        }

        return $cancelled;
    }

    /**
     * Cancel a single occurrence from a recurring series.
     *
     * إلغاء شركة ⇒ استرداد **كامل** بمصفوفة A10 (H §12.4): فك الحجوزات، عكس
     * الاستقطاعات (بما فيها مفتاح budget-capture القديم للمرحَّل)، ورد كل
     * حصة مدفوعة إلى وسيلة الدفع الأصلية — نسب 100/50/0 القديمة ماتت.
     */
    public function cancelOccurrence(Event $occurrence, ?Employee $actor = null): void
    {
        if (! in_array($occurrence->status, ['booked', 'confirmed'], true)) {
            // H §9: لا إلغاء شركة إلا من booked/confirmed — البقية تنتهي تلقائياً.
            return;
        }

        $this->machine->cancelCompany($occurrence, $actor, 'إلغاء تكرار من سلسلة');

        app(EventRefundService::class)
            ->refundEventCollections($occurrence, 'إلغاء الشركة لتكرار من سلسلة — استرداد كامل (H §12.4)');
    }
}

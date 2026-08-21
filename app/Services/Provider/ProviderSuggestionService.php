<?php

namespace App\Services\Provider;

use App\Models\ActivityUnit;
use App\Models\Community;
use App\Models\CommunityPreferredProvider;
use App\Models\Event;
use App\Models\Partner;
use App\Models\ProviderSelectionLog;
use App\Models\RoleAssignment;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * خوارزمية اقتراح المزوّد (H §11) — بسيطة وشفافة، بلا أوزان مركّبة ولا
 * تعلّم آلي في الإصدار الأول:
 *
 * 1) المزوّدون المفضّلون للمجتمع أولاً — دائماً قبل غيرهم.
 * 2) إقصاء: غير المتاح في الوقت، من لا يقدّم النشاط، خارج الميزانية، المعطّل.
 * 3) ترتيب المتبقي: السعر ضمن الميزانية ← مؤشر الموثوقية ← عدم تكرار نفس
 *    المزوّد أكثر من مرتين متتاليتين للمجتمع ← القرب (مدينة الشركة).
 * 4) صفر نتائج: تُعاد مع بيان السبب — لا تُنشأ فعالية بمزوّد غير متاح.
 * 5) التجاوز مسموح دائماً مع سبب مسجَّل إلزامياً — مادة أتمتة الاختيار لاحقاً.
 */
class ProviderSuggestionService
{
    public function __construct(private AvailabilityService $availability) {}

    /**
     * @param  array{community_id: int, category_id: int, date: string, time: string, duration_minutes?: int|null, budget?: float|null, participants_count?: int|null}  $params
     * @return array{candidates: array<int, array<string, mixed>>, excluded: array<int, array{partner_id: int, name: string, reason: string}>, reason: string|null}
     */
    public function suggest(array $params): array
    {
        $community = Community::findOrFail($params['community_id']);
        $start = Carbon::parse($params['date'].' '.$params['time']);
        $participants = $params['participants_count'] ?? null;
        // الميزانية تصل بالريال من الواجهة — تُحوَّل هللات على الحد (A10).
        $budget = isset($params['budget']) ? Money::toHalalas($params['budget']) : null;

        $preferredPositions = CommunityPreferredProvider::query()
            ->where('community_id', $community->id)
            ->pluck('position', 'partner_id');

        $recentProviderIds = $this->lastTwoProviderIds($community);
        $companyCity = $community->company?->city;

        $providers = Partner::query()
            ->whereNull('parent_id')
            ->with(['branches.units' => fn ($q) => $q->where('category_id', $params['category_id'])])
            ->whereHas('branches.units', fn ($q) => $q->where('category_id', $params['category_id']))
            ->get();

        $candidates = [];
        $excluded = [];

        foreach ($providers as $provider) {
            if ($provider->status !== 'active') {
                $excluded[] = $this->exclusion($provider, 'المزوّد معطّل');

                continue;
            }

            $units = $provider->branches
                ->where('status', 'active')
                ->flatMap(fn ($branch) => $branch->units)
                ->where('status', 'active')
                ->when($participants !== null, fn (Collection $set) => $set->filter(
                    fn (ActivityUnit $unit) => $unit->max_capacity >= $participants,
                ));

            if ($units->isEmpty()) {
                $excluded[] = $this->exclusion($provider, 'لا يقدّم النشاط المطلوب بوحدة مناسبة');

                continue;
            }

            $available = $units->filter(function (ActivityUnit $unit) use ($start, $params) {
                $duration = $params['duration_minutes'] ?? $unit->default_duration_minutes;

                return $this->availability->isAvailable($unit, $start, (int) $duration);
            });

            if ($available->isEmpty()) {
                $excluded[] = $this->exclusion($provider, 'غير متاح في الوقت المطلوب');

                continue;
            }

            $priced = $available->map(fn (ActivityUnit $unit) => [
                'unit' => $unit,
                'estimated_price' => $this->estimatePrice($unit, $participants),
            ])->sortBy('estimated_price');

            $withinBudget = $budget === null
                ? $priced
                : $priced->filter(fn (array $row) => $row['estimated_price'] <= $budget);

            if ($withinBudget->isEmpty()) {
                $excluded[] = $this->exclusion($provider, 'خارج نطاق الميزانية');

                continue;
            }

            /** @var array{unit: ActivityUnit, estimated_price: int} $best */
            $best = $withinBudget->first();

            $estimatedHalalas = $best['unit']->pricing_type === ActivityUnit::PRICING_PER_PERSON && $participants === null
                ? (int) $best['unit']->price_halalas
                : $best['estimated_price'];

            $candidates[] = [
                'partner_id' => $provider->id,
                'name' => $provider->trade_name ?: $provider->name,
                'unit_id' => $best['unit']->id,
                'unit_name' => $best['unit']->name,
                'branch_id' => $best['unit']->provider_branch_id,
                'pricing_type' => $best['unit']->pricing_type,
                // عرض بالريال؛ الترتيب الداخلي بالهللة الصحيحة
                'estimated_price' => Money::format($estimatedHalalas),
                '_rank_price' => $estimatedHalalas,
                'is_preferred' => $preferredPositions->has($provider->id),
                'preferred_position' => $preferredPositions->get($provider->id),
                // المؤشر لا يُعرض قبل 10 عينات — لكنه يُستخدم داخلياً للترتيب
                'reliability_score' => $provider->reliabilityVisible() ? (int) $provider->reliability_score : null,
                'consecutive_repeat' => $recentProviderIds === [$provider->id, $provider->id],
                'same_city' => $companyCity !== null && $provider->city === $companyCity,
                '_rank_reliability' => (int) $provider->reliability_score,
            ];
        }

        usort($candidates, function (array $a, array $b) {
            // 1) المفضّلون أولاً وبترتيبهم
            $aPref = $a['is_preferred'] ? ($a['preferred_position'] ?? 0) : PHP_INT_MAX;
            $bPref = $b['is_preferred'] ? ($b['preferred_position'] ?? 0) : PHP_INT_MAX;
            if ($aPref !== $bPref) {
                return $aPref <=> $bPref;
            }

            // 2) السعر ضمن الميزانية (هللات صحيحة)
            if ($a['_rank_price'] !== $b['_rank_price']) {
                return $a['_rank_price'] <=> $b['_rank_price'];
            }

            // 3) مؤشر الموثوقية (داخلي)
            if ($a['_rank_reliability'] !== $b['_rank_reliability']) {
                return $b['_rank_reliability'] <=> $a['_rank_reliability'];
            }

            // 4) عدم تكرار نفس المزوّد أكثر من مرتين متتاليتين
            if ($a['consecutive_repeat'] !== $b['consecutive_repeat']) {
                return $a['consecutive_repeat'] <=> $b['consecutive_repeat'];
            }

            // 5) القرب الجغرافي — نفس مدينة الشركة أولاً
            return $b['same_city'] <=> $a['same_city'];
        });

        $candidates = array_map(function (array $row) {
            unset($row['_rank_reliability'], $row['_rank_price']);

            return $row;
        }, $candidates);

        return [
            'candidates' => $candidates,
            'excluded' => $excluded,
            'reason' => $candidates === []
                ? $this->zeroResultsReason($excluded)
                : null,
        ];
    }

    /**
     * تسجيل الاختيار — سبب التجاوز إلزامي حين لا يكون المختار هو الاقتراح
     * الأول. الحقل ليس اختيارياً أبداً (H §11).
     *
     * @param  array<int, array<string, mixed>>  $candidates
     */
    public function logSelection(
        Community $community,
        int $chosenPartnerId,
        array $candidates,
        ?string $overrideReason = null,
        ?Event $event = null,
        ?int $actorUserId = null,
    ): ProviderSelectionLog {
        $topPartnerId = $candidates[0]['partner_id'] ?? null;
        $wasOverride = $topPartnerId !== null && $topPartnerId !== $chosenPartnerId;

        if ($wasOverride && trim((string) $overrideReason) === '') {
            throw ValidationException::withMessages([
                'override_reason' => ['سبب تجاوز الاقتراح إلزامي — هذه الأسباب هي مادة أتمتة الاختيار لاحقاً.'],
            ]);
        }

        $log = ProviderSelectionLog::create([
            'event_id' => $event?->id,
            'community_id' => $community->id,
            'chosen_partner_id' => $chosenPartnerId,
            'suggested_partner_id' => $topPartnerId,
            'was_override' => $wasOverride,
            'override_reason' => $wasOverride ? $overrideReason : null,
            'suggestions_json' => array_slice($candidates, 0, 10),
            'actor_user_id' => $actorUserId,
        ]);

        // A15 — H §19: «تجاوز الاقتراح الآلي **مع السبب**» بند إلزامي في
        // كتالوج التدقيق. الاختيار المطابق للاقتراح ليس تجاوزاً فلا يُسجَّل.
        if ($wasOverride) {
            AuditLogService::record(
                action: AuditAction::PROVIDER_SUGGESTION_OVERRIDDEN,
                entity: $log,
                before: ['suggested_partner_id' => $topPartnerId],
                after: ['chosen_partner_id' => $chosenPartnerId, 'event_id' => $event?->id],
                reason: $overrideReason,
                companyId: $community->company_id,
                scopeType: RoleAssignment::SCOPE_COMMUNITY,
                scopeId: $community->id,
                actorUserId: $actorUserId,
            );
        }

        return $log;
    }

    /**
     * هل المزوّد متاح فعلاً للفتحة المطلوبة؟ حاجز «لا تُنشأ فعالية بمزوّد
     * غير متاح» — يسري على من تبنّى التسلسل (فروع + وحدات)؛ الشركاء القدامى
     * بلا فروع يتخطون الفحص حتى يكتمل ترحيلهم.
     */
    public function providerAvailableFor(Partner $provider, int $categoryId, Carbon $start, int $durationMinutes, ?int $participants = null): bool
    {
        if (! $provider->hasHierarchy()) {
            return true;
        }

        $units = ActivityUnit::query()
            ->where('category_id', $categoryId)
            ->where('status', 'active')
            ->whereHas('branch', fn ($q) => $q->where('partner_id', $provider->id)->where('status', 'active'))
            ->when($participants !== null, fn ($q) => $q->where('max_capacity', '>=', $participants))
            ->get();

        return $units->contains(
            fn (ActivityUnit $unit) => $this->availability->isAvailable($unit, $start, $durationMinutes),
        );
    }

    /**
     * آخر مزوّدَين لفعاليتين متتاليتين للمجتمع (لقاعدة عدم التكرار).
     *
     * @return array<int, int>
     */
    private function lastTwoProviderIds(Community $community): array
    {
        return Event::query()
            ->where('community_id', $community->id)
            ->whereNotNull('partner_id')
            ->whereIn('status', ['booked', 'awaiting_payment', 'confirmed', 'in_progress', 'completed', 'settled'])
            ->orderByDesc('event_date')
            ->orderByDesc('id')
            ->limit(2)
            ->pluck('partner_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * تقدير السعر هللات صحيحة (A10 — لا float في حساب مالي): للشخص = سعر
     * الفرد × العدد، وإلا سعر الوحدة/الباقة كما هو.
     */
    private function estimatePrice(ActivityUnit $unit, ?int $participants): int
    {
        return match ($unit->pricing_type) {
            ActivityUnit::PRICING_PER_PERSON => (int) $unit->price_halalas * max(1, (int) $participants),
            default => (int) $unit->price_halalas,
        };
    }

    /**
     * @return array{partner_id: int, name: string, reason: string}
     */
    private function exclusion(Partner $provider, string $reason): array
    {
        return [
            'partner_id' => $provider->id,
            'name' => $provider->trade_name ?: $provider->name,
            'reason' => $reason,
        ];
    }

    /**
     * @param  array<int, array{partner_id: int, name: string, reason: string}>  $excluded
     */
    private function zeroResultsReason(array $excluded): string
    {
        if ($excluded === []) {
            return 'لا يوجد مزوّد يقدّم هذا النشاط.';
        }

        $summary = collect($excluded)
            ->groupBy('reason')
            ->map(fn ($group, $reason) => $reason.' ('.$group->count().')')
            ->implode(' · ');

        return 'لا يوجد مزوّد مناسب: '.$summary;
    }
}

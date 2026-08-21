<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Community;
use App\Models\EventTemplate;
use App\Models\Partner;
use App\Services\Events\TemplateScheduleService;
use App\Services\Events\TemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * إدارة قوالب التكرار من بوابة الشركة — مسؤول الحساب (H §8: القالب ينشئه
 * القائد أو المنسّق أو مسؤول الحساب). نفس خدمة القوالب المشتركة.
 */
class TemplateController extends Controller
{
    public function __construct(
        private TemplateService $templates,
        private TemplateScheduleService $schedule,
    ) {}

    public function index(Community $community): Response
    {
        Gate::authorize('update', $community);

        return Inertia::render('company/communities/templates', [
            'community' => $community->only(['id', 'name', 'status']),
            'templates' => $this->templatePayload($community),
            'partners' => $this->partnerOptions(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'manageUrl' => "/company/communities/{$community->id}/templates",
        ]);
    }

    public function store(Request $request, Community $community): RedirectResponse
    {
        Gate::authorize('update', $community);

        $this->templates->create($community, $this->validated($request), null);

        return back()->with('success', 'أُنشئ القالب وسيولّد فعالياته قبل 14 يوماً من كل موعد.');
    }

    public function update(Request $request, Community $community, EventTemplate $template): RedirectResponse
    {
        Gate::authorize('update', $community);
        abort_unless($template->community_id === $community->id, 404);

        $this->templates->update($template, $this->validated($request));

        return back()->with('success', 'عُدّل القالب — يسري على الفعاليات التي ستُولَّد لاحقاً فقط.');
    }

    public function pause(Community $community, EventTemplate $template): RedirectResponse
    {
        Gate::authorize('update', $community);
        abort_unless($template->community_id === $community->id, 404);

        $this->templates->pause($template);

        return back()->with('success', 'أُوقف القالب — توقف التوليد المستقبلي فقط، والفعاليات المولّدة لم تُمس.');
    }

    public function resume(Community $community, EventTemplate $template): RedirectResponse
    {
        Gate::authorize('update', $community);
        abort_unless($template->community_id === $community->id, 404);

        $this->templates->resume($template);

        return back()->with('success', 'أُعيد تفعيل القالب.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:500'],
            'partner_id' => ['required', 'integer', 'exists:partners,id'],
            'activity_unit_id' => ['nullable', 'integer', 'exists:activity_units,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'venue_pricing_id' => ['nullable', 'integer', 'exists:venue_pricings,id'],
            'venue_ids' => ['nullable', 'array'],
            'venue_ids.*' => ['integer', 'exists:venues,id'],
            'recurrence_pattern' => ['required', 'in:weekly,biweekly,monthly'],
            'day_of_week' => ['nullable', 'integer', 'between:0,6'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31'],
            'starts_from' => ['nullable', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['required', 'integer', 'between:30,480'],
            'capacity' => ['required', 'integer', 'min:2'],
            'min_participants' => ['required', 'integer', 'min:2', 'lte:capacity'],
            'venues_count' => ['nullable', 'integer', 'between:1,10'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'company_subsidy' => ['nullable', 'numeric', 'min:0'],
            // A10 — H §12.2: fixed (مبلغ) | percentage (نسبة 0–100؛ المسار أ = 100)
            'subsidy_type' => ['nullable', 'in:fixed,percentage'],
            'subsidy_value' => ['nullable', 'integer', 'min:0'],
            'blackout_behavior' => ['required', 'in:skip,shift_week'],
            'reschedule_interval_days' => ['nullable', 'integer', 'between:1,28'],
        ]);
    }

    /**
     * @return array<int, mixed>
     */
    private function templatePayload(Community $community): array
    {
        return EventTemplate::query()
            ->where('community_id', $community->id)
            ->with(['partner:id,name,trade_name', 'activityUnit:id,name', 'category:id,name'])
            ->withCount('events')
            ->orderByDesc('id')
            ->get()
            ->map(fn (EventTemplate $template) => [
                ...$template->toArray(),
                'upcoming' => $this->schedule->preview($template),
                'generated_events' => $template->events()
                    ->orderByDesc('event_date')
                    ->limit(10)
                    ->get(['id', 'event_date', 'start_time', 'status', 'participants_count', 'min_participants', 'reschedule_attempt']),
            ])
            ->all();
    }

    /**
     * @return array<int, mixed>
     */
    private function partnerOptions(): array
    {
        return Partner::query()
            ->active()
            ->whereNull('parent_id')
            ->with(['branches.units' => fn ($q) => $q->where('status', 'active')])
            ->orderBy('name')
            ->get()
            ->map(fn ($partner) => [
                'id' => $partner->id,
                'name' => $partner->trade_name ?: $partner->name,
                'units' => $partner->branches->flatMap(
                    fn ($branch) => $branch->units->map(fn ($unit) => [
                        'id' => $unit->id,
                        'name' => "{$branch->name} — {$unit->name}",
                        'category_id' => $unit->category_id,
                        'price' => $unit->price,
                        'default_duration_minutes' => $unit->default_duration_minutes,
                    ]),
                )->values(),
            ])
            ->all();
    }
}

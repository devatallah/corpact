<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\Competition\GhostEventMetricService;
use App\Support\Lists\ListSort;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A13 — **المراقبة الأسبوعية لمؤشر الفعالية الشبح** (H §13 ⟶ H §15).
 *
 * المقايضة التي أعلنتها المواصفة: الحضور التلقائي يعني أن **فعالية لم تُقم
 * فعلاً ولم يبلّغ عنها أحد ستُحتسب مكتملة** فتُصرف للمزوّد وتدخل الفوترة،
 * والنص صريح: «**يجب مراقبة معدل التعديلات بعد الاكتمال كمؤشر إنذار مبكر**».
 *
 * الفارق الذي تصنعه هذه الشاشة: الرقم وحده لا يقول شيئاً — **ارتفاعه** هو
 * الإشارة. فالجدول أسابيع متتابعة لا لقطة واحدة، وقفزة معدل التعديل بعد
 * الاكتمال أو معدل التدخل اليدوي **عطل تشغيلي في الميدان**، لا نشاط إداري
 * يُقاس بالإنتاجية: أحدهما يعني أن الفعاليات لا تقع كما تُسجَّل، والآخر أن
 * آلة الحالات تُدفع باليد.
 *
 * الأرقام كلها من {@see GhostEventMetricService::stats()} (A12) — لا استعلام
 * موازٍ هنا.
 */
class GhostEventMonitorController extends Controller
{
    public const WEEKS = 8;

    public function __construct(
        private GhostEventMetricService $metrics,
    ) {}

    /**
     * H §18 — ترتيب سجلّ التدخلات اليدوية. الاستعلام مربوط بجدولين، فكل
     * تعبير هنا مؤهَّل باسم جدوله — ولا واحد منها يأتي من الطلب.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'event_status_history.created_at',
            'event_title' => 'events.title',
            'company_name' => 'companies.name',
            'to_status' => 'event_status_history.to_status',
        ], 'created_at', ListSort::DESC, 'event_status_history.id');
    }

    public function index(Request $request): Response
    {
        $companyId = $request->integer('company_id') ?: null;
        $now = Carbon::now();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $weeks = [];

        for ($i = self::WEEKS - 1; $i >= 0; $i--) {
            $end = $now->copy()->subWeeks($i);
            $start = $end->copy()->subWeek();

            $stats = $this->metrics->stats($companyId, $start, $end);

            $weeks[] = [
                'label' => $start->format('m-d').' → '.$end->format('m-d'),
                'from' => $start->toIso8601String(),
                'to' => $end->toIso8601String(),
                'completed_events' => $stats['completed_events'],
                'post_completion_edited_events' => $stats['post_completion_edited_events'],
                'post_completion_edit_rate' => $stats['post_completion_edit_rate'],
                'events_created' => $stats['events_created'],
                'manual_state_change_events' => $stats['manual_state_change_events'],
                'manual_state_change_rate' => $stats['manual_state_change_rate'],
                'locked_without_review' => $stats['locked_without_review'],
                'locked_without_review_rate' => $stats['locked_without_review_rate'],
            ];
        }

        // خط الأساس: متوسط الأسابيع السابقة عدا الأخير — القفزة تُقاس عليه.
        $history = array_slice($weeks, 0, self::WEEKS - 1);
        $latest = $weeks[self::WEEKS - 1];

        $baseline = [
            'post_completion_edit_rate' => $this->average(array_column($history, 'post_completion_edit_rate')),
            'manual_state_change_rate' => $this->average(array_column($history, 'manual_state_change_rate')),
            'locked_without_review_rate' => $this->average(array_column($history, 'locked_without_review_rate')),
        ];

        return Inertia::render('admin/monitoring/ghost-events', [
            'weeks' => $weeks,
            'latest' => $latest,
            'baseline' => $baseline,
            'companyId' => $companyId,
            'companies' => Company::query()
                ->withoutGlobalScopes()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($company) => ['id' => (int) $company->id, 'name' => (string) $company->name])
                ->all(),
            'recentManualChanges' => $this->recentManualChanges($companyId, $filters),
            'filters' => (object) $filters,
            'sort' => self::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    /**
     * @param  list<float>  $values
     */
    private function average(array $values): float
    {
        return $values === [] ? 0.0 : round(array_sum($values) / count($values), 1);
    }

    /**
     * التدخلات اليدوية بأسبابها — «سجل الحالات يُقرأ قبل التدخل» (H §16).
     *
     * كانت `limit(20)` بلا ترقيم، فالتدخل الحادي والعشرون كان يختفي من شاشة
     * إنذار مبكر — وهو بالضبط ما تبحث عنه الشاشة. صارت 20/صفحة (H §18)
     * ببحث في العنوان والشركة والسبب.
     *
     * @param  array{search?: string|null, sort?: string|null, dir?: string|null}  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    private function recentManualChanges(?int $companyId, array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;

        $query = DB::table('event_status_history')
            ->join('events', 'events.id', '=', 'event_status_history.event_id')
            ->leftJoin('companies', 'companies.id', '=', 'events.company_id')
            ->where('event_status_history.is_manual', true)
            ->when($companyId !== null, fn ($q) => $q->where('events.company_id', $companyId))
            ->when(filled($search), fn ($q) => $q->where(fn ($inner) => $inner
                ->where('events.title', 'like', '%'.$search.'%')
                ->orWhere('companies.name', 'like', '%'.$search.'%')
                ->orWhere('event_status_history.reason', 'like', '%'.$search.'%')))
            ->select([
                'event_status_history.id',
                'event_status_history.event_id',
                'event_status_history.from_status',
                'event_status_history.to_status',
                'event_status_history.reason',
                'event_status_history.created_at',
                'events.title as event_title',
                'companies.name as company_name',
            ]);

        return self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => (int) $row->id,
                'event_id' => (int) $row->event_id,
                'event_title' => (string) $row->event_title,
                'company_name' => (string) ($row->company_name ?? ''),
                'from_status' => $row->from_status,
                'to_status' => $row->to_status,
                'reason' => $row->reason,
                'created_at' => $row->created_at,
            ]);
    }
}

<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\League;
use App\Models\Notification;
use App\Services\Employee\LeagueService;
use App\Support\Lists\ListSort;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeagueController extends Controller
{
    public function __construct(
        private LeagueService $leagueService,
    ) {}

    /**
     * الأعمدة المسموح الترتيب بها — أعمدة الجدول المعروضة وحدها (H §18).
     * `matches_count` اسم تجميع من `withCount('matches')` القائم أصلاً، واسم
     * المجتمع عمود علاقة فلا يُرتَّب به بلا وصلة.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'format' => 'format',
            'status' => 'status',
            'matches_count' => 'matches_count',
            'created_at' => 'created_at',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * List all leagues across company communities.
     */
    public function index(Request $request): Response
    {
        $company = auth('company')->user();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort`، لا
            // اسم عمود؛ التحقق هنا يمنع الحشو فقط.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $query = League::whereHas('community', fn ($q) => $q->where('company_id', $company->id))
            ->with(['community.category', 'departments', 'creator'])
            ->withCount('matches')
            // البحث مجمَّع داخل قوس واحد فلا يتجاوز نطاق الشركة أعلاه.
            ->when(filled($filters['search'] ?? null), fn ($q) => $q->where(fn ($inner) => $inner
                ->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhereHas('community', fn ($c) => $c->where('name', 'like', '%'.$filters['search'].'%'))));

        $leagues = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate(20)
            ->withQueryString();

        $unreadNotifications = Notification::where('notifiable_type', Company::class)
            ->where('notifiable_id', $company->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('company/leagues/index', [
            'company' => $company,
            'leagues' => $leagues,
            'filters' => $filters,
            'sort' => self::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Show league details (read-only).
     */
    public function show(League $league): Response
    {
        $company = auth('company')->user();

        // Ensure league belongs to a community of this company
        $league->load(['community.category', 'departments', 'matches.departmentA', 'matches.departmentB', 'creator']);

        if ($league->community->company_id !== $company->id) {
            abort(403);
        }

        $standings = $league->isRoundRobin() ? $this->leagueService->standings($league) : null;

        $unreadNotifications = Notification::where('notifiable_type', Company::class)
            ->where('notifiable_id', $company->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('company/leagues/show', [
            'company' => $company,
            'league' => $league,
            'standings' => $standings,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Services\Employee\LeagueService;
use Inertia\Inertia;
use Inertia\Response;

class LeagueController extends Controller
{
    public function __construct(
        private LeagueService $leagueService,
    ) {}

    /**
     * List all leagues across company communities.
     */
    public function index(): Response
    {
        $company = auth('company')->user();

        $leagues = League::whereHas('community', fn ($q) => $q->where('company_id', $company->id))
            ->with(['community.category', 'departments', 'creator'])
            ->withCount('matches')
            ->latest()
            ->paginate(15);

        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)
            ->where('notifiable_id', $company->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('company/leagues/index', [
            'company' => $company,
            'leagues' => $leagues,
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

        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)
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

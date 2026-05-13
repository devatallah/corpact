<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Department;
use App\Models\League;
use App\Models\LeagueMatch;
use App\Services\Employee\LeagueService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeagueController extends Controller
{
    public function __construct(
        private LeagueService $leagueService,
    ) {}

    /**
     * Show league details.
     */
    public function show(Community $community, League $league): Response
    {
        $employee = auth('employee')->user();

        $league->load(['departments', 'matches.departmentA', 'matches.departmentB', 'creator']);

        $isLeader = $community->leader_id === $employee->id;

        $standings = $league->isRoundRobin() ? $this->leagueService->standings($league) : null;

        return Inertia::render('employee/community/league-show', [
            'community' => $community->load('sport'),
            'league' => $league,
            'standings' => $standings,
            'isLeader' => $isLeader,
        ]);
    }

    /**
     * Show create league form.
     */
    public function create(Community $community): Response
    {
        $departments = Department::where('company_id', $community->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('employee/community/league-create', [
            'community' => $community->load('sport'),
            'departments' => $departments,
        ]);
    }

    /**
     * Store a new league.
     */
    public function store(Request $request, Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($community->leader_id !== $employee->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'format' => ['required', 'in:single_round_robin,double_round_robin,knockout'],
            'department_ids' => ['required', 'array', 'min:2'],
            'department_ids.*' => ['required', 'integer', 'exists:departments,id'],
        ], [
            'name.required' => 'اسم البطولة مطلوب.',
            'format.required' => 'نوع البطولة مطلوب.',
            'department_ids.required' => 'يجب اختيار الأقسام المشاركة.',
            'department_ids.min' => 'يجب اختيار قسمين على الأقل.',
        ]);

        // Knockout requires power of 2
        if ($data['format'] === 'knockout') {
            $count = count($data['department_ids']);
            if ($count < 2 || ($count & ($count - 1)) !== 0) {
                return back()->withErrors(['department_ids' => 'عدد الأقسام في نظام خروج المغلوب يجب أن يكون 2 أو 4 أو 8 أو 16.']);
            }
        }

        $league = $this->leagueService->create([
            'name' => $data['name'],
            'format' => $data['format'],
            'community_id' => $community->id,
            'created_by' => $employee->id,
        ], $data['department_ids']);

        return redirect()->route('employee.communities.leagues.show', [$community, $league])
            ->with('success', 'تم إنشاء البطولة بنجاح.');
    }

    /**
     * Record a match result.
     */
    public function recordResult(Request $request, Community $community, League $league, LeagueMatch $match): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($community->leader_id !== $employee->id) {
            abort(403);
        }

        $rules = [
            'score_a' => ['required', 'integer', 'min:0'],
            'score_b' => ['required', 'integer', 'min:0'],
        ];

        // Knockout: no draws allowed
        if ($league->isKnockout()) {
            $rules['score_a'][] = 'different:score_b';
        }

        $data = $request->validate($rules, [
            'score_a.required' => 'نتيجة الفريق الأول مطلوبة.',
            'score_b.required' => 'نتيجة الفريق الثاني مطلوبة.',
            'score_a.different' => 'لا يمكن التعادل في نظام خروج المغلوب.',
        ]);

        $this->leagueService->recordResult($match, $data['score_a'], $data['score_b']);

        return back()->with('success', 'تم تسجيل النتيجة.');
    }

    /**
     * Delete a league.
     */
    public function destroy(Community $community, League $league): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($community->leader_id !== $employee->id) {
            abort(403);
        }

        $league->delete();

        return redirect()->route('employee.communities.show', $community)
            ->with('success', 'تم حذف البطولة.');
    }
}

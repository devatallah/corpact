<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\QuickMatch;
use App\Services\Employee\QuickMatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class QuickMatchController extends Controller
{
    public function __construct(
        private QuickMatchService $quickMatchService,
    ) {}

    /**
     * Store a new quick match.
     */
    public function store(Request $request): RedirectResponse
    {
        $employee = auth('employee')->user();

        $validated = $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'preferred_date' => ['nullable', 'date', 'after_or_equal:today'],
            'preferred_time' => ['nullable', 'date_format:H:i'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        // Ensure employee is a member of the community
        $isMember = $employee->communities()
            ->where('communities.id', $validated['community_id'])
            ->exists();

        if (! $isMember) {
            return back()->with('error', 'يجب أن تكون عضو في المجتمع.');
        }

        $this->quickMatchService->create($employee, $validated);

        return back()->with('success', 'تم إنشاء اللعبة السريعة.');
    }

    /**
     * Toggle interest on a quick match.
     */
    public function toggleInterest(QuickMatch $quickMatch): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($quickMatch->status !== 'open') {
            return back()->with('error', 'هذه اللعبة لم تعد متاحة.');
        }

        $isInterested = $this->quickMatchService->toggleInterest($employee, $quickMatch);

        return back()->with('success', $isInterested ? 'تم تسجيل اهتمامك.' : 'تم إلغاء اهتمامك.');
    }

    /**
     * Convert a quick match into an event.
     */
    public function convert(QuickMatch $quickMatch): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($quickMatch->status !== 'open') {
            return back()->with('error', 'هذه اللعبة لم تعد متاحة.');
        }

        // Only creator or community leader can convert
        $community = $quickMatch->community;
        $isCreator = $quickMatch->created_by === $employee->id;
        $isLeader = $community->leader_id === $employee->id;

        if (! $isCreator && ! $isLeader) {
            return back()->with('error', 'يمكن فقط لمنشئ اللعبة أو قائد المجتمع التحويل.');
        }

        $redirectUrl = $this->quickMatchService->convert($quickMatch);

        return redirect($redirectUrl)->with('success', 'تم تحويل اللعبة السريعة. أنشئ الفعالية الآن.');
    }
}

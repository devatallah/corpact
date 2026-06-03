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
     * Store a new quick match with poll options.
     */
    public function store(Request $request): RedirectResponse
    {
        $employee = auth('employee')->user();

        $validated = $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'message' => ['nullable', 'string', 'max:500'],
            'options' => ['required', 'array', 'min:2', 'max:5'],
            'options.*.date' => ['required', 'date', 'after_or_equal:today'],
            'options.*.time' => ['required', 'date_format:H:i'],
        ]);

        // Ensure employee is a member of the community
        $isMember = $employee->communities()
            ->where('communities.id', $validated['community_id'])
            ->exists();

        if (! $isMember) {
            return back()->with('error', 'يجب أن تكون عضو في المجتمع.');
        }

        $this->quickMatchService->create($employee, $validated);

        return back()->with('success', 'تم إنشاء التصويت.');
    }

    /**
     * Vote on a quick match option.
     */
    public function vote(Request $request, QuickMatch $quickMatch): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($quickMatch->status !== 'open') {
            return back()->with('error', 'هذا التصويت لم يعد متاحاً.');
        }

        $validated = $request->validate([
            'option_id' => ['required', 'integer', 'exists:quick_match_options,id'],
        ]);

        // Verify option belongs to this quick match
        $optionBelongs = $quickMatch->options()->where('id', $validated['option_id'])->exists();
        if (! $optionBelongs) {
            return back()->with('error', 'خيار غير صالح.');
        }

        $this->quickMatchService->vote($employee, $quickMatch, $validated['option_id']);

        return back()->with('success', 'تم تسجيل تصويتك.');
    }

    /**
     * Convert a quick match into an event.
     */
    public function convert(QuickMatch $quickMatch): RedirectResponse
    {
        $employee = auth('employee')->user();

        if ($quickMatch->status !== 'open') {
            return back()->with('error', 'هذا التصويت لم يعد متاحاً.');
        }

        // Only creator or community leader can convert
        $community = $quickMatch->community;
        $isCreator = $quickMatch->created_by === $employee->id;
        $isLeader = $community->leader_id === $employee->id;

        if (! $isCreator && ! $isLeader) {
            return back()->with('error', 'يمكن فقط لمنشئ التصويت أو قائد المجتمع التحويل.');
        }

        $redirectUrl = $this->quickMatchService->convert($quickMatch);

        return redirect($redirectUrl)->with('success', 'تم تحويل التصويت. أنشئ الفعالية الآن.');
    }
}

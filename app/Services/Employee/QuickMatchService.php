<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\QuickMatch;
use App\Models\QuickMatchOption;
use App\Models\QuickMatchVote;
use App\Support\Notify;
use Illuminate\Database\Eloquent\Collection;

class QuickMatchService
{
    /**
     * Get open quick matches for an employee's communities.
     */
    public function getForEmployee(Employee $employee): Collection
    {
        $communityIds = $employee->communities()->pluck('communities.id');

        return QuickMatch::query()
            ->with(['community.category', 'creator', 'options'])
            ->withCount('votes')
            ->open()
            ->whereIn('community_id', $communityIds)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->each(function (QuickMatch $match) use ($employee) {
                $vote = $match->votes()->where('employee_id', $employee->id)->first();
                $match->setAttribute('my_vote_option_id', $vote?->option_id);
                // Leadership via role_assignments (A5) — no leader_id column.
                $match->setAttribute('viewer_is_leader', $match->community?->isLeader($employee) ?? false);
            });
    }

    /**
     * Create a new quick match with poll options.
     */
    public function create(Employee $employee, array $data): QuickMatch
    {
        $quickMatch = QuickMatch::create([
            'community_id' => $data['community_id'],
            'created_by' => $employee->id,
            'message' => $data['message'] ?? null,
            'source' => 'manual',
            'status' => 'open',
        ]);

        foreach ($data['options'] as $i => $option) {
            QuickMatchOption::create([
                'quick_match_id' => $quickMatch->id,
                'date' => $option['date'],
                'time' => $option['time'],
                'sort_order' => $i,
            ]);
        }

        $this->notifyCommunityMembers($quickMatch, $employee->id);

        return $quickMatch;
    }

    /**
     * Vote on a quick match option. Replaces previous vote if any.
     */
    public function vote(Employee $employee, QuickMatch $quickMatch, int $optionId): void
    {
        $existing = QuickMatchVote::where('quick_match_id', $quickMatch->id)
            ->where('employee_id', $employee->id)
            ->first();

        if ($existing) {
            // Decrement old option count
            QuickMatchOption::where('id', $existing->option_id)->decrement('votes_count');
            $existing->delete();
        }

        QuickMatchVote::create([
            'quick_match_id' => $quickMatch->id,
            'option_id' => $optionId,
            'employee_id' => $employee->id,
        ]);

        QuickMatchOption::where('id', $optionId)->increment('votes_count');
    }

    /**
     * Convert a quick match to an event using the winning option.
     */
    public function convert(QuickMatch $quickMatch): string
    {
        $quickMatch->update(['status' => 'converted']);

        $winningOption = $quickMatch->options()->orderByDesc('votes_count')->first();

        $params = 'community_id='.$quickMatch->community_id.'&quick_match_id='.$quickMatch->id;
        if ($winningOption) {
            $params .= '&date='.$winningOption->date->format('Y-m-d').'&time='.$winningOption->time;
        }

        return '/employee/create?'.$params;
    }

    /**
     * Get voter employee IDs for a quick match (for auto-joining on event creation).
     */
    public function getVoterIds(QuickMatch $quickMatch): \Illuminate\Support\Collection
    {
        return $quickMatch->votes()->pluck('employee_id');
    }

    /**
     * Notify community members about a new quick match.
     */
    public function notifyCommunityMembers(QuickMatch $quickMatch, ?int $excludeEmployeeId = null): void
    {
        $community = $quickMatch->community;
        $memberIds = $community->members()->pluck('employees.id');

        if ($excludeEmployeeId) {
            $memberIds = $memberIds->filter(fn ($id) => $id !== $excludeEmployeeId);
        }

        Notify::sendToIds(
            'engagement.quick_match',
            Employee::class,
            $memberIds,
            [
                'community' => $community->name,
                'message' => $quickMatch->message ?? 'صوّت على الوقت المناسب!',
            ],
            ['data' => [
                'community_id' => $community->id,
                'quick_match_id' => $quickMatch->id,
            ]],
        );
    }
}

<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\Notification;
use App\Models\QuickMatch;
use App\Models\QuickMatchOption;
use App\Models\QuickMatchVote;
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

        $params = 'community_id=' . $quickMatch->community_id . '&quick_match_id=' . $quickMatch->id;
        if ($winningOption) {
            $params .= '&date=' . $winningOption->date->format('Y-m-d') . '&time=' . $winningOption->time;
        }

        return '/employee/create?' . $params;
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

        $notifications = $memberIds->map(fn ($memberId) => [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'notifiable_type' => Employee::class,
            'notifiable_id' => $memberId,
            'type' => 'quick_match',
            'title' => "تصويت جديد في {$community->name}",
            'body' => $quickMatch->message ?? 'صوّت على الموعد المناسب!',
            'data' => json_encode([
                'community_id' => $community->id,
                'quick_match_id' => $quickMatch->id,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        if (! empty($notifications)) {
            Notification::insert($notifications);
        }
    }
}

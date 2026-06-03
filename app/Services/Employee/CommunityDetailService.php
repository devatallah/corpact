<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\CommunityPoll;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Notification;
use App\Models\PollOption;
use App\Models\PollVote;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CommunityDetailService
{
    /**
     * Get full community details.
     */
    public function getDetail(Community $community): Community
    {
        return $community->load(['category', 'leader', 'company']);
    }

    /**
     * Get community events with optional status filter.
     *
     * @param  array{status?: string, per_page?: int}  $filters
     */
    public function events(Community $community, array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['business', 'category', 'creator'])
            ->where('community_id', $community->id)
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->latest('event_date')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Get community announcements.
     */
    public function announcements(Community $community, int $limit = 20): Collection
    {
        return CommunityAnnouncement::query()
            ->with('employee')
            ->where('community_id', $community->id)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get community members.
     */
    public function members(Community $community): Collection
    {
        return $community->members()
            ->with('department')
            ->orderByPivot('role', 'asc')
            ->orderByPivot('joined_at', 'asc')
            ->get();
    }

    /**
     * Get community polls with options and vote counts.
     */
    public function polls(Community $community, Employee $employee): Collection
    {
        return CommunityPoll::query()
            ->with(['creator', 'options' => function ($query) {
                $query->withCount('votes')->orderBy('sort_order');
            }])
            ->where('community_id', $community->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(function (CommunityPoll $poll) use ($employee) {
                $poll->setAttribute('my_vote', PollVote::where('poll_id', $poll->id)
                    ->where('employee_id', $employee->id)
                    ->value('option_id'));
                $poll->setAttribute('total_votes', $poll->options->sum('votes_count'));
                return $poll;
            });
    }

    /**
     * Create a poll (leader/captain only).
     */
    public function createPoll(Community $community, Employee $employee, string $question, array $options, ?string $expiresAt): CommunityPoll
    {
        if ($community->leader_id !== $employee->id) {
            $pivotRole = $community->members()
                ->where('employee_id', $employee->id)
                ->first()
                ?->pivot
                ?->role;

            if ($pivotRole !== 'captain') {
                throw new AuthorizationException('Only community leaders or captains can create polls.');
            }
        }

        $poll = CommunityPoll::create([
            'community_id' => $community->id,
            'employee_id' => $employee->id,
            'question' => $question,
            'expires_at' => $expiresAt,
            'status' => 'active',
        ]);

        foreach ($options as $index => $label) {
            PollOption::create([
                'poll_id' => $poll->id,
                'label' => $label,
                'sort_order' => $index,
            ]);
        }

        // Notify community members
        $community->load('members');
        foreach ($community->members as $member) {
            if ($member->id === $employee->id) {
                continue;
            }
            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $member->id,
                'type' => 'poll',
                'title' => "تصويت جديد في {$community->name}",
                'body' => mb_substr($question, 0, 100),
                'data' => ['community_id' => $community->id, 'poll_id' => $poll->id],
            ]);
        }

        return $poll;
    }

    /**
     * Cast a vote on a poll.
     */
    public function votePoll(Community $community, Employee $employee, CommunityPoll $poll, int $optionId): PollVote
    {
        // Ensure poll belongs to community
        if ($poll->community_id !== $community->id) {
            throw new AuthorizationException('Poll does not belong to this community.');
        }

        // Ensure poll is active
        if ($poll->status !== 'active') {
            throw new AuthorizationException('هذا التصويت مغلق.');
        }

        // Ensure poll is not expired
        if ($poll->expires_at && $poll->expires_at->isPast()) {
            throw new AuthorizationException('هذا التصويت منتهي.');
        }

        // Ensure employee is a member
        $isMember = $community->members()->where('employee_id', $employee->id)->exists();
        if (!$isMember && $community->leader_id !== $employee->id) {
            throw new AuthorizationException('يجب أن تكون عضوا في المجتمع للتصويت.');
        }

        // Ensure not already voted
        $existingVote = PollVote::where('poll_id', $poll->id)->where('employee_id', $employee->id)->first();
        if ($existingVote) {
            throw new AuthorizationException('لقد صوتت مسبقا في هذا التصويت.');
        }

        // Ensure option belongs to poll
        $optionExists = PollOption::where('id', $optionId)->where('poll_id', $poll->id)->exists();
        if (!$optionExists) {
            throw new AuthorizationException('الخيار غير صالح.');
        }

        return PollVote::create([
            'poll_id' => $poll->id,
            'option_id' => $optionId,
            'employee_id' => $employee->id,
        ]);
    }

    /**
     * Close a poll (creator/leader only).
     */
    public function closePoll(Community $community, Employee $employee, CommunityPoll $poll): void
    {
        if ($poll->community_id !== $community->id) {
            throw new AuthorizationException('Poll does not belong to this community.');
        }

        if ($poll->employee_id !== $employee->id && $community->leader_id !== $employee->id) {
            $pivotRole = $community->members()
                ->where('employee_id', $employee->id)
                ->first()
                ?->pivot
                ?->role;

            if ($pivotRole !== 'captain') {
                throw new AuthorizationException('Only the poll creator, community leader, or captains can close polls.');
            }
        }

        $poll->update(['status' => 'closed']);
    }

    /**
     * Post an announcement (leader/captain only).
     */
    public function postAnnouncement(Community $community, Employee $employee, string $body): CommunityAnnouncement
    {
        if ($community->leader_id !== $employee->id) {
            $pivotRole = $community->members()
                ->where('employee_id', $employee->id)
                ->first()
                ?->pivot
                ?->role;

            if ($pivotRole !== 'captain') {
                throw new AuthorizationException('Only community leaders or captains can post announcements.');
            }
        }

        $announcement = CommunityAnnouncement::create([
            'community_id' => $community->id,
            'employee_id' => $employee->id,
            'body' => $body,
        ]);

        $community->load('members');
        foreach ($community->members as $member) {
            if ($member->id === $employee->id) {
                continue;
            }
            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $member->id,
                'type' => 'announcement',
                'title' => "إعلان جديد في {$community->name}",
                'body' => mb_substr($body, 0, 100),
                'data' => ['community_id' => $community->id],
            ]);
        }

        return $announcement;
    }
}

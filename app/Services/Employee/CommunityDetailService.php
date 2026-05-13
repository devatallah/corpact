<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Notification;
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
        return $community->load(['sport', 'leader', 'company']);
    }

    /**
     * Get community events with optional status filter.
     *
     * @param  array{status?: string, per_page?: int}  $filters
     */
    public function events(Community $community, array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['club', 'sport', 'creator'])
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

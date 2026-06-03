<?php

namespace App\Services\Company;

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Services\ActivityLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommunityService
{
    /**
     * List all communities for a company.
     */
    public function listForCompany(Company $company): Collection
    {
        return Community::query()
            ->with(['category', 'leader'])
            ->where('company_id', $company->id)
            ->withCount('members')
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new community for a company.
     *
     * @param  array{name: string, category_id: int, leader_id: int, description?: string}  $data
     */
    public function create(Company $company, array $data): Community
    {
        $leader = Employee::query()
            ->where('id', $data['leader_id'])
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->first();

        if (! $leader) {
            throw ValidationException::withMessages([
                'leader_id' => ['The selected leader must be an active employee of the company.'],
            ]);
        }

        return DB::transaction(function () use ($company, $data, $leader) {
            $community = Community::create([
                'company_id' => $company->id,
                'category_id' => $data['category_id'],
                'leader_id' => $leader->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'balance' => 0,
                'member_count' => 1,
            ]);

            $community->members()->attach($leader->id, [
                'role' => 'captain',
                'joined_at' => now(),
            ]);

            ActivityLogService::log(
                $company->id,
                $community,
                'community_created',
                "تم إنشاء مجتمع '{$community->name}'",
            );

            return $community->fresh(['category', 'leader']);
        });
    }

    /**
     * Change the leader of a community.
     */
    public function changeLeader(Company $company, Community $community, Employee $newLeader): Community
    {
        if ($community->company_id !== $company->id) {
            throw new AuthorizationException('هذا المجتمع لا يتبع شركتك.');
        }

        if ($newLeader->company_id !== $company->id || $newLeader->status !== 'active') {
            throw ValidationException::withMessages([
                'leader_id' => ['The new leader must be an active employee of the company.'],
            ]);
        }

        return DB::transaction(function () use ($community, $newLeader) {
            $oldLeaderId = $community->leader_id;

            // Demote old leader to member if they are in the community
            if ($community->members()->where('employee_id', $oldLeaderId)->exists()) {
                $community->members()->updateExistingPivot($oldLeaderId, ['role' => 'member']);
            }

            // Promote new leader; add to community if not a member
            if ($community->members()->where('employee_id', $newLeader->id)->exists()) {
                $community->members()->updateExistingPivot($newLeader->id, ['role' => 'captain']);
            } else {
                $community->members()->attach($newLeader->id, [
                    'role' => 'captain',
                    'joined_at' => now(),
                ]);
                $community->increment('member_count');
            }

            $community->update(['leader_id' => $newLeader->id]);

            return $community->fresh(['category', 'leader']);
        });
    }

    /**
     * Get statistics for a specific community.
     *
     * @return array{member_count: int, total_events: int, completed_events: int, balance: float, upcoming_events: int}
     */
    public function communityStats(Community $community): array
    {
        $totalEvents = $community->events()->count();
        $completedEvents = $community->events()->where('status', 'completed')->count();
        $upcomingEvents = $community->events()
            ->whereIn('status', ['open', 'full', 'confirmed'])
            ->where('event_date', '>=', now())
            ->count();

        return [
            'member_count' => $community->member_count,
            'total_events' => $totalEvents,
            'completed_events' => $completedEvents,
            'upcoming_events' => $upcomingEvents,
            'balance' => (float) $community->balance,
        ];
    }
}

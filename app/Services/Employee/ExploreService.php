<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExploreService
{
    /**
     * List available communities that the employee can join within their company.
     */
    public function availableCommunities(Employee $employee): Collection
    {
        return Community::query()
            ->with(['category', 'leader'])
            ->where('company_id', $employee->company_id)
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(function (Community $community) use ($employee) {
                $community->setAttribute(
                    'is_member',
                    $community->members()->where('employee_id', $employee->id)->exists()
                );

                return $community;
            });
    }

    /**
     * Join a community.
     */
    public function joinCommunity(Employee $employee, Community $community): void
    {
        if ($community->company_id !== $employee->company_id) {
            throw ValidationException::withMessages([
                'community' => ['You can only join communities within your company.'],
            ]);
        }

        $alreadyMember = $community->members()
            ->where('employee_id', $employee->id)
            ->exists();

        if ($alreadyMember) {
            throw ValidationException::withMessages([
                'community' => ['You are already a member of this community.'],
            ]);
        }

        DB::transaction(function () use ($community, $employee) {
            $community->members()->attach($employee->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);

            $community->increment('member_count');
        });
    }

    /**
     * Leave a community.
     */
    public function leaveCommunity(Employee $employee, Community $community): void
    {
        if ($community->leader_id === $employee->id) {
            throw ValidationException::withMessages([
                'community' => ['Community leaders cannot leave. Transfer leadership first.'],
            ]);
        }

        $isMember = $community->members()
            ->where('employee_id', $employee->id)
            ->exists();

        if (! $isMember) {
            throw ValidationException::withMessages([
                'community' => ['You are not a member of this community.'],
            ]);
        }

        DB::transaction(function () use ($community, $employee) {
            $community->members()->detach($employee->id);
            $community->decrement('member_count');
        });
    }
}

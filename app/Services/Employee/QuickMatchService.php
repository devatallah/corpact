<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\Notification;
use App\Models\QuickMatch;
use App\Models\QuickMatchInterest;
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
            ->with(['community.sport', 'creator'])
            ->withCount('interests')
            ->open()
            ->whereIn('community_id', $communityIds)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->each(function (QuickMatch $match) use ($employee) {
                $match->setAttribute('is_interested', $match->interests()
                    ->where('employee_id', $employee->id)
                    ->exists());
            });
    }

    /**
     * Create a new quick match.
     */
    public function create(Employee $employee, array $data): QuickMatch
    {
        $quickMatch = QuickMatch::create([
            'community_id' => $data['community_id'],
            'created_by' => $employee->id,
            'preferred_date' => $data['preferred_date'] ?? null,
            'preferred_time' => $data['preferred_time'] ?? null,
            'message' => $data['message'] ?? null,
            'source' => 'manual',
            'status' => 'open',
        ]);

        // Notify community members (excluding creator)
        $this->notifyCommunityMembers($quickMatch, $employee->id);

        return $quickMatch;
    }

    /**
     * Toggle interest on a quick match. Returns whether the employee is now interested.
     */
    public function toggleInterest(Employee $employee, QuickMatch $quickMatch): bool
    {
        $existing = QuickMatchInterest::where('quick_match_id', $quickMatch->id)
            ->where('employee_id', $employee->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return false;
        }

        QuickMatchInterest::create([
            'quick_match_id' => $quickMatch->id,
            'employee_id' => $employee->id,
        ]);

        return true;
    }

    /**
     * Convert a quick match to an event.
     */
    public function convert(QuickMatch $quickMatch): string
    {
        $quickMatch->update(['status' => 'converted']);

        return '/employee/create?community_id=' . $quickMatch->community_id . '&quick_match_id=' . $quickMatch->id;
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
            'title' => "لعبة سريعة في {$community->name}",
            'body' => $quickMatch->message ?? 'مين يبي يلعب؟',
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

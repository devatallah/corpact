<?php

namespace App\Services\Employee;

use App\Models\Challenge;
use App\Models\ChallengeProgress;
use App\Models\Employee;

class ChallengeService
{
    /**
     * Get active challenges with the employee's progress.
     *
     * @return array<int, array{id: int, title: string, description: string|null, type: string, target_count: int, current_count: int, completed_at: string|null, percentage: int}>
     */
    public function getActiveChallenges(Employee $employee): array
    {
        $challenges = Challenge::query()
            ->active()
            ->current()
            ->where(function ($q) use ($employee) {
                $q->whereNull('company_id')
                    ->orWhere('company_id', $employee->company_id);
            })
            ->get();

        if ($challenges->isEmpty()) {
            return [];
        }

        $progressMap = ChallengeProgress::query()
            ->where('employee_id', $employee->id)
            ->whereIn('challenge_id', $challenges->pluck('id'))
            ->get()
            ->keyBy('challenge_id');

        return $challenges->map(function (Challenge $challenge) use ($progressMap) {
            $progress = $progressMap->get($challenge->id);
            $currentCount = $progress?->current_count ?? 0;
            $percentage = $challenge->target_count > 0
                ? min(100, (int) round(($currentCount / $challenge->target_count) * 100))
                : 0;

            return [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'description' => $challenge->description,
                'type' => $challenge->type,
                'target_count' => $challenge->target_count,
                'current_count' => $currentCount,
                'completed_at' => $progress?->completed_at?->toIso8601String(),
                'percentage' => $percentage,
            ];
        })->values()->all();
    }

    /**
     * Increment progress for all active challenges matching the given type.
     */
    public function incrementProgress(Employee $employee, string $type): void
    {
        $challenges = Challenge::query()
            ->active()
            ->current()
            ->where('type', $type)
            ->where(function ($q) use ($employee) {
                $q->whereNull('company_id')
                    ->orWhere('company_id', $employee->company_id);
            })
            ->get();

        foreach ($challenges as $challenge) {
            $progress = ChallengeProgress::firstOrCreate(
                [
                    'challenge_id' => $challenge->id,
                    'employee_id' => $employee->id,
                ],
                [
                    'current_count' => 0,
                    'completed_at' => null,
                ]
            );

            // Don't increment if already completed
            if ($progress->completed_at !== null) {
                continue;
            }

            $progress->increment('current_count');
            $progress->refresh();

            if ($progress->current_count >= $challenge->target_count) {
                $progress->update(['completed_at' => now()]);
            }
        }
    }
}

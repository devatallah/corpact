<?php

namespace App\Services\Admin;

use App\Models\Club;
use App\Notifications\ClubApprovedNotification;
use App\Services\ActivityLogService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClubService
{
    /**
     * List clubs with optional filters.
     *
     * @param  array{status?: string, search?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        return Club::query()
            ->with(['sports', 'courts'])
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['search'].'%')
                  ->orWhere('city', 'like', '%'.$filters['search'].'%')
                  ->orWhere('district', 'like', '%'.$filters['search'].'%')
                  ->orWhere('email', 'like', '%'.$filters['search'].'%')
                  ->orWhere('contact_phone', 'like', '%'.$filters['search'].'%')
                  ->orWhereHas('sports', fn ($s) => $s->where('name', 'like', '%'.$filters['search'].'%'));
            }))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Approve a club application.
     */
    public function approve(Club $club): Club
    {
        if ($club->status === 'active') {
            throw new \LogicException('النادي مفعّل بالفعل.');
        }

        return DB::transaction(function () use ($club) {
            $token = Str::random(64);

            $club->update([
                'status' => 'active',
                'approved_at' => now(),
                'activation_token' => $token,
            ]);

            ActivityLogService::log(
                null,
                $club,
                'club_approved',
                "تمت الموافقة على نادي '{$club->name}'",
            );

            $activationUrl = url("/club/activate/{$token}");
            $club->notify(new ClubApprovedNotification($activationUrl));

            return $club->fresh();
        });
    }

    /**
     * Reject a club application.
     */
    public function reject(Club $club): Club
    {
        if ($club->status === 'rejected') {
            throw new \LogicException('النادي مرفوض بالفعل.');
        }

        $club->update(['status' => 'rejected']);

        ActivityLogService::log(
            null,
            $club,
            'club_rejected',
            "تم رفض نادي '{$club->name}'",
        );

        return $club->fresh();
    }

    /**
     * Get dashboard statistics for clubs grouped by status.
     *
     * @return array{total: int, pending: int, active: int, rejected: int, suspended: int}
     */
    public function dashboardStats(): array
    {
        $counts = Club::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'total' => array_sum($counts),
            'pending' => $counts['pending'] ?? 0,
            'active' => $counts['active'] ?? 0,
            'rejected' => $counts['rejected'] ?? 0,
            'suspended' => $counts['suspended'] ?? 0,
        ];
    }
}

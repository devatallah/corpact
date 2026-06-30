<?php

namespace App\Services\Admin;

use App\Models\Business;
use App\Notifications\BusinessApprovedNotification;
use App\Services\ActivityLogService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BusinessService
{
    /**
     * List businesss with optional filters.
     *
     * @param  array{status?: string, search?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        return Business::query()
            ->whereNull('parent_id')
            ->with(['categories', 'venues'])
            ->withCount('staff')
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['search'].'%')
                  ->orWhere('city', 'like', '%'.$filters['search'].'%')
                  ->orWhere('district', 'like', '%'.$filters['search'].'%')
                  ->orWhere('email', 'like', '%'.$filters['search'].'%')
                  ->orWhere('contact_phone', 'like', '%'.$filters['search'].'%')
                  ->orWhereHas('categories', fn ($s) => $s->where('name', 'like', '%'.$filters['search'].'%'));
            }))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Approve a business application.
     */
    public function approve(Business $business, ?float $commissionRate = null): Business
    {
        if ($business->status === 'active') {
            throw new \LogicException('مزود الخدمة مفعّل بالفعل.');
        }

        return DB::transaction(function () use ($business, $commissionRate) {
            $token = Str::random(64);

            $updateData = [
                'status' => 'active',
                'approved_at' => now(),
                'activation_token' => $token,
                'activation_token_expires_at' => now()->addHours(72),
            ];

            if ($commissionRate !== null) {
                $updateData['commission_rate'] = $commissionRate;
            }

            $business->update($updateData);

            ActivityLogService::log(
                null,
                $business,
                'business_approved',
                "تمت الموافقة على مزود خدمة '{$business->name}'",
            );

            $activationUrl = url("/business/activate/{$token}");
            $business->notify(new BusinessApprovedNotification($activationUrl));

            return $business->fresh();
        });
    }

    /**
     * Reject a business application.
     */
    public function reject(Business $business): Business
    {
        if ($business->status === 'rejected') {
            throw new \LogicException('مزود الخدمة مرفوض بالفعل.');
        }

        $business->update(['status' => 'rejected']);

        ActivityLogService::log(
            null,
            $business,
            'business_rejected',
            "تم رفض مزود خدمة '{$business->name}'",
        );

        return $business->fresh();
    }

    /**
     * Get dashboard statistics for businesss grouped by status.
     *
     * @return array{total: int, pending: int, active: int, rejected: int, suspended: int}
     */
    public function dashboardStats(): array
    {
        $counts = Business::query()
            ->whereNull('parent_id')
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

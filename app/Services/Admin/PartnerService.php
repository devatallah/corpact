<?php

namespace App\Services\Admin;

use App\Models\Partner;
use App\Notifications\PartnerApprovedNotification;
use App\Services\ActivityLogService;
use App\Support\Lists\ListSort;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PartnerService
{
    /**
     * الأعمدة المسموح الترتيب بها — كلها معروضة في جدول الشاشة أصلاً (H §18).
     * `staff_count` تجميع موجود في الاستعلام (`withCount('staff')`) و
     * `venues_count` عمود حقيقي على `partners`. الفئات علاقة فلا مفتاح لها.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'city' => 'city',
            'venues_count' => 'venues_count',
            'commission_rate' => 'commission_rate',
            'staff_count' => 'staff_count',
            'status' => 'status',
            'created_at' => 'created_at',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * List partners with optional filters.
     *
     * @param  array{status?: string, search?: string, sort?: string, dir?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Partner::query()
            ->whereNull('parent_id')
            ->with(['categories', 'venues'])
            // الفروع والوحدات تقيس الطاقة الفعلية للمزوّد — المرافق وحدها لا
            // تقولها، فالمرفق بلا وحدة نشطة لا يُحجز.
            ->withCount(['staff', 'branches'])
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('city', 'like', '%'.$filters['search'].'%')
                    ->orWhere('district', 'like', '%'.$filters['search'].'%')
                    ->orWhere('email', 'like', '%'.$filters['search'].'%')
                    ->orWhere('contact_phone', 'like', '%'.$filters['search'].'%')
                    ->orWhereHas('categories', fn ($s) => $s->where('name', 'like', '%'.$filters['search'].'%'));
            }));

        return self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
    }

    /**
     * Approve a partner application.
     */
    public function approve(Partner $partner, ?float $commissionRate = null): Partner
    {
        if ($partner->status === 'active') {
            throw new \LogicException('الشريك مفعّل بالفعل.');
        }

        return DB::transaction(function () use ($partner, $commissionRate) {
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

            $partner->update($updateData);

            ActivityLogService::log(
                null,
                $partner,
                'partner_approved',
                "تمت الموافقة على شريك '{$partner->name}'",
            );

            $activationUrl = url("/partner/activate/{$token}");
            $partner->notify(new PartnerApprovedNotification($activationUrl));

            return $partner->fresh();
        });
    }

    /**
     * Reject a partner application.
     */
    public function reject(Partner $partner): Partner
    {
        if ($partner->status === 'rejected') {
            throw new \LogicException('الشريك مرفوض بالفعل.');
        }

        $partner->update(['status' => 'rejected']);

        ActivityLogService::log(
            null,
            $partner,
            'partner_rejected',
            "تم رفض شريك '{$partner->name}'",
        );

        return $partner->fresh();
    }

    /**
     * Get dashboard statistics for partners grouped by status.
     *
     * @return array{total: int, pending: int, active: int, rejected: int, suspended: int}
     */
    public function dashboardStats(): array
    {
        $counts = Partner::query()
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

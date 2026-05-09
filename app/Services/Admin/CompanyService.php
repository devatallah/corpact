<?php

namespace App\Services\Admin;

use App\Models\Company;
use App\Notifications\CompanyApprovedNotification;
use App\Services\ActivityLogService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompanyService
{
    /**
     * List companies with optional filters.
     *
     * @param  array{status?: string, search?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        return Company::query()
            ->with('employees')
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['search']), fn ($query) => $query->where('name', 'like', '%'.$filters['search'].'%'))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Approve a company application.
     */
    public function approve(Company $company): Company
    {
        if ($company->status === 'active') {
            throw new \LogicException('الشركة مفعّلة بالفعل.');
        }

        return DB::transaction(function () use ($company) {
            $token = Str::random(64);

            $company->update([
                'status' => 'active',
                'approved_at' => Carbon::now(),
                'activation_token' => $token,
            ]);

            ActivityLogService::log(
                $company->id,
                $company,
                'company_approved',
                "تمت الموافقة على شركة '{$company->name}'",
            );

            $activationUrl = url("/company/activate/{$token}");
            $company->notify(new CompanyApprovedNotification($activationUrl));

            return $company->fresh();
        });
    }

    /**
     * Reject a company application.
     */
    public function reject(Company $company): Company
    {
        if ($company->status === 'rejected') {
            throw new \LogicException('الشركة مرفوضة بالفعل.');
        }

        $company->update(['status' => 'rejected']);

        ActivityLogService::log(
            $company->id,
            $company,
            'company_rejected',
            "تم رفض شركة '{$company->name}'",
        );

        return $company->fresh();
    }

    /**
     * Get dashboard statistics for companies grouped by status.
     *
     * @return array{total: int, pending: int, review: int, active: int, rejected: int}
     */
    public function dashboardStats(): array
    {
        $counts = Company::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'total' => array_sum($counts),
            'pending' => $counts['pending'] ?? 0,
            'review' => $counts['review'] ?? 0,
            'active' => $counts['active'] ?? 0,
            'rejected' => $counts['rejected'] ?? 0,
        ];
    }
}

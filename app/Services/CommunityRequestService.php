<?php

namespace App\Services;

use App\Models\Community;
use App\Models\CommunityRequest;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Notification;
use App\Services\Company\CommunityService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommunityRequestService
{
    public function __construct(
        private CommunityService $communityService,
    ) {}

    /**
     * Submit a new community creation request from an employee.
     *
     * @param  array{name: string, category_id: int, description?: string, reason?: string}  $data
     */
    public function submit(Employee $employee, array $data): CommunityRequest
    {
        // Check for duplicate pending request with the same name in the same company
        $exists = CommunityRequest::query()
            ->where('company_id', $employee->company_id)
            ->where('name', $data['name'])
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'name' => ['يوجد طلب معلق بنفس اسم المجتمع.'],
            ]);
        }

        $request = CommunityRequest::create([
            'company_id' => $employee->company_id,
            'employee_id' => $employee->id,
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
        ]);

        // Notify the company about the new request
        Notification::create([
            'notifiable_type' => Company::class,
            'notifiable_id' => $employee->company_id,
            'type' => 'community_request',
            'title' => 'طلب إنشاء مجتمع جديد',
            'body' => "قام {$employee->name} بطلب إنشاء مجتمع '{$data['name']}'.",
            'data' => ['community_request_id' => $request->id],
        ]);

        return $request->load(['employee', 'category']);
    }

    /**
     * List community requests for an employee.
     */
    public function listForEmployee(Employee $employee): Collection
    {
        return CommunityRequest::query()
            ->with(['category', 'community'])
            ->where('employee_id', $employee->id)
            ->latest()
            ->get();
    }

    /**
     * List community requests for a company.
     */
    public function listForCompany(Company $company): Collection
    {
        return CommunityRequest::query()
            ->with(['employee', 'category', 'community'])
            ->where('company_id', $company->id)
            ->latest()
            ->get();
    }

    /**
     * Approve a community request and create the community.
     */
    public function approve(Company $company, CommunityRequest $communityRequest): Community
    {
        if ($communityRequest->company_id !== $company->id) {
            throw ValidationException::withMessages([
                'request' => ['هذا الطلب لا يتبع شركتك.'],
            ]);
        }

        if ($communityRequest->status !== 'pending') {
            throw ValidationException::withMessages([
                'request' => ['تمت معالجة هذا الطلب مسبقاً.'],
            ]);
        }

        return DB::transaction(function () use ($company, $communityRequest) {
            // Create the community using existing service, with requester as leader
            $community = $this->communityService->create($company, [
                'name' => $communityRequest->name,
                'description' => $communityRequest->description,
                'category_id' => $communityRequest->category_id,
                'leader_id' => $communityRequest->employee_id,
            ]);

            $communityRequest->update([
                'status' => 'approved',
                'reviewed_by' => $company->id,
                'reviewed_at' => now(),
                'community_id' => $community->id,
            ]);

            // Notify the employee
            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $communityRequest->employee_id,
                'type' => 'community_request_approved',
                'title' => 'تمت الموافقة على طلبك',
                'body' => "تمت الموافقة على طلب إنشاء مجتمع '{$communityRequest->name}'.",
                'data' => [
                    'community_request_id' => $communityRequest->id,
                    'community_id' => $community->id,
                ],
            ]);

            ActivityLogService::log(
                $company->id,
                $communityRequest,
                'community_request_approved',
                "تمت الموافقة على طلب إنشاء مجتمع '{$communityRequest->name}'",
            );

            return $community;
        });
    }

    /**
     * Reject a community request.
     */
    public function reject(Company $company, CommunityRequest $communityRequest, ?string $rejectionReason = null): CommunityRequest
    {
        if ($communityRequest->company_id !== $company->id) {
            throw ValidationException::withMessages([
                'request' => ['هذا الطلب لا يتبع شركتك.'],
            ]);
        }

        if ($communityRequest->status !== 'pending') {
            throw ValidationException::withMessages([
                'request' => ['تمت معالجة هذا الطلب مسبقاً.'],
            ]);
        }

        $communityRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $rejectionReason,
            'reviewed_by' => $company->id,
            'reviewed_at' => now(),
        ]);

        // Notify the employee
        $body = "تم رفض طلب إنشاء مجتمع '{$communityRequest->name}'.";
        if ($rejectionReason) {
            $body .= " السبب: {$rejectionReason}";
        }

        Notification::create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $communityRequest->employee_id,
            'type' => 'community_request_rejected',
            'title' => 'تم رفض طلبك',
            'body' => $body,
            'data' => ['community_request_id' => $communityRequest->id],
        ]);

        ActivityLogService::log(
            $company->id,
            $communityRequest,
            'community_request_rejected',
            "تم رفض طلب إنشاء مجتمع '{$communityRequest->name}'",
        );

        return $communityRequest->fresh(['employee', 'category']);
    }
}

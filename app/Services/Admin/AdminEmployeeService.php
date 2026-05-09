<?php

namespace App\Services\Admin;

use App\Models\Employee;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEmployeeService
{
    /**
     * List all employees across companies with optional filters.
     *
     * @param  array{company_id?: int, status?: string, search?: string, department?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        return Employee::query()
            ->with(['company'])
            ->withCount(['communities', 'events'])
            ->when(isset($filters['company_id']), fn ($query) => $query->where('company_id', $filters['company_id']))
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['department']), fn ($query) => $query->where('department', $filters['department']))
            ->when(isset($filters['search']), fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('email', 'like', '%'.$filters['search'].'%')
            ))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }
}

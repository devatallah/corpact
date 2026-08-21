<?php

namespace App\Services\Admin;

use App\Models\Employee;
use App\Support\Lists\ListSort;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEmployeeService
{
    /**
     * الأعمدة المسموح الترتيب بها — كلها معروضة في جدول الشاشة أصلاً، فالترتيب
     * لا يكشف شيئاً جديداً (H §18).
     *
     * A13: رقم هاتف الموظف يراه مسؤول الحساب وحده، وأدمن المنصة ليس مسؤول
     * الحساب — فالعمود غير معروض هنا ولا يدخل القائمة البيضاء لا ترتيباً ولا
     * بحثاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'communities_count' => 'communities_count',
            'events_count' => 'events_count',
            'created_at' => 'created_at',
            'status' => 'status',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * List all employees across companies with optional filters.
     *
     * @param  array{company_id?: int, status?: string, search?: string, department?: string, sort?: string, dir?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Employee::query()
            ->with(['company', 'department'])
            ->withCount(['communities', 'events'])
            ->when(isset($filters['company_id']), fn ($query) => $query->where('company_id', $filters['company_id']))
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['department_id']), fn ($query) => $query->where('department_id', $filters['department_id']))
            ->when(isset($filters['search']), fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('email', 'like', '%'.$filters['search'].'%')
            ));

        return self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
    }
}

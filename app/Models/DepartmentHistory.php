<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * `department_history` (H §5): dated intervals of department membership.
 * Historical reports attribute an employee to the department AT EVENT TIME —
 * use {@see self::departmentIdAt()} (or `Employee::departmentAt()`), never
 * the current `employees.department_id`.
 */
#[Fillable([
    'company_id',
    'employee_id',
    'department_id',
    'started_at',
    'ended_at',
    'changed_by_user_id',
])]
class DepartmentHistory extends Model
{
    use HasFactory, ScopedToCompany;

    protected $table = 'department_history';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * The department the employee belonged to at a moment in time — the
     * helper A13's historical reports build on. Null = no department then
     * (or the employee did not exist yet).
     */
    public static function departmentIdAt(int $employeeId, DateTimeInterface $at): ?int
    {
        /** @var self|null $interval */
        $interval = static::query()
            ->where('employee_id', $employeeId)
            ->where('started_at', '<=', $at)
            ->where(fn ($q) => $q->whereNull('ended_at')->orWhere('ended_at', '>', $at))
            ->orderByDesc('started_at')
            ->orderByDesc('id')
            ->first();

        return $interval?->department_id;
    }

    /**
     * Same lookup resolved to the Department model (unscoped read — history
     * consumers pass an employee they already resolved inside their scope).
     */
    public static function departmentAt(int $employeeId, DateTimeInterface $at): ?Department
    {
        $departmentId = static::departmentIdAt($employeeId, $at);

        return $departmentId === null
            ? null
            : Department::withoutGlobalScopes()->find($departmentId);
    }
}

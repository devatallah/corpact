<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * H §4: links a global user to a company with department, join date and
 * status. Deliberately NOT company-scoped — a membership is identity-level
 * data that spans companies.
 */
#[Fillable(['user_id', 'company_id', 'employee_id', 'department_id', 'status', 'joined_at', 'left_at'])]
class CompanyMembership extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'left_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Legacy portal profile row backing this membership.
     *
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class)->withoutGlobalScopes();
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Memberships that departed inside a billing cycle (H §5): the departed
     * employee still counts in that cycle's system-fee invoice if activated
     * before leaving. A11 combines this with the activation criterion
     * (participated in a completed event during the cycle, not absent).
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeDepartedBetween($query, \DateTimeInterface $start, \DateTimeInterface $end)
    {
        return $query->whereNotNull('left_at')->whereBetween('left_at', [$start, $end]);
    }
}

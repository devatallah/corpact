<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'invited_by',
    'email',
    'name',
    'phone',
    'department_id',
    'employee_number',
    'employee_import_id',
    'token',
    'status',
    'expires_at',
    'last_sent_at',
    'send_count',
    'accepted_at',
])]
class Invitation extends Model
{
    use HasFactory, ScopedToCompany;

    /** صلاحية رابط الدعوة — 7 أيام (H §5). */
    public const VALIDITY_DAYS = 7;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'expires_at' => 'datetime',
            'last_sent_at' => 'datetime',
            'send_count' => 'integer',
        ];
    }

    /**
     * Expired = past the explicit `expires_at`, or already flagged by the
     * scheduled expiry sweep. An expired link is resend-only — it never
     * creates a new account (H §5).
     */
    public function isExpired(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }

        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isAcceptable(): bool
    {
        return $this->status === 'pending' && ! $this->isExpired();
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'invited_by');
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsTo<EmployeeImport, $this>
     */
    public function import(): BelongsTo
    {
        return $this->belongsTo(EmployeeImport::class, 'employee_import_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}

<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One uploaded employee file (CSV/Excel) with its validation outcome
 * (H §5). Invitations stay blocked while `error_rows` > 0.
 */
#[Fillable([
    'company_id',
    'uploaded_by_user_id',
    'original_filename',
    'status',
    'total_rows',
    'valid_rows',
    'error_rows',
    'invited_at',
])]
class EmployeeImport extends Model
{
    use HasFactory, ScopedToCompany;

    public const STATUS_NEEDS_CORRECTION = 'needs_correction';

    public const STATUS_READY = 'ready';

    public const STATUS_INVITED = 'invited';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_rows' => 'integer',
            'valid_rows' => 'integer',
            'error_rows' => 'integer',
            'invited_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return HasMany<EmployeeImportRow, $this>
     */
    public function rows(): HasMany
    {
        return $this->hasMany(EmployeeImportRow::class);
    }

    /**
     * The error report is empty — invitations may be sent. (Named to avoid
     * Eloquent's own Model::isClean().)
     */
    public function isErrorFree(): bool
    {
        return $this->error_rows === 0;
    }
}

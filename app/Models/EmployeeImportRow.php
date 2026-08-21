<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One data row of an uploaded employee file, kept verbatim plus its
 * validation errors — the source of the downloadable per-row error report.
 */
#[Fillable([
    'employee_import_id',
    'row_number',
    'name',
    'email',
    'phone',
    'normalized_phone',
    'department_name',
    'department_id',
    'employee_number',
    'errors',
])]
class EmployeeImportRow extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'row_number' => 'integer',
            'errors' => 'array',
        ];
    }

    /**
     * @return BelongsTo<EmployeeImport, $this>
     */
    public function import(): BelongsTo
    {
        return $this->belongsTo(EmployeeImport::class, 'employee_import_id');
    }

    public function isValid(): bool
    {
        return $this->errors === null || $this->errors === [];
    }
}

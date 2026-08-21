<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Company settings, configurable by the account manager (H §5). One row per
 * company, created with the spec defaults the moment the company exists.
 *
 * The columns other subsystems read:
 * - `employee_can_create_event` — A7 gates direct publishing on it.
 * - `default_funding_mode` / `default_subsidy` — A10's funding engine
 *   inheritance chain (event ← template ← community ← company).
 * - `registration_close_hours` — A7 derives `registration_closes_at` from it.
 * - `allow_absence_marking` — A12 gates the leader's attendance edits on it.
 */
#[Fillable([
    'company_id',
    'employee_can_create_event',
    'default_funding_mode',
    'default_subsidy',
    'default_subsidy_type',
    'registration_close_hours',
    'allow_absence_marking',
])]
class CompanySetting extends Model
{
    use HasFactory, ScopedToCompany;

    public const FUNDING_MODES = ['community_wallet', 'employee_paid', 'mixed'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'employee_can_create_event' => 'boolean',
            'default_subsidy' => 'integer',
            'registration_close_hours' => 'integer',
            'allow_absence_marking' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}

<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * H §4: grants a role within a scope — (user_id, role, scope_type, scope_id)
 * where scope_type ∈ platform | company | community | provider. `scope_id`
 * is null only for platform-wide grants. `is_primary` marks the primary
 * community leader.
 */
#[Fillable(['user_id', 'role', 'scope_type', 'scope_id', 'is_primary'])]
class RoleAssignment extends Model
{
    use HasFactory;

    public const SCOPE_PLATFORM = 'platform';

    public const SCOPE_COMPANY = 'company';

    public const SCOPE_COMMUNITY = 'community';

    public const SCOPE_PROVIDER = 'provider';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => Role::class,
            'is_primary' => 'boolean',
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
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForScope($query, string $scopeType, ?int $scopeId)
    {
        return $query->where('scope_type', $scopeType)->where('scope_id', $scopeId);
    }
}

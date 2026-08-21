<?php

namespace App\Models;

use App\Enums\Role;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use App\Services\Authorization\AuthorizationService;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\URL;

/**
 * The global account (H §4): identity only — name, phone, email, status.
 * No `role` column, no `company_id`. Roles come from `role_assignments`
 * (role + scope) and company relationships from `company_memberships`.
 */
#[Fillable(['name', 'email', 'password', 'phone', 'avatar', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function sendPasswordResetNotification($token): void
    {
        $url = url('/admin/reset-password/'.$token.'?email='.urlencode($this->email));
        $this->notify(new ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification(): void
    {
        $url = URL::temporarySignedRoute(
            'admin.verification.verify',
            now()->addMinutes(60),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );
        $this->notify(new VerifyEmailNotification($url));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'auth_epoch' => 'integer',
        ];
    }

    /**
     * @return HasMany<RoleAssignment, $this>
     */
    public function roleAssignments(): HasMany
    {
        return $this->hasMany(RoleAssignment::class);
    }

    /**
     * @return HasMany<CompanyMembership, $this>
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(CompanyMembership::class);
    }

    /**
     * @return HasMany<CompanyMembership, $this>
     */
    public function activeMemberships(): HasMany
    {
        return $this->memberships()->where('status', 'active');
    }

    /**
     * Grant a role within a scope (idempotent).
     */
    public function assignRole(Role|string $role, string $scopeType = RoleAssignment::SCOPE_PLATFORM, ?int $scopeId = null, bool $isPrimary = false): RoleAssignment
    {
        $role = $role instanceof Role ? $role : Role::from($role);

        return $this->roleAssignments()->firstOrCreate([
            'role' => $role->value,
            'scope_type' => $scopeType,
            'scope_id' => $scopeId,
        ], [
            'is_primary' => $isPrimary,
        ]);
    }

    /**
     * Bare role-in-scope existence check. Prefer permission checks via
     * {@see AuthorizationService} — the spec
     * mandates (permission + scope), never role alone, for authorization.
     */
    public function hasRoleInScope(Role|string $role, string $scopeType, ?int $scopeId = null): bool
    {
        $role = $role instanceof Role ? $role->value : $role;

        return $this->roleAssignments()
            ->where('role', $role)
            ->forScope($scopeType, $scopeId)
            ->exists();
    }

    /**
     * Scoped permission check — delegates to the authorization service.
     */
    public function hasPermission(string $permission, string $scopeType = RoleAssignment::SCOPE_PLATFORM, ?int $scopeId = null): bool
    {
        return app(AuthorizationService::class)
            ->can($this, $permission, $scopeType, $scopeId);
    }

    /**
     * The user's platform-level role (Teamat staff), if any.
     */
    public function platformRole(): ?Role
    {
        $assignment = $this->roleAssignments
            ->first(fn (RoleAssignment $a) => $a->scope_type === RoleAssignment::SCOPE_PLATFORM);

        return $assignment?->role;
    }

    /**
     * Every platform-scope role the user holds. A staff member may carry more
     * than one (a platform admin who also covers support), and the nav must
     * reflect the union — `platformRole()` alone silently hid screens the
     * user could in fact reach.
     *
     * @return Collection<int, Role>
     */
    public function platformRoles(): Collection
    {
        return $this->roleAssignments
            ->filter(fn (RoleAssignment $a) => $a->scope_type === RoleAssignment::SCOPE_PLATFORM)
            ->map(fn (RoleAssignment $a) => $a->role)
            ->unique(fn (Role $role) => $role->value)
            ->values();
    }

    /**
     * Union of the permissions of every platform-scope role.
     *
     * @return string[]
     */
    public function platformPermissions(): array
    {
        return $this->platformRoles()
            ->flatMap(fn (Role $role) => $role->permissions())
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Invalidate every session of this user immediately (departure cascade,
     * H §4: «تُلغى كل جلساته فوراً»). Portal sessions carry the epoch and are
     * rejected once it moves.
     */
    public function revokeAllSessions(): void
    {
        $this->increment('auth_epoch');
    }

    /**
     * @return MorphMany<Notification, $this>
     */
    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    /**
     * Scope to filter active users.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

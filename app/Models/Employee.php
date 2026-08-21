<?php

namespace App\Models;

use App\Enums\Role;
use App\Models\Concerns\ScopedToCompany;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use App\Support\FileUrl;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;

#[Fillable(['name', 'email', 'password', 'phone', 'avatar', 'user_id', 'company_id', 'department_id', 'employee_number', 'status'])]
#[Hidden(['password', 'remember_token'])]
class Employee extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, ScopedToCompany;

    public function sendPasswordResetNotification($token): void
    {
        $url = url('/employee/reset-password/'.$token.'?email='.urlencode($this->email));
        $this->notify(new ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification(): void
    {
        $url = URL::temporarySignedRoute(
            'employee.verification.verify',
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
        ];
    }

    /**
     * Avatars are stored on the private default disk; reads resolve to a
     * temporary signed URL (15 min). The raw path stays in the database.
     */
    protected function avatar(): Attribute
    {
        return Attribute::get(
            fn (?string $value) => FileUrl::temporary($value),
        );
    }

    /**
     * The global account behind this per-company profile row.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The company membership backing this employee row.
     *
     * @return HasOne<CompanyMembership, $this>
     */
    public function membership(): HasOne
    {
        return $this->hasOne(CompanyMembership::class);
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Dated department intervals (H §5) — the source for at-event-time
     * attribution in historical reports.
     *
     * @return HasMany<DepartmentHistory, $this>
     */
    public function departmentHistory(): HasMany
    {
        return $this->hasMany(DepartmentHistory::class);
    }

    /**
     * The department this employee belonged to at a moment in time. A13's
     * reports must attribute to the department AT EVENT TIME, never the
     * current one: `$employee->departmentAt($event->starts_at)`.
     */
    public function departmentAt(\DateTimeInterface $at): ?Department
    {
        return DepartmentHistory::departmentAt($this->id, $at);
    }

    /**
     * Communities where this employee is currently an active member —
     * membership rows are states (never deleted), so the relation filters
     * on pivot status.
     *
     * @return BelongsToMany<Community, $this>
     */
    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'community_member')
            ->using(CommunityMember::class)
            ->withPivot(['status', 'joined_at', 'left_at'])
            ->wherePivot('status', CommunityMember::STATUS_ACTIVE);
    }

    /**
     * Full membership history rows (all states).
     *
     * @return HasMany<CommunityMember, $this>
     */
    public function communityMemberships(): HasMany
    {
        return $this->hasMany(CommunityMember::class, 'employee_id');
    }

    /**
     * Communities this employee leads — resolved through role_assignments
     * (H §6), never a `leader_id` column.
     *
     * @return Builder<Community>
     */
    public function ledCommunities(): Builder
    {
        return Community::query()
            ->where('company_id', $this->company_id)
            ->whereIn('id', RoleAssignment::query()
                ->where('user_id', $this->user_id ?? 0)
                ->where('role', Role::CommunityLeader->value)
                ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
                ->select('scope_id'));
    }

    /**
     * @return BelongsToMany<Event, $this>
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_participants')
            ->using(EventParticipant::class)
            ->withPivot(['seat_status', 'payment_status', 'attendance_status', 'joined_at']);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function createdEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    /**
     * @return HasMany<CommunityAnnouncement, $this>
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(CommunityAnnouncement::class);
    }

    /**
     * @return HasMany<ChallengeProgress, $this>
     */
    public function challengeProgress(): HasMany
    {
        return $this->hasMany(ChallengeProgress::class);
    }

    /**
     * @return HasMany<CommunityRequest, $this>
     */
    public function communityRequests(): HasMany
    {
        return $this->hasMany(CommunityRequest::class);
    }

    /**
     * @return HasMany<Invitation, $this>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class, 'invited_by');
    }

    /**
     * @return MorphMany<Notification, $this>
     */
    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

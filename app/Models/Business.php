<?php

namespace App\Models;

use App\Enums\BusinessRole;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'email',
    'password',
    'city',
    'district',
    'contact_phone',
    'contact_name',
    'contact_title',
    'working_hours',
    'venues_count',
    'rating',
    'total_bookings',
    'commission_rate',
    'notes',
    'status',
    'role',
    'parent_id',
    'approved_at',
    'activation_token',
    'activation_token_expires_at',
])]
#[Hidden(['password', 'remember_token'])]
class Business extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    public function sendPasswordResetNotification($token): void
    {
        $url = url('/business/reset-password/'.$token.'?email='.urlencode($this->email));
        $this->notify(new ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification(): void
    {
        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'business.verification.verify',
            now()->addMinutes(60),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );
        $this->notify(new VerifyEmailNotification($url));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'rating' => 'decimal:1',
            'total_bookings' => 'integer',
            'commission_rate' => 'decimal:2',
            'role' => BusinessRole::class,
            'approved_at' => 'datetime',
            'activation_token_expires_at' => 'datetime',
        ];
    }

    /**
     * Get the parent business (for staff accounts like receptionists).
     *
     * @return BelongsTo<Business, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'parent_id');
    }

    /**
     * Get the staff members belonging to this business.
     *
     * @return HasMany<Business, $this>
     */
    public function staff(): HasMany
    {
        return $this->hasMany(Business::class, 'parent_id');
    }

    /**
     * Get the actual business entity (self for owners, parent for staff).
     */
    public function resolvedBusiness(): self
    {
        return $this->parent_id ? $this->parent : $this;
    }

    /**
     * Get the business ID to use for data queries (resolves to parent for staff).
     */
    public function resolvedBusinessId(): int
    {
        return $this->parent_id ?? $this->id;
    }

    /**
     * Check if this business account is an owner.
     */
    public function isOwner(): bool
    {
        return $this->role === BusinessRole::Owner;
    }

    /**
     * Check if this business account is a receptionist.
     */
    public function isReceptionist(): bool
    {
        return $this->role === BusinessRole::Receptionist;
    }

    /**
     * Check if this business account has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->role->can($permission);
    }

    /**
     * @return BelongsToMany<Sport, $this>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'business_category');
    }

    /**
     * @return HasMany<Venue, $this>
     */
    public function venues(): HasMany
    {
        return $this->hasMany(Venue::class);
    }

    /**
     * @return HasMany<Discount, $this>
     */
    public function discounts(): HasMany
    {
        return $this->hasMany(Discount::class);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * @return HasMany<Settlement, $this>
     */
    public function settlements(): HasMany
    {
        return $this->hasMany(Settlement::class);
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

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}

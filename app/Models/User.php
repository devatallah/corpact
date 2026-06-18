<?php

namespace App\Models;

use App\Enums\AdminRole;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone', 'avatar', 'status', 'role'])]
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
        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
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
            'role' => AdminRole::class,
        ];
    }

    /**
     * Check if this admin has the given permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->role->hasPermission($permission);
    }

    /**
     * Check if this admin has one of the given roles.
     */
    public function hasRole(AdminRole ...$roles): bool
    {
        return in_array($this->role, $roles, true);
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

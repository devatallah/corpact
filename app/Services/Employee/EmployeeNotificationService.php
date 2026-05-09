<?php

namespace App\Services\Employee;

use App\Models\Notification;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeNotificationService
{
    /**
     * List notifications for an employee.
     *
     * @param  array{unread_only?: bool, per_page?: int}  $filters
     */
    public function list(Authenticatable $user, array $filters = []): LengthAwarePaginator
    {
        return Notification::query()
            ->where('notifiable_type', $user::class)
            ->where('notifiable_id', $user->getAuthIdentifier())
            ->when(! empty($filters['unread_only']), fn ($query) => $query->whereNull('read_at'))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Authenticatable $user, string $notificationId): Notification
    {
        $notification = Notification::query()
            ->where('id', $notificationId)
            ->where('notifiable_type', $user::class)
            ->where('notifiable_id', $user->getAuthIdentifier())
            ->first();

        if (! $notification) {
            throw new ModelNotFoundException('Notification not found.');
        }

        $notification->update(['read_at' => now()]);

        return $notification->fresh();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Authenticatable $user): int
    {
        return Notification::query()
            ->where('notifiable_type', $user::class)
            ->where('notifiable_id', $user->getAuthIdentifier())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}

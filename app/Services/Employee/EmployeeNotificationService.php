<?php

namespace App\Services\Employee;

use App\Models\Notification;
use App\Support\Lists\ListSort;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeNotificationService
{
    /**
     * الأعمدة المسموح الترتيب بها — العنوان وتاريخ الوصول وحالة القراءة، وكلها
     * ظاهرة في بطاقة الإشعار أصلاً فالترتيب لا يكشف شيئاً جديداً (H §18).
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'read_at' => 'read_at',
            'title' => 'title',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * List notifications for an employee.
     *
     * @param  array{unread_only?: bool, sort?: string, dir?: string, per_page?: int}  $filters
     */
    public function list(Authenticatable $user, array $filters = []): LengthAwarePaginator
    {
        $query = Notification::query()
            ->where('notifiable_type', $user::class)
            ->where('notifiable_id', $user->getAuthIdentifier())
            ->when(! empty($filters['unread_only']), fn ($query) => $query->whereNull('read_at'));

        return self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
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

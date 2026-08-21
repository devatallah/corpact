<?php

namespace App\Services\Company;

use App\Models\Notification;
use App\Support\Lists\ListSort;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class CompanyNotificationService
{
    /**
     * الحقول المسموح الترتيب بها في قائمة إشعارات بوابة الشركة (H §18) —
     * كلها معروضة على البطاقة: العنوان والتاريخ وعلامة «غير مقروء».
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'title' => 'title',
            'read_at' => 'read_at',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * List notifications for an authenticated company.
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
     * Mark all notifications as read for a user.
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

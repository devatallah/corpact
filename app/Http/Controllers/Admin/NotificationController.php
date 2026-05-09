<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotificationRequest;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * List admin notifications.
     */
    public function index(): Response
    {
        $notifications = Notification::query()
            ->where('notifiable_type', \App\Models\User::class)
            ->where('notifiable_id', auth('admin')->id())
            ->latest()
            ->paginate(20);

        $unreadCount = Notification::query()
            ->where('notifiable_type', \App\Models\User::class)
            ->where('notifiable_id', auth('admin')->id())
            ->unread()
            ->count();

        return Inertia::render('admin/notifs/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Store a new notification (broadcast to users).
     */
    public function store(StoreNotificationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Notification::create([
            ...$data,
            'notifiable_type' => \App\Models\User::class,
            'notifiable_id' => auth('admin')->id(),
        ]);

        return back()->with('success', 'تم إرسال الإشعار بنجاح.');
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification): RedirectResponse
    {
        $notification->update(['read_at' => now()]);

        return back();
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(Notification $notification): RedirectResponse
    {
        $notification->delete();

        return back()->with('success', 'تم حذف الإشعار بنجاح.');
    }
}

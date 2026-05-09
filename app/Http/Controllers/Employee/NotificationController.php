<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\Employee\EmployeeNotificationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private EmployeeNotificationService $notificationService,
    ) {}

    /**
     * List notifications for the authenticated employee.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $notifications = $this->notificationService->list($employee);
        $unreadCount = Notification::where('notifiable_type', \App\Models\Employee::class)->where('notifiable_id', $employee->id)->whereNull('read_at')->count();

        return Inertia::render('employee/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Notification $notification): RedirectResponse
    {
        $this->notificationService->markAsRead(auth('employee')->user(), $notification->id);

        return back()->with('success', 'تم تحديد الإشعار كمقروء.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): RedirectResponse
    {
        $this->notificationService->markAllAsRead(auth('employee')->user());

        return back()->with('success', 'تم تحديد جميع الإشعارات كمقروءة.');
    }
}

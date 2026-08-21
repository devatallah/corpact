<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Notification;
use App\Services\Employee\EmployeeNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    public function index(Request $request): Response
    {
        $employee = auth('employee')->user();

        // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort`، لا اسم
        // عمود؛ التحقق هنا يمنع الحشو فقط ولا يردّ رابطاً قديماً بخطأ.
        $filters = $request->validate([
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $notifications = $this->notificationService->list($employee, $filters);
        $unreadCount = Notification::where('notifiable_type', Employee::class)->where('notifiable_id', $employee->id)->whereNull('read_at')->count();

        return Inertia::render('employee/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'sort' => EmployeeNotificationService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
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

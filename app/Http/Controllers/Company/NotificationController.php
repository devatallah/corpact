<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreNotificationRequest;
use App\Models\Notification;
use App\Services\Company\CompanyNotificationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private CompanyNotificationService $notificationService,
    ) {}

    /**
     * List notifications for the authenticated company user.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $notifications = $this->notificationService->list($company);
        $unreadCount = Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        return Inertia::render('company/notifications/index', [
            'company' => $company,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'unreadNotifications' => $unreadCount,
        ]);
    }

    /**
     * Store a new notification.
     */
    public function store(StoreNotificationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Notification::create([
            ...$data,
            'notifiable_type' => \App\Models\Company::class,
            'notifiable_id' => auth('company')->id(),
        ]);

        return back()->with('success', 'تم إرسال الإشعار بنجاح.');
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Notification $notification): RedirectResponse
    {
        $this->notificationService->markAsRead(auth('company')->user(), $notification->id);

        return back()->with('success', 'تم تحديد الإشعار كمقروء.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): RedirectResponse
    {
        $this->notificationService->markAllAsRead(auth('company')->user());

        return back()->with('success', 'تم تحديد جميع الإشعارات كمقروءة.');
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

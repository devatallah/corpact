<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreNotificationRequest;
use App\Models\Company;
use App\Models\Notification;
use App\Services\Company\CompanyNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    public function index(Request $request): Response
    {
        $company = auth('company')->user();

        $filters = $request->validate([
            // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort`، لا
            // اسم عمود؛ التحقق هنا يمنع الحشو فقط.
            'unread_only' => ['sometimes', 'nullable', 'boolean'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $notifications = $this->notificationService->list($company, $filters);

        $scope = fn () => Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id);
        $unreadCount = $scope()->whereNull('read_at')->count();
        // بطاقة «الإجمالي» كانت تقرأ `notifications.total`، وهو إجمالي بعد
        // التصفية. مع مُنتقي «غير المقروءة فقط» صار الرقمان يتطابقان دائماً
        // فيفقد «الإجمالي» معناه — فيأتي غير مُصفّى من هنا.
        $totalCount = $scope()->count();

        return Inertia::render('company/notifications/index', [
            'company' => $company,
            'notifications' => $notifications,
            'filters' => (object) $filters,
            'sort' => CompanyNotificationService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'unreadCount' => $unreadCount,
            'totalCount' => $totalCount,
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
            'notifiable_type' => Company::class,
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

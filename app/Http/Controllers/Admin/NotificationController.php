<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotificationRequest;
use App\Models\Notification;
use App\Models\User;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * H §18 — الأعمدة المسموح الترتيب بها في صندوق إشعارات المشرف. كلها
     * معروضة في البطاقة أصلاً (العنوان · النوع · وقت الوصول · مقروء أو لا)،
     * والقائمة محصورة أصلاً في إشعارات المشرف نفسه. الافتراضي هو ترتيب الشاشة
     * السابق نفسه: الأحدث أولاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'read_at' => 'read_at',
            'title' => 'title',
            'type' => 'type',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * List admin notifications.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'state' => ['sometimes', 'nullable', 'string', 'max:20'],
            // H §18 — الترتيب: مفتاح من قائمة بيضاء لا اسم عمود.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $search = trim((string) $request->query('search', ''));
        $state = (string) $request->query('state', '');

        $query = Notification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', auth('admin')->id())
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('title', 'like', '%'.$search.'%')
                ->orWhere('body', 'like', '%'.$search.'%')))
            ->when($state === 'unread', fn ($q) => $q->unread())
            ->when($state === 'read', fn ($q) => $q->read());

        $notifications = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString();

        // العدّاد يبقى على الصندوق كله — لا يتبع البحث ولا الفلتر.
        $unreadCount = Notification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', auth('admin')->id())
            ->unread()
            ->count();

        return Inertia::render('admin/notifs/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'filters' => [
                'search' => $search,
                'state' => $state,
                'sort' => $request->query('sort'),
                'dir' => $request->query('dir'),
            ],
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
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
            'notifiable_type' => User::class,
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

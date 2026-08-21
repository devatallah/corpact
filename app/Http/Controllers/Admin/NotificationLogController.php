<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeliveryStatus;
use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use App\Support\Identity\PhoneNumber;
use App\Support\Lists\ListSort;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * سجل الإشعارات — **أول ما يفتحه الدعم في شكوى «ما وصلني شيء»**
 * (G — دليل وكيل الدعم؛ H §14).
 *
 * قراءة فقط بالكامل: لا تعديل ولا حذف ولا إعادة إرسال من هنا. السطر يجيب عن
 * أربعة أسئلة بلا تخمين: أي قالب، بأي متحوّلات، على أي قناة وأي محاولة، وما
 * حالة تسليمها ومتى.
 *
 * ملاحظة أمنية: `rendered_body` يبقى فارغاً لرموز الدخول — الدعم يرى أن الرمز
 * أُرسل وسُلّم، ولا يرى الرمز نفسه أبداً.
 */
class NotificationLogController extends Controller
{
    /**
     * H §18 — الأعمدة المسموح الترتيب بها. كلها أعمدة معروضة في الجدول
     * (القالب · القناة · المحاولة · الحالة · الوقت). رقم الجوال **ليس** مفتاح
     * ترتيب: البحث به كافٍ للدعم، والترتيب به لا يخدم شيئاً ويجمّع الأرقام.
     * الافتراضي هو ترتيب الشاشة السابق نفسه: الأحدث أولاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => ['created_at', 'id'],
            'template_key' => 'template_key',
            'channel' => 'channel',
            'attempt' => 'attempt',
            'status' => 'status',
        ], 'created_at', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $request->validate([
            // H §18 — الترتيب: مفتاح من قائمة بيضاء لا اسم عمود.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', '');
        $channel = (string) $request->query('channel', '');
        $templateKey = (string) $request->query('template_key', '');

        $normalizedPhone = PhoneNumber::normalize($search);

        $query = NotificationLog::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('recipient_phone', 'like', '%'.($normalizedPhone ?? $search).'%')
                ->orWhere('template_key', 'like', "%{$search}%")
                ->orWhere('rendered_body', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($channel !== '', fn ($q) => $q->where('channel', $channel))
            ->when($templateKey !== '', fn ($q) => $q->where('template_key', $templateKey))
            ->when($request->filled('recipient_type') && $request->filled('recipient_id'), fn ($q) => $q
                ->where('recipient_type', $request->query('recipient_type'))
                ->where('recipient_id', (int) $request->query('recipient_id')));

        $logs = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/notification-logs/index', [
            'logs' => $logs,
            'statuses' => collect(DeliveryStatus::cases())
                ->map(fn (DeliveryStatus $s) => ['value' => $s->value, 'label' => $s->label()])
                ->values(),
            'channels' => array_keys((array) config('messaging.channels', [])) + ['in_app', 'mail'],
            'stats' => [
                'total' => NotificationLog::query()->count(),
                'failed' => NotificationLog::query()->where('status', DeliveryStatus::Failed->value)->count(),
                'deferred' => NotificationLog::query()->where('status', DeliveryStatus::Deferred->value)->count(),
                'delivered' => NotificationLog::query()->where('status', DeliveryStatus::Delivered->value)->count(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'channel' => $channel,
                'template_key' => $templateKey,
                'recipient_type' => $request->query('recipient_type'),
                'recipient_id' => $request->query('recipient_id'),
                'sort' => $request->query('sort'),
                'dir' => $request->query('dir'),
            ],
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
        ]);
    }
}

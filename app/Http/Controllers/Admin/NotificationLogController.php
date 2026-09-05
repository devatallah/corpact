<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeliveryStatus;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\Partner;
use App\Models\User;
use App\Support\Identity\PhoneNumber;
use App\Support\Lists\ListSort;
use App\Support\Messaging\SecretLink;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
 * أُرسل وسُلّم، ولا يرى الرمز نفسه أبداً. وعلى المبدأ نفسه: **لا يخرج من هنا
 * رابط يحمل اعتماداً**. الروابط تُخزَّن إشارةً لا نصاً (`SecretLink`)، والصف
 * يُسقَط إلى شكل معروض محجوب قبل أن يصل العميل — فحتى الصفوف التاريخية التي
 * كُتبت قبل الإشارة لا تُسلِّم رابطاً صالحاً لوكيل دعم.
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

    /**
     * أنواع المستلمين المسموح تحميل أسمائها.
     *
     * `recipient_type` عمود نصّي في قاعدة البيانات، وتمريره إلى الحاوية أو
     * إلى `new` يجعل محتوى صفٍّ يختار صنفاً يُستدعى. القائمة بيضاء لذلك، لا
     * للترجمة وحدها.
     *
     * @var array<class-string, string>
     */
    private const RECIPIENT_KINDS = [
        User::class => 'مستخدم',
        Employee::class => 'موظف',
        Company::class => 'شركة',
        Partner::class => 'مزوّد',
    ];

    /** @var array<string, string> */
    private const CHANNEL_LABELS = [
        'whatsapp' => 'واتساب',
        'sms' => 'رسالة نصية',
        'mail' => 'بريد إلكتروني',
        'in_app' => 'داخل التطبيق',
        'log' => 'سجل فقط',
    ];

    /** أسباب التخطّي/الفشل — نصوص المزوّد تبقى كما هي حين لا نعرفها. */
    private const REASON_LABELS = [
        'no_phone' => 'لا رقم جوال مسجَّل',
        'no_email' => 'لا بريد مسجَّل',
        'opted_out' => 'أوقف المستخدم هذا الإشعار',
        'channel_disabled' => 'القناة غير مهيأة',
        'quiet_hours' => 'ساعات عدم الإزعاج',
    ];

    /**
     * عنوان القالب بمتحوّلات هذا الصف.
     *
     * العنوان المخزَّن قالبٌ فيه `{company}` و`{period}`؛ عرضه كما هو يترك
     * وكيل الدعم أمام «نسخة تقرير {company} — {period}» ويُبقيه يخمّن أي
     * شركة. المتحوّلات محفوظة على الصف نفسه، فتُركَّب هنا.
     *
     * ما لا متحوّل له يبقى كما هو: حذفه يترك جملة ناقصة لا يُعرف نقصها.
     *
     * @param  array<string, mixed>|null  $variables
     */
    private static function renderTitle(?string $title, ?array $variables): ?string
    {
        if ($title === null || $variables === null) {
            return $title;
        }

        return preg_replace_callback(
            '/\{(\w+)\}/',
            fn (array $m) => is_scalar($variables[$m[1]] ?? null) ? (string) $variables[$m[1]] : $m[0],
            $title,
        );
    }

    /**
     * أسماء المستلمين لصفوف الصفحة — استعلام واحد لكل نوع، لا صفاً صفاً.
     *
     * @param  Collection<int, NotificationLog>  $logs
     * @return array<string, string>
     */
    private function recipientNames(Collection $logs): array
    {
        $names = [];

        foreach ($logs->groupBy('recipient_type') as $type => $rows) {
            if (! array_key_exists((string) $type, self::RECIPIENT_KINDS)) {
                continue;
            }

            $ids = $rows->pluck('recipient_id')->filter()->unique()->all();

            if ($ids === []) {
                continue;
            }

            /** @var class-string<Model> $type */
            foreach ($type::query()->whereKey($ids)->get(['id', 'name']) as $row) {
                $names[$type.'#'.$row->id] = (string) $row->name;
            }
        }

        return $names;
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
            // البحث في `rendered_body` مرفوع: كان يحوّل الشاشة إلى أداة تنقيب
            // في نصوص الرسائل — يكفي رقماً أو مفتاح قالب للتشخيص، ولا يجوز أن
            // يكون البحث بجزء من رابط طريقاً لإيجاد صف يحمله.
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('recipient_phone', 'like', '%'.($normalizedPhone ?? $search).'%')
                ->orWhere('template_key', 'like', "%{$search}%")))
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

        /*
         * الصفحة كانت تعرض ما في العمود حرفياً: `App\Models\User` مستلماً،
         * و`auth.otp` قالباً، و`log` قناةً، و`delivered` حالةً. وكيل الدعم
         * يقرأ هذا الجدول ليجيب «لم يصلني إشعار» — والقراءة تصير ترجمةً
         * ذهنية لأسماء أصناف ومفاتيح داخلية.
         *
         * الأسماء والعناوين تُجلب دفعةً واحدة لصفوف الصفحة العشرين، لا صفاً
         * صفاً: استعلام لكل نوع مستلم، واستعلام واحد لعناوين القوالب.
         */
        $names = $this->recipientNames($logs->getCollection());
        $titles = NotificationTemplate::query()
            ->whereIn('key', $logs->getCollection()->pluck('template_key')->filter()->unique())
            ->pluck('title_ar', 'key');

        $logs
            // الصف يُسقَط عمداً إلى شكل معروض: لا يصل العميل مفتاح يحمل
            // اعتماداً. الروابط الحاملة للاعتماد تُخزَّن إشارةً أصلاً
            // (SecretLink)، والحجب هنا يغطي الصفوف التاريخية التي كُتبت قبل
            // ذلك وما زالت تحمل رابطاً صالحاً.
            ->through(fn (NotificationLog $log) => [
                'id' => $log->id,
                'template_key' => $log->template_key,
                'notification_id' => $log->notification_id,
                'recipient_type' => $log->recipient_type,
                'recipient_id' => $log->recipient_id,
                'recipient_name' => $names[$log->recipient_type.'#'.$log->recipient_id] ?? null,
                'recipient_kind' => self::RECIPIENT_KINDS[$log->recipient_type] ?? null,
                'recipient_phone' => $log->recipient_phone,
                'template_title' => self::renderTitle($titles[$log->template_key] ?? null, $log->variables),
                'channel' => $log->channel,
                'channel_label' => self::CHANNEL_LABELS[$log->channel] ?? $log->channel,
                'status' => $log->status->value,
                'status_label' => $log->status->label(),
                'reason_label' => $log->reason === null ? null : (self::REASON_LABELS[$log->reason] ?? $log->reason),
                'attempt' => $log->attempt,
                'reason' => $log->reason,
                'variables' => SecretLink::redactVariables($log->variables),
                'rendered_body' => SecretLink::redact($log->rendered_body),
                'locale' => $log->locale,
                'purpose' => $log->purpose,
                'provider_message_id' => $log->provider_message_id,
                'error' => $log->error,
                'queued_at' => $log->queued_at?->toJSON(),
                'deferred_until' => $log->deferred_until?->toJSON(),
                'sent_at' => $log->sent_at?->toJSON(),
                'delivered_at' => $log->delivered_at?->toJSON(),
                'failed_at' => $log->failed_at?->toJSON(),
                'created_at' => $log->created_at?->toJSON(),
            ]);

        return Inertia::render('admin/notification-logs/index', [
            'logs' => $logs,
            'statuses' => collect(DeliveryStatus::cases())
                ->map(fn (DeliveryStatus $s) => ['value' => $s->value, 'label' => $s->label()])
                ->values(),
            // `+` على المصفوفات اتحادٌ بالمفاتيح لا إلحاق: القنوات الثلاث
            // المُهيأة تشغل المفاتيح 0..2، فكان `in_app` و`mail` يسقطان
            // بصمت ولا يظهران في المُنتقي — ولوجود صفوف بهما، كان تصفيتهما
            // متعذّرة أصلاً.
            'channels' => array_values(array_unique(array_merge(
                array_keys((array) config('messaging.channels', [])),
                ['in_app', 'mail'],
            ))),
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

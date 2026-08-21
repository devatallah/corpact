<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NotificationClass;
use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use App\Services\ActivityLogService;
use App\Services\Notifications\TemplateRenderer;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * إدارة قوالب الرسائل — **أدمن تيمات فقط** (H §14).
 *
 * ما لا تسمح به هذه الشاشة عمداً:
 * - لا إنشاء ولا حذف لمفاتيح القوالب: المفتاح عقد بين الكود والقالب، وحذفه
 *   يُسقط رسالة إلزامية بصمت. ما يُدار هنا هو **النص** والتفعيل.
 * - لا تحويل قالب إلزامي إلى اختياري: التصنيف يتبع مصفوفة H §14 لا رأي أدمن،
 *   وإلا صار بالإمكان إيقاف مطالبة دفع أو رمز دخول.
 * - لا تعطيل قالب إلزامي.
 */
class NotificationTemplateController extends Controller
{
    public function __construct(private TemplateRenderer $renderer) {}

    /**
     * H §18 — الأعمدة المسموح الترتيب بها. كلها معروضة في الجدول أو في فلاتره
     * (المجموعة · المفتاح · العنوان · المستلم · التصنيف · التفعيل). الافتراضي
     * هو ترتيب الشاشة السابق نفسه: المجموعة ثم المفتاح تصاعدياً — فالكتالوج
     * يُقرأ مجموعةً مجموعة.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'group' => ['group', 'key'],
            'key' => 'key',
            'title_ar' => 'title_ar',
            'audience' => 'audience',
            'class' => 'class',
            'active' => 'active',
        ], 'group', ListSort::ASC, 'id');
    }

    public function index(Request $request): Response
    {
        $request->validate([
            // H §18 — الترتيب: مفتاح من قائمة بيضاء لا اسم عمود.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $search = trim((string) $request->query('search', ''));
        $group = (string) $request->query('group', '');
        $class = (string) $request->query('class', '');

        $query = NotificationTemplate::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('key', 'like', "%{$search}%")
                ->orWhere('title_ar', 'like', "%{$search}%")
                ->orWhere('body_ar', 'like', "%{$search}%")))
            ->when($group !== '', fn ($q) => $q->where('group', $group))
            ->when($class !== '', fn ($q) => $q->where('class', $class));

        $templates = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/notification-templates/index', [
            'templates' => $templates,
            'groups' => NotificationTemplate::query()->distinct()->orderBy('group')->pluck('group'),
            'stats' => [
                'total' => NotificationTemplate::query()->count(),
                'mandatory' => NotificationTemplate::query()->where('class', NotificationClass::Mandatory->value)->count(),
                'optional' => NotificationTemplate::query()->where('class', NotificationClass::Optional->value)->count(),
                'inactive' => NotificationTemplate::query()->where('active', false)->count(),
            ],
            'filters' => [
                'search' => $search,
                'group' => $group,
                'class' => $class,
                'sort' => $request->query('sort'),
                'dir' => $request->query('dir'),
            ],
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
        ]);
    }

    public function update(Request $request, NotificationTemplate $notificationTemplate): RedirectResponse
    {
        $data = $request->validate([
            'title_ar' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'body_ar' => ['required', 'string', 'max:2000'],
            'body_en' => ['nullable', 'string', 'max:2000'],
            'whatsapp_template_name' => ['nullable', 'string', 'max:255'],
            'active' => ['boolean'],
        ], [
            'title_ar.required' => 'عنوان الرسالة بالعربية مطلوب.',
            'body_ar.required' => 'نص الرسالة بالعربية مطلوب.',
        ]);

        // إلزامي لا يُعطَّل — «المستخدم لا يستطيع إيقاف الإلزامية»، ولا الأدمن.
        $active = $notificationTemplate->isMandatory() ? true : (bool) ($data['active'] ?? true);

        $before = $notificationTemplate->only(['title_ar', 'body_ar', 'active']);

        $notificationTemplate->fill([
            'title_ar' => $data['title_ar'],
            'title_en' => $data['title_en'] ?? null,
            'body_ar' => $data['body_ar'],
            'body_en' => $data['body_en'] ?? null,
            'whatsapp_template_name' => $data['whatsapp_template_name'] ?? null,
            'active' => $active,
            // المتحوّلات تُشتق من النص لا تُكتب يدوياً — لا انحراف بينهما.
            'variables' => array_values(array_unique(array_merge(
                $this->renderer->declaredVariables($data['title_ar']),
                $this->renderer->declaredVariables($data['body_ar']),
            ))),
        ])->save();

        ActivityLogService::log(
            null,
            $notificationTemplate,
            'notification_template_updated',
            "عُدِّل قالب الإشعار [{$notificationTemplate->key}]",
            ['before' => $before, 'after' => $notificationTemplate->only(['title_ar', 'body_ar', 'active'])],
        );

        return back()->with('success', 'حُدِّث القالب.');
    }

    /**
     * معاينة النص المرسوم بمتحوّلات تجريبية — قبل الحفظ لا بعد شكوى.
     */
    public function preview(Request $request, NotificationTemplate $notificationTemplate): RedirectResponse
    {
        /** @var array<string, scalar|null> $variables */
        $variables = (array) $request->input('variables', []);

        $rendered = $this->renderer->render($notificationTemplate->key, $variables);

        return back()->with('preview', [
            'key' => $notificationTemplate->key,
            'title' => $rendered->title,
            'body' => $rendered->body,
            'missing' => $rendered->missingVariables,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Invitation;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * شاشتا وكيل الدعم اللتان كانتا مطويّتين داخل مركز الدعم.
 *
 * دليل وكيل الدعم يصف خمس مهام متمايزة، وكانت ثلاث منها مكدّسة في شاشة واحدة:
 * البحث، وإعادة الإرسال، وقراءة سجل الحالات. الوكيل الذي يريد إعادة إرسال رمز
 * كان يمرّ بنتائج بحث لا تعنيه، ومن يريد مراجعة حالة فعالية لم يجد قائمة
 * يبدأ منها أصلاً — فقط بحثاً بالاسم أو الرقم.
 */
class SupportOperationsController extends Controller
{
    /**
     * H §18 — الأعمدة المسموح الترتيب بها، وكلها معروضة في الجدول.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'event_date' => 'event_date',
            'status' => 'status',
            'id' => 'id',
        ], 'event_date', ListSort::DESC, 'id');
    }

    /**
     * سجل الفعاليات والحالات — قراءة وتوجيه، بلا تدخل.
     *
     * الصلاحية `event.history.view` كانت موجودة في مصفوفة الأدوار وتُستعمل
     * لفتح سجل فعالية بعينها فقط. القائمة هي ما يجعلها قابلة للاستعمال:
     * الوكيل يصل غالباً باسم شركة لا برقم فعالية.
     */
    public function events(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'max:40'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $query = Event::query()->with(['company:id,name', 'partner:id,name', 'community:id,name']);

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where(function ($inner) use ($search) {
                $inner->where('title', 'like', "%{$search}%")
                    ->orWhere('id', is_numeric($search) ? (int) $search : 0)
                    ->orWhereHas('company', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }

        $events = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'status' => (string) $event->status,
                'event_date' => $event->event_date,
                'start_time' => $event->start_time,
                'company' => $event->company?->only(['id', 'name']),
                'partner' => $event->partner?->only(['id', 'name']),
                'community' => $event->community?->only(['id', 'name']),
            ]);

        return Inertia::render('admin/support/events', [
            'events' => $events,
            'filters' => (object) $filters,
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
        ]);
    }

    /**
     * إعادة إرسال الدعوات والرموز — أداة واحدة بحدّها المعلن.
     */
    public function resend(): Response
    {
        return Inertia::render('admin/support/resend', [
            'resendLimit' => [
                'per_minute' => SupportConsoleController::OTP_LIMIT_PER_MINUTE,
                'note' => 'الحدّ محسوب بالجوال وعنوان الشبكة معاً، حمايةً للمستلم من الإغراق.',
            ],
            'pendingInvitations' => Invitation::query()
                ->with('company:id,name')
                ->where('status', 'pending')
                ->latest('id')
                ->limit(20)
                ->get()
                ->map(fn (Invitation $invitation) => [
                    'id' => $invitation->id,
                    'name' => $invitation->name,
                    'email' => $invitation->email,
                    'phone_tail' => $invitation->phone === null ? null : mb_substr($invitation->phone, -4),
                    'company' => $invitation->company?->only(['id', 'name']),
                    'send_count' => (int) $invitation->send_count,
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                ])
                ->all(),
        ]);
    }

    /**
     * توثيق بلاغ وتصعيده.
     *
     * لا جدول جديد: «كافة البلاغات تسجل في سجل التدقيق غير القابل للحذف» —
     * فالبلاغ يُقيَّد حيث لا يُحذف ولا يُعدَّل، وهو نفسه ما يجعل التوثيق ذا
     * قيمة. الوكيل لا يملك تنفيذ ما يصعّده، وهذا ما تحرسه مصفوفة التصعيد.
     */
    public function escalate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'action' => ['required', 'string', 'max:60'],
            'summary' => ['required', 'string', 'max:2000'],
        ], [
            'action.required' => 'اختر الإجراء المطلوب تصعيده.',
            'summary.required' => 'اكتب ملخّص البلاغ — بلا وصف لا قيمة للتوثيق.',
        ]);

        // `validate()` لا يُعيد المفاتيح غير المُرسَلة: حقل اختياري تُرك
        // فارغاً يغيب عن المصفوفة، فقراءته مباشرة تُسقط الطلب بخطأ خادم —
        // وهو ما كان النموذج يبتلعه صامتاً بلا رسالة للوكيل.
        $companyId = $data['company_id'] ?? null;
        $eventId = $data['event_id'] ?? null;
        $target = Role::escalationMatrix()[$data['action']] ?? null;

        AuditLogService::record(
            action: AuditAction::REPORT_EXPORTED,
            after: [
                'report' => 'support.escalation',
                'escalated_action' => $data['action'],
                'escalated_to' => $target?->value,
                'event_id' => $eventId,
                'summary' => $data['summary'],
            ],
            reason: 'توثيق بلاغ وتصعيده — G/«دليل وكيل الدعم»: ما لا يفعله الوكيل يُصعَّد فوراً.',
            companyId: $companyId,
        );

        return back()->with('success', 'وُثّق البلاغ في سجل التدقيق وأُحيل إلى '.($target?->label() ?? 'الأدمن المختص').'.');
    }
}

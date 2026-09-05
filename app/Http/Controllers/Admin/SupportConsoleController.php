<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Models\Invitation;
use App\Models\NotificationLog;
use App\Services\Audit\AuditLogService;
use App\Services\Company\InvitationService;
use App\Services\Otp\OtpService;
use App\Support\Audit\AuditAction;
use App\Support\Identity\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A15 — «مركز الدعم»، the screen G's «دليل وكيل الدعم» describes:
 *
 *   ما تفعله: البحث في الفعاليات والمستخدمين والشركات وقراءة سجل حالات أي
 *   فعالية · قراءة سجل الإشعارات وحالات التسليم · إعادة إرسال دعوة أو رمز
 *   ضمن الحدود المسموحة (٣ طلبات في الساعة للرقم الواحد) · توثيق البلاغ.
 *
 * Everything a support agent may **not** do is absent from the role's
 * permission list, and the escalation matrix
 * ({@see Role::escalationMatrix()}) is rendered on the page so the
 * agent sees who owns each blocked action instead of hitting a bare 403.
 */
class SupportConsoleController extends Controller
{
    /**
     * نفس حدّ `RateLimiter::for('otp')` في AppServiceProvider.
     *
     * مكرّر عمداً كثابت معروض بدل تخمين رقم في الواجهة؛ تغييره في مكان واحد
     * دون الآخر يجعل الشاشة تَعِد بما لا يفي به الخادم.
     */
    public const OTP_LIMIT_PER_MINUTE = 10;

    public function __construct(
        private InvitationService $invitations,
        private OtpService $otp,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'scope' => ['sometimes', 'nullable', 'string', 'max:20'],
            'coverage' => ['sometimes', 'nullable', Rule::in(['mine', 'all'])],
        ]);

        $term = trim((string) ($filters['search'] ?? ''));
        $scope = $filters['scope'] ?? 'all';

        /*
         * «شركاتي» تصفية لا حجب.
         *
         * الوكيل يتابع بضع شركات ويبحث في الكل، فالبحث غير المُصفّى يُغرقه
         * بنتائج ليست له بينما شكواه غالباً من إحدى شركاته. تبدأ الشاشة على
         * شركاته، ويبقى «كل الشركات» على بُعد نقرة — ولا شيء هنا يمنع أحداً
         * من الوصول إلى شيء.
         *
         * أدمن المنصة لا شركات مُسنَدة إليه، فالافتراضي في حقه «الكل»: بدء
         * شاشته على مجموعة فارغة يجعلها تبدو معطّلة.
         */
        $myCompanyIds = Company::query()
            ->where('support_agent_user_id', $request->user()?->id)
            ->pluck('id');

        $coverage = $filters['coverage'] ?? ($myCompanyIds->isEmpty() ? 'all' : 'mine');
        $onlyMine = $coverage === 'mine' && $myCompanyIds->isNotEmpty();

        $results = ['events' => [], 'employees' => [], 'companies' => []];

        if ($term !== '') {
            AuditLogService::record(
                action: AuditAction::REPORT_EXPORTED,
                after: ['report' => 'support.search', 'term_length' => mb_strlen($term), 'scope' => $scope, 'coverage' => $coverage],
                reason: 'بحث من مركز الدعم — G: «كل ما تقرأه من بيانات موظفين وشركات يخضع لسجل التدقيق»',
            );

            if ($scope === 'all' || $scope === 'events') {
                $results['events'] = Event::query()
                    ->with(['company:id,name', 'community:id,name'])
                    ->when($onlyMine, fn ($query) => $query->whereIn('company_id', $myCompanyIds))
                    ->where(fn ($query) => $query
                        ->where('title', 'like', "%{$term}%")
                        ->orWhere('id', is_numeric($term) ? (int) $term : 0))
                    ->latest('id')
                    ->limit(20)
                    ->get()
                    ->map(fn (Event $event) => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'status' => (string) $event->status,
                        'event_date' => $event->event_date,
                        'company' => $event->company?->only(['id', 'name']),
                        'community' => $event->community?->only(['id', 'name']),
                    ])
                    ->all();
            }

            if ($scope === 'all' || $scope === 'employees') {
                $normalized = PhoneNumber::normalize($term);

                $results['employees'] = Employee::query()
                    ->with('company:id,name')
                    ->when($onlyMine, fn ($query) => $query->whereIn('company_id', $myCompanyIds))
                    ->where(fn ($query) => $query
                        ->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', '%'.($normalized ?? $term).'%'))
                    ->limit(20)
                    ->get()
                    ->map(fn (Employee $employee) => [
                        'id' => $employee->id,
                        'name' => $employee->name,
                        'email' => $employee->email,
                        // G: «لا تنقل رقم جوال أو بيانات موظف خارج القناة الرسمية».
                        'phone_tail' => $employee->phone === null ? null : mb_substr($employee->phone, -4),
                        'status' => $employee->status,
                        'company' => $employee->company?->only(['id', 'name']),
                    ])
                    ->all();
            }

            if ($scope === 'all' || $scope === 'companies') {
                $results['companies'] = Company::query()
                    ->when($onlyMine, fn ($query) => $query->whereIn('id', $myCompanyIds))
                    // التجميع لازم: `orWhere` بلا قوسين يُلغي تصفية «شركاتي».
                    ->where(fn ($query) => $query
                        ->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%"))
                    ->limit(20)
                    ->get(['id', 'name', 'email', 'status'])
                    ->all();
            }
        }

        return Inertia::render('admin/support/console', [
            'filters' => (object) ($filters + ['coverage' => $coverage]),
            'coverage' => [
                'value' => $coverage,
                'my_companies' => $myCompanyIds->count(),
            ],
            'results' => $results,
            'escalation' => self::escalationRows(),
        ]);
    }

    /**
     * G: «قراءة سجل حالات أي فعالية» — and H §9 rule 2 makes reading the
     * history the precondition of any manual intervention.
     */
    public function event(Event $event): Response
    {
        $event->load(['company:id,name', 'community:id,name', 'partner:id,name']);

        AuditLogService::record(
            action: AuditAction::REPORT_EXPORTED,
            entity: $event,
            after: ['report' => 'support.event_history'],
            reason: 'قراءة سجل حالات فعالية من مركز الدعم',
            companyId: $event->company_id,
        );

        return Inertia::render('admin/support/event', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'status' => (string) $event->status,
                'event_date' => $event->event_date,
                'start_time' => $event->start_time,
                'capacity' => $event->capacity,
                'min_participants' => $event->min_participants,
                'participants_count' => $event->participants_count,
                'company' => $event->company?->only(['id', 'name']),
                'community' => $event->community?->only(['id', 'name']),
                'partner' => $event->partner?->only(['id', 'name']),
            ],
            'statusHistory' => EventStatusHistory::query()
                ->where('event_id', $event->id)
                ->orderBy('id')
                ->get()
                ->map(fn (EventStatusHistory $row) => [
                    'id' => $row->id,
                    'from_status' => $row->from_status,
                    'to_status' => $row->to_status,
                    'is_manual' => (bool) $row->is_manual,
                    'reason' => $row->reason,
                    'actor_id' => $row->actor_id,
                    'created_at' => $row->created_at?->toIso8601String(),
                ])
                ->all(),
            'notificationLogs' => NotificationLog::query()
                ->where('variables->event_id', $event->id)
                ->orderByDesc('id')
                ->limit(30)
                ->get()
                ->map(fn (NotificationLog $log) => [
                    'id' => $log->id,
                    'template_key' => $log->template_key,
                    'channel' => $log->channel,
                    'status' => $log->status,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at?->toIso8601String(),
                ])
                ->all(),
            'escalation' => self::escalationRows(),
        ]);
    }

    /**
     * G: «إعادة إرسال دعوة … ضمن الحدود المسموحة». The 7-day validity and the
     * send counter live in A4's service — support only triggers it.
     */
    public function resendInvitation(Invitation $invitation): RedirectResponse
    {
        $this->invitations->resend($invitation);

        AuditLogService::record(
            action: AuditAction::SUPPORT_RESEND,
            entity: $invitation,
            after: ['kind' => 'invitation', 'send_count' => (int) $invitation->fresh()->send_count],
            reason: 'إعادة إرسال دعوة من مركز الدعم',
            companyId: $invitation->company_id,
        );

        return back()->with('success', 'أُعيد إرسال الدعوة — الرابط صالح 7 أيام.');
    }

    /**
     * G/ملحق أ: «٣ طلبات كحد أقصى في الساعة» — the cap is enforced inside
     * {@see OtpService::request()}, so support cannot exceed it from here.
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
        ], [
            'phone.required' => 'رقم الجوال مطلوب لإعادة إرسال الرمز.',
        ]);

        $phone = PhoneNumber::normalize($data['phone']);

        if ($phone === null) {
            throw ValidationException::withMessages(['phone' => ['رقم الجوال غير صالح.']]);
        }

        $this->otp->request($phone);

        AuditLogService::record(
            action: AuditAction::SUPPORT_RESEND,
            after: ['kind' => 'otp', 'phone_tail' => mb_substr($phone, -4)],
            reason: 'إعادة إرسال رمز دخول من مركز الدعم — ضمن حد 3 في الساعة',
        );

        return back()->with('success', 'أُرسل رمز دخول جديد (ضمن حد ٣ طلبات في الساعة للرقم).');
    }

    /**
     * @return array<int, array{action: string, label: string, role: string}>
     */
    private static function escalationRows(): array
    {
        // G/«دليل وكيل الدعم» — «ما لا تفعله — يُصعَّد فوراً»، بنصّه.
        $labels = [
            'event.force_state' => 'تغيير حالة فعالية يدوياً',
            'attendance.edit_post_window' => 'تعديل الحضور بعد نافذة الـ٢٤ ساعة',
            'attendance.edit' => 'تعديل قائمة الحاضرين',
            'results.correct' => 'تصحيح النتائج',
            'provider.reliability.adjust' => 'تعديل مؤشر موثوقية مزوّد',
            'admins.manage' => 'تغيير صلاحية أو دور',
            'platform.manage' => 'إعدادات المنصة والفئات',
            'catalog.manage' => 'شجرة الفئات والأنشطة',
            'refund.approve' => 'أي استرداد أو تصحيح مالي',
            'wallet.topup.approve' => 'اعتماد تحويل بنكي',
            'wallet.topup.unapprove' => 'إلغاء اعتماد تحويل',
            'settlement.approve' => 'اعتماد كشف تسوية أو صرفه',
            'invoice.approve' => 'الفواتير الشهرية',
        ];

        $rows = [];

        foreach (Role::escalationMatrix() as $permission => $role) {
            $rows[] = [
                'action' => $permission,
                'label' => $labels[$permission] ?? $permission,
                'role' => $role->label(),
            ];
        }

        return $rows;
    }
}

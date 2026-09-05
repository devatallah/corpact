<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\SupportMessage;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportMessageController extends Controller
{
    /** G/«دليل وكيل الدعم» — «ما لا تفعله — يُصعَّد فوراً»، بنصّه. */
    private const ESCALATION_LABELS = [
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

    /**
     * H §18 — الأعمدة المسموح الترتيب بها. كلها معروضة في الجدول أصلاً
     * (المرسل · الموضوع · الحالة · التاريخ). الافتراضي هو ترتيب الشاشة السابق
     * نفسه: الأحدث أولاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'name' => 'name',
            'subject' => 'subject',
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

        $query = SupportMessage::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    // اسم الشركة أوّل ما يُبحث به في متابعة طلب عرض.
                    ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $messages = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/support/index', [
            'messages' => $messages,
            'stats' => [
                'total' => SupportMessage::count(),
                'new' => SupportMessage::where('status', 'new')->count(),
                'in_progress' => SupportMessage::where('status', 'in_progress')->count(),
                'resolved' => SupportMessage::where('status', 'resolved')->count(),
            ],
            'filters' => (object) $request->only('search', 'status', 'sort', 'dir'),
            // مصفوفة التصعيد ومَن تصعَّد إليه — نفس الجدول الذي يعرضه دليل
            // وكيل الدعم، مقروءاً من الأدوار لا مكتوباً في الواجهة.
            'escalation' => collect(Role::escalationMatrix())
                ->map(fn (Role $role, string $permission) => [
                    'action' => $permission,
                    'label' => self::ESCALATION_LABELS[$permission] ?? $permission,
                    'role' => $role->label(),
                ])
                ->values()
                ->all(),
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
        ]);
    }

    public function update(Request $request, SupportMessage $supportMessage): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:new,in_progress,resolved'],
        ]);

        $supportMessage->update($validated);

        return back()->with('success', 'تم تحديث حالة الرسالة.');
    }

    public function destroy(SupportMessage $supportMessage): RedirectResponse
    {
        $supportMessage->delete();

        return back()->with('success', 'تم حذف الرسالة.');
    }
}

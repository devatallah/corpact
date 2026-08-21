<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityEvent;
use App\Models\WalletTopupRequest;
use App\Services\Audit\AuditLogService;
use App\Services\Audit\SecurityEventService;
use App\Services\Wallet\TopupRequestService;
use App\Support\FileUrl;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * لوحة الأدمن المالي — اعتماد التحويلات البنكية (H §12.5 + دليل الأدمن
 * المالي §1). المسارات كلها خلف permission:wallet.topup.approve (الأدمن
 * المالي وحده)، ومنع الاعتماد الذاتي في الخدمة لا هنا.
 */
class TopupRequestController extends Controller
{
    public function __construct(private TopupRequestService $topupService) {}

    /**
     * H §18 — الأعمدة المسموح الترتيب بها. كلها معروضة في سطر الطلب أصلاً
     * (المبلغ · تاريخ التحويل · المرجع · الحالة · وقت التقديم)، فالترتيب لا
     * يكشف بياناً بنكياً جديداً. الافتراضي هو ترتيب الشاشة السابق نفسه:
     * الأحدث تقديماً أولاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'amount' => 'amount_halalas',
            'transfer_date' => 'transfer_date',
            'bank_reference' => 'bank_reference',
            'status' => 'status',
        ], 'created_at', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $request->validate([
            'status' => ['sometimes', 'nullable', 'string', 'max:40'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            // H §18 — الترتيب: مفتاح من قائمة بيضاء لا اسم عمود.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $status = $request->string('status')->toString();
        $search = trim((string) $request->query('search', ''));

        $query = WalletTopupRequest::query()
            ->with(['company:id,name', 'creator:id,name', 'reviewer:id,name'])
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(fn ($inner) => $inner
                ->where('bank_reference', 'like', '%'.$search.'%')
                ->orWhereHas('company', fn ($company) => $company->where('name', 'like', '%'.$search.'%'))));

        $requests = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (WalletTopupRequest $topup) => [
                'id' => $topup->id,
                'company' => $topup->company?->only(['id', 'name']),
                'amount' => $topup->amount,
                'transfer_date' => $topup->transfer_date?->toDateString(),
                'sender_account_last4' => $topup->sender_account_last4,
                'bank_reference' => $topup->bank_reference,
                'status' => $topup->status->value,
                'status_label' => $topup->status->label(),
                'creator' => $topup->creator?->only(['id', 'name']),
                'reviewer' => $topup->reviewer?->only(['id', 'name']),
                'reviewed_at' => $topup->reviewed_at?->toIso8601String(),
                'rejection_reason' => $topup->rejection_reason,
                'unapproval_reason' => $topup->unapproval_reason,
                // A15 — القرص خاص، والرابط الموقّع (15 دقيقة) يُصدر عند الطلب
                // من مسار مدقَّق لا في حمولة الصفحة: كل تنزيل لملف مالي حدث
                // تدقيق + حدث أمني (H §19).
                'receipt_url' => route('admin.finance.topups.receipt', $topup->id),
                'created_at' => $topup->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/finance/topups', [
            'requests' => $requests,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'sort' => $request->query('sort'),
                'dir' => $request->query('dir'),
            ],
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
        ]);
    }

    public function startReview(WalletTopupRequest $topup): RedirectResponse
    {
        $this->topupService->startReview($topup, auth('admin')->user());

        return back()->with('success', 'بدأت مراجعة الطلب.');
    }

    /**
     * H §19: «إشعار تحويل بنكي — مسؤول الحساب / الأدمن المالي فقط»، والوصول
     * عبر رابط موقّع صالح 15 دقيقة. التنزيل نفسه بند إلزامي في كتالوج
     * التدقيق، ولمسه لملف مالي يُسجَّل في سجل الأحداث الأمنية أيضاً.
     */
    public function receipt(WalletTopupRequest $topup): RedirectResponse
    {
        AuditLogService::download(
            descriptor: 'topup-receipt#'.$topup->id,
            entity: $topup,
            companyId: $topup->company_id,
            context: ['bank_reference' => $topup->bank_reference, 'amount_halalas' => (int) $topup->amount_halalas],
        );

        SecurityEventService::record(
            event: SecurityEvent::FINANCIAL_FILE_ACCESSED,
            severity: SecurityEvent::SEVERITY_INFO,
            subject: $topup,
            companyId: $topup->company_id,
            context: ['file' => 'bank_receipt'],
        );

        $url = FileUrl::temporary($topup->receipt_path);

        abort_if($url === null, 404);

        return redirect()->away($url);
    }

    public function approve(WalletTopupRequest $topup): RedirectResponse
    {
        $this->topupService->approve($topup, auth('admin')->user());

        return back()->with('success', 'اعتُمد الطلب وأُنشئت حركة الشحن في الدفتر.');
    }

    public function reject(Request $request, WalletTopupRequest $topup): RedirectResponse
    {
        $request->validate(
            ['reason' => ['required', 'string', 'max:1000']],
            ['reason.required' => 'سبب الرفض إلزامي وموثَّق.'],
        );

        $this->topupService->reject($topup, auth('admin')->user(), $request->input('reason'));

        return back()->with('success', 'رُفض الطلب وأُشعر مسؤول الحساب بالسبب.');
    }

    public function unapprove(Request $request, WalletTopupRequest $topup): RedirectResponse
    {
        $request->validate(
            ['reason' => ['required', 'string', 'max:1000']],
            ['reason.required' => 'سبب إلغاء الاعتماد إلزامي وموثَّق.'],
        );

        $this->topupService->unapprove($topup, auth('admin')->user(), $request->input('reason'));

        return back()->with('success', 'أُلغي الاعتماد بحركة عكسية مرتبطة.');
    }
}

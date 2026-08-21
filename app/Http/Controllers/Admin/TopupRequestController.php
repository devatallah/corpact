<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityEvent;
use App\Models\WalletTopupRequest;
use App\Services\Audit\AuditLogService;
use App\Services\Audit\SecurityEventService;
use App\Services\Wallet\TopupRequestService;
use App\Support\FileUrl;
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

    public function index(): Response
    {
        $requests = WalletTopupRequest::query()
            ->with(['company:id,name', 'creator:id,name', 'reviewer:id,name'])
            ->latest()
            ->paginate(20)
            ->through(fn (WalletTopupRequest $request) => [
                'id' => $request->id,
                'company' => $request->company?->only(['id', 'name']),
                'amount' => $request->amount,
                'transfer_date' => $request->transfer_date?->toDateString(),
                'sender_account_last4' => $request->sender_account_last4,
                'bank_reference' => $request->bank_reference,
                'status' => $request->status->value,
                'status_label' => $request->status->label(),
                'creator' => $request->creator?->only(['id', 'name']),
                'reviewer' => $request->reviewer?->only(['id', 'name']),
                'reviewed_at' => $request->reviewed_at?->toIso8601String(),
                'rejection_reason' => $request->rejection_reason,
                'unapproval_reason' => $request->unapproval_reason,
                // A15 — القرص خاص، والرابط الموقّع (15 دقيقة) يُصدر عند الطلب
                // من مسار مدقَّق لا في حمولة الصفحة: كل تنزيل لملف مالي حدث
                // تدقيق + حدث أمني (H §19).
                'receipt_url' => route('admin.finance.topups.receipt', $request->id),
                'created_at' => $request->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/finance/topups', [
            'requests' => $requests,
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

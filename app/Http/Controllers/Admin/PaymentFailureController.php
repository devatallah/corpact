<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhook;
use App\Services\Payments\EventRefundService;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * قائمة فشل المدفوعات والاستردادات — مسؤولية الأدمن المالي اليومية
 * (H §12.4 + دليل الأدمن المالي §2/§6): «إعادة المحاولة آلية، لكن لا يُترك
 * فشل بلا معالجة». خلف permission:payments.failures.view (الأدمن المالي).
 */
class PaymentFailureController extends Controller
{
    public function __construct(private EventRefundService $refunds) {}

    /**
     * H §18 — الأعمدة المسموح الترتيب بها في طابور الاستردادات الفاشلة. كلها
     * معروضة في الصف أصلاً (المبلغ · المحاولات · آخر تحديث)، فالترتيب لا يكشف
     * شيئاً جديداً. الافتراضي هو ترتيب الشاشة السابق نفسه: آخر ما تحرّك أولاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'updated_at' => 'updated_at',
            'amount' => 'amount_halalas',
            'refund_attempts' => 'refund_attempts',
        ], 'updated_at', ListSort::DESC, 'id');
    }

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
        $maxAutoRetries = (int) config('payments.refunds.max_auto_retries', 5);

        $refundsQuery = PaymentIntent::query()
            ->where('refund_status', PaymentIntent::REFUND_FAILED)
            ->with(['event:id,title,event_date,community_id', 'event.community:id,name', 'employee:id,name'])
            ->when($search !== '', fn ($query) => $query->where(fn ($inner) => $inner
                ->whereHas('event', fn ($event) => $event->where('title', 'like', '%'.$search.'%'))
                ->orWhereHas('employee', fn ($employee) => $employee->where('name', 'like', '%'.$search.'%'))))
            // «يدوي»: ما استنفد محاولاته الآلية ولن يتحرك دون تدخل.
            ->when($state === 'manual', fn ($query) => $query->where('refund_attempts', '>=', $maxAutoRetries));

        $failedRefunds = self::sort()
            ->apply($refundsQuery, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PaymentIntent $intent) => [
                'id' => $intent->id,
                'event' => $intent->event?->only(['id', 'title', 'event_date']),
                'community' => $intent->event?->community?->only(['id', 'name']),
                'employee' => $intent->employee?->only(['id', 'name']),
                'amount' => $intent->amount,
                'refund_reason' => $intent->refund_reason,
                'refund_attempts' => $intent->refund_attempts,
                'refund_last_error' => $intent->refund_last_error,
                'max_auto_retries' => $maxAutoRetries,
                'updated_at' => $intent->updated_at?->toIso8601String(),
            ]);

        // مطالبات انقضت نافذتها دون سداد (فشل تحصيل على مستوى المشارك) +
        // ويبهوكات فشلت معالجتها — للمراقبة اليومية نفسها.
        $expiredIntents = PaymentIntent::query()
            ->where('status', PaymentIntent::STATUS_EXPIRED)
            ->with(['event:id,title,event_date', 'employee:id,name'])
            ->latest('updated_at')
            ->limit(50)
            ->get()
            ->map(fn (PaymentIntent $intent) => [
                'id' => $intent->id,
                'event' => $intent->event?->only(['id', 'title', 'event_date']),
                'employee' => $intent->employee?->only(['id', 'name']),
                'amount' => $intent->amount,
                'expires_at' => $intent->expires_at?->toIso8601String(),
            ]);

        $failedWebhooks = PaymentWebhook::query()
            ->where('processing_status', PaymentWebhook::STATUS_FAILED)
            ->latest()
            ->limit(50)
            ->get(['id', 'gateway', 'event_type', 'gateway_reference', 'error', 'created_at']);

        return Inertia::render('admin/payments/failures', [
            'failedRefunds' => $failedRefunds,
            'expiredIntents' => $expiredIntents,
            'failedWebhooks' => $failedWebhooks,
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
     * إعادة محاولة استرداد فاشل يدوياً — نفس مفتاح التفرّد فلا ازدواج أبداً.
     */
    public function retryRefund(PaymentIntent $intent): RedirectResponse
    {
        if ($intent->refund_status !== PaymentIntent::REFUND_FAILED) {
            return back()->with('error', 'هذه المطالبة ليست في قائمة فشل الاستردادات.');
        }

        $succeeded = $this->refunds->refundIntent($intent, $intent->refund_reason ?? 'إعادة محاولة يدوية من الأدمن المالي');

        return back()->with(
            $succeeded ? 'success' : 'error',
            $succeeded ? 'نجح الاسترداد وأُقفل من القائمة.' : 'ما زال الاسترداد يفشل لدى البوابة — الخطأ موثَّق في الصف.',
        );
    }
}

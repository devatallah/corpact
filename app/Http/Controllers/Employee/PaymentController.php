<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Services\Payments\Gateway\PaymentGatewayManager;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * دفع حصة الموظف (A10 — H §12.3 / دليل الموظف §6):
 *
 * - صفحة الدفع: المبلغ النهائي (شامل الضريبة ومفكَّكاً)، وسائل الدفع
 *   (مدى/بطاقة/Apple Pay)، وعدّاد المهلة. المقعد محجوز طوال النافذة —
 *   إغلاق الصفحة لا يلغي شيئاً والدفع يُستأنف من نفس الرابط الموقّع.
 * - «ادفع» ينشئ الدفعة لدى البوابة عبر الطبقة المجرَّدة (لا SDK هنا) ويحوّل
 *   لصفحة checkout البوابة. تيمات هي الظاهرة في كشف الحساب (MoR)، ورسوم
 *   البوابة ليست على الموظف أبداً — المبلغ = الحصة المقفلة بلا زيادة.
 * - سجل المدفوعات: كل مطالبات الموظف بحالاتها.
 */
class PaymentController extends Controller
{
    public function __construct(private PaymentGatewayManager $gateways) {}

    /**
     * الأعمدة المسموح الترتيب بها — المبلغ والحالة وتاريخ المطالبة، وكلها
     * ظاهرة في سجل المدفوعات أصلاً فالترتيب لا يكشف شيئاً جديداً (H §18).
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'amount' => 'amount_halalas',
            'status' => 'status',
        ], 'created_at', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $employee = auth('employee')->user();

        // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort` لا اسم
        // عمود؛ التحقق هنا يمنع الحشو فقط.
        $filters = $request->validate([
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $query = PaymentIntent::query()
            ->where('employee_id', $employee->id)
            ->with(['event:id,title,event_date,start_time,community_id', 'event.community:id,name']);

        $intents = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('employee/payments/index', [
            'intents' => $intents,
            'sort' => self::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    public function show(Request $request, PaymentIntent $intent): Response
    {
        $employee = auth('employee')->user();

        abort_if((int) $intent->employee_id !== (int) $employee->id, 404);

        $intent->load(['event:id,title,event_date,start_time,starts_at,community_id,status', 'event.community:id,name']);

        return Inertia::render('employee/payments/show', [
            'intent' => $intent,
            'methods' => config('payments.methods'),
            'statementDescriptor' => config('payments.statement_descriptor'),
        ]);
    }

    /**
     * إنشاء الدفعة لدى البوابة والتحويل لصفحتها — idempotent: نفس مفتاح
     * التفرّد يعيد نفس الدفعة (القاعدة 5: لا تحصيل مرتين).
     */
    public function pay(PaymentIntent $intent): RedirectResponse
    {
        $employee = auth('employee')->user();

        abort_if((int) $intent->employee_id !== (int) $employee->id, 404);

        if (! $intent->isPayable()) {
            return redirect()->route('employee.payments.show', ['intent' => $intent->id])
                ->with('error', $intent->status === PaymentIntent::STATUS_PAID
                    ? 'حصتك مدفوعة — لا تُحصَّل مرتين أبداً.'
                    : 'انتهت مهلة الدفع لهذه المطالبة.');
        }

        $gateway = $this->gateways->gateway($intent->gateway);

        $payment = $gateway->createPayment(
            (int) $intent->amount_halalas,
            $intent->currency,
            "payment-intent:{$intent->id}",
            $intent->idempotency_key,
            [
                // Merchant of Record: تيمات هي الظاهرة في كشف الحساب (H §12.6).
                'statement_descriptor' => (string) config('payments.statement_descriptor'),
                'methods' => config('payments.methods'),
            ],
        );

        if ($intent->gateway_reference !== $payment->gatewayReference) {
            $intent->forceFill(['gateway_reference' => $payment->gatewayReference])->save();
        }

        return redirect()->away($payment->checkoutUrl);
    }
}

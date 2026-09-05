<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeePaymentInvoice;
use App\Models\PaymentIntent;
use App\Services\Payments\Gateway\PaymentGatewayManager;
use App\Support\Lists\ListSort;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

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

    /**
     * قائمة مدفوعات الموظف — تُبنى مرة وتُستعمل مع النافذة وبدونها.
     *
     * @param  array<string, mixed>  $extra
     */
    private function list(Request $request, Employee $employee, array $extra = []): Response
    {
        $query = PaymentIntent::query()
            ->where('employee_id', $employee->id)
            ->with(['event:id,title,event_date,start_time,community_id', 'event.community:id,name']);

        $intents = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('employee/payments/index', [
            'intents' => $intents,
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
            ...$extra,
        ]);
    }

    /**
     * ورقة السداد فوق القائمة، لا صفحة منفصلة.
     *
     * الرابط يبقى كما هو حتى يعمل الرابط المحفوظ وعودة البوابة، لكنه يعرض
     * قائمة المدفوعات ومعها النافذة مفتوحة: الدفع مقاطعة لا وجهة، وإغلاق
     * النافذة يترك الموظف حيث كان بدل أن يقذفه إلى شاشة أخرى.
     */
    public function show(Request $request, PaymentIntent $intent): Response
    {
        $employee = auth('employee')->user();

        abort_if((int) $intent->employee_id !== (int) $employee->id, 404);

        $intent->load(['event:id,title,event_date,start_time,starts_at,community_id,status', 'event.community:id,name']);

        $invoice = EmployeePaymentInvoice::query()
            ->where('payment_intent_id', $intent->id)
            ->first();

        return $this->list($request, $employee, [
            'active' => $intent,
            // المستند يُعرض بحالته: «مبدئي» ليس فاتورة ضريبية نهائية، وقول
            // ذلك أصدق من ترقيم يوحي بما لم يصدر بعد.
            'activeInvoice' => $invoice === null ? null : [
                'serial' => $invoice->serial,
                'provisional' => $invoice->isProvisional(),
                'seller_name' => $invoice->seller_name,
                'seller_vat_number' => $invoice->seller_vat_number,
            ],
            'methods' => config('payments.methods'),
            'statementDescriptor' => config('payments.statement_descriptor'),
        ]);
    }

    public function pay(Request $request, PaymentIntent $intent): SymfonyResponse
    {
        $employee = auth('employee')->user();

        // الوسيلة اختيار الموظف لا حقل حر: القائمة البيضاء هي نفسها المعروضة
        // في الشاشة، فلا تصل البوابة وسيلة لا تدعمها المنصة أصلاً.
        $method = $request->validate([
            'method' => ['sometimes', 'nullable', Rule::in((array) config('payments.methods'))],
        ])['method'] ?? null;

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
                // تفضيل الموظف يُمرَّر للبوابة، وتبقى البقية متاحة له هناك.
                'methods' => $method === null ? config('payments.methods') : [$method],
            ],
        );

        $intent->forceFill(array_filter([
            'gateway_reference' => $intent->gateway_reference !== $payment->gatewayReference
                ? $payment->gatewayReference
                : null,
            'payment_method' => $method,
        ], fn ($value) => $value !== null))->save();

        /*
         * `Inertia::location` لا `redirect()->away`.
         *
         * زيارة Inertia طلبٌ XHR: التحويل الخارجي يعود بصفحة البوابة داخل
         * الاستجابة فيُهملها العميل ولا يحدث شيء — الزر يبدو معطّلاً وهو
         * سليم. هذه تعيد 409 ومعها `X-Inertia-Location` فينتقل المتصفح
         * انتقالاً كاملاً، وتعمل كتحويل عادي لغير طلبات Inertia.
         */
        return Inertia::location($payment->checkoutUrl);
    }
}

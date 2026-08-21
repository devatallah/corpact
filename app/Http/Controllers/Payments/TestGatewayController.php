<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Services\Payments\Gateway\GatewayWebhookEvent;
use App\Services\Payments\Gateway\LocalTestGateway;
use App\Services\Payments\WebhookProcessor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

/**
 * صفحة checkout المشغّل التجريبي (H §12.6): تحاكي بوابة حقيقية —
 * نجاح / فشل / تأخير (الدفع يُقبض ويصل ويبهوكه لاحقاً). كل زر يبني ويبهوكاً
 * موقَّعاً HMAC يمر بنفس مسار المعالجة الذي ستستعمله البوابة الحقيقية.
 * تعمل خارج الإنتاج فقط.
 */
class TestGatewayController extends Controller
{
    public function __construct(
        private LocalTestGateway $gateway,
        private WebhookProcessor $processor,
    ) {}

    public function checkout(string $reference): View
    {
        abort_if(app()->environment('production'), 404);

        $intent = PaymentIntent::query()->where('gateway_reference', $reference)->firstOrFail();

        return view('test-gateway.checkout', [
            'intent' => $intent,
            'reference' => $reference,
            'methods' => config('payments.methods'),
            'statementDescriptor' => config('payments.statement_descriptor'),
        ]);
    }

    public function complete(Request $request, string $reference): RedirectResponse
    {
        abort_if(app()->environment('production'), 404);

        $intent = PaymentIntent::query()->where('gateway_reference', $reference)->firstOrFail();

        $action = (string) $request->input('action', 'success');

        if ($action === 'delay') {
            // محاكاة بوابة بطيئة: المال قُبض والويبهوك سيصل لاحقاً (زر
            // «أرسل الويبهوك الآن» يعيد لنفس الصفحة).
            return back()->with('status', 'قُبض المبلغ لدى البوابة التجريبية — الويبهوك مؤخَّر. أرسله يدوياً عندما تشاء.');
        }

        $payload = json_encode([
            'type' => $action === 'fail'
                ? GatewayWebhookEvent::TYPE_PAYMENT_FAILED
                : GatewayWebhookEvent::TYPE_PAYMENT_SUCCEEDED,
            'reference' => $reference,
            'payment_intent_id' => $intent->id,
            'amount_halalas' => (int) $intent->amount_halalas,
            'idempotency_key' => 'local-webhook:'.$reference.':'.($action === 'fail' ? 'fail-'.Str::uuid() : 'success'),
        ], JSON_UNESCAPED_UNICODE);

        $this->processor->handle('local', (string) $payload, $this->gateway->sign((string) $payload));

        $intent->refresh();

        if ($intent->status === PaymentIntent::STATUS_PAID || $intent->status === PaymentIntent::STATUS_REFUNDED) {
            return redirect()->route('employee.payments.show', ['intent' => $intent->id]);
        }

        return back()->with('status', $action === 'fail'
            ? 'فشلت محاولة الدفع (محاكاة) — يمكنك المحاولة مجدداً طوال النافذة.'
            : 'عولج الويبهوك.');
    }
}

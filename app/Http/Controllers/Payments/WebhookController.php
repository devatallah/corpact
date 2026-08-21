<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\PaymentWebhook;
use App\Services\Payments\WebhookProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * نقطة استقبال ويبهوكات بوابة الدفع (H §12.6) — بلا جلسة ولا CSRF:
 * التخزين الخام ثم تحقق التوقيع ثم التفرّد ثم المعالجة، كلها في
 * WebhookProcessor (لا منطق دفع في المتحكمات — قاعدة §12.6).
 */
class WebhookController extends Controller
{
    public function __construct(private WebhookProcessor $processor) {}

    public function handle(Request $request, string $gateway): JsonResponse
    {
        $webhook = $this->processor->handle(
            $gateway,
            $request->getContent(),
            $request->header('X-Signature'),
        );

        return match ($webhook->processing_status) {
            PaymentWebhook::STATUS_INVALID => response()->json(['status' => 'invalid'], 400),
            PaymentWebhook::STATUS_FAILED => response()->json(['status' => 'failed'], 500),
            default => response()->json(['status' => $webhook->processing_status]),
        };
    }
}

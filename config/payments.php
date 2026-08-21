<?php

use App\Services\Payments\Gateway\LocalTestGateway;

/*
 * A10 — بوابة الدفع والتحصيل (H §12.3 / §12.6).
 *
 * كل ما يتعلق بالدفع خلف PaymentGatewayInterface — ربط بوابة حقيقية لاحقاً
 * (قرار مالك معلّق) = درايفر جديد + تغيير GATEWAY في البيئة، لا إعادة بناء.
 */
return [

    // الدرايفر الفعال — LocalTestGateway للتطوير والاختبار.
    'gateway' => env('PAYMENT_GATEWAY', 'local'),

    'gateways' => [
        'local' => LocalTestGateway::class,
    ],

    // Merchant of Record: تيمات هي الظاهرة في كشف حساب الموظف (H §12.6).
    'statement_descriptor' => 'تيمات',

    // وسائل الدفع المستهدفة — عناوين عرض؛ لا تقسيط في الإصدار الأول.
    'methods' => ['mada', 'card', 'apple_pay'],

    'collection' => [
        // نافذة الدفع: 120 دقيقة أو حتى 6 ساعات قبل البدء أيهما أقرب (H §12.3).
        'window_minutes' => (int) env('PAYMENTS_WINDOW_MINUTES', 120),
        'window_min_hours_before_start' => 6,
        // مهلة عرض المقعد على بديل قائمة الانتظار بعد الإغلاق — «الأسبق يفوز،
        // بمهلة قصيرة» (H §12.3 بند 5).
        'substitute_offer_minutes' => (int) env('PAYMENTS_SUBSTITUTE_OFFER_MINUTES', 30),
    ],

    'refunds' => [
        // إعادة محاولة آلية لفشل الاسترداد قبل بقائه في طابور الأدمن المالي.
        'max_auto_retries' => 5,
    ],

    // سر توقيع ويبهوكات المشغّل التجريبي (HMAC-SHA256).
    'local' => [
        'secret' => env('PAYMENTS_LOCAL_SECRET', env('APP_KEY', 'local-test-secret')),
    ],
];

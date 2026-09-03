<?php

use App\Services\Messaging\Channels\SmsChannel;
use App\Services\Messaging\Channels\WhatsAppChannel;
use App\Services\Otp\Channels\LogOtpChannel;

return [

    /*
    |--------------------------------------------------------------------------
    | OTP rules (H §4 / G ملحق أ)
    |--------------------------------------------------------------------------
    | 6 digits · valid 5 minutes · max 3 sends per hour per phone ·
    | 5 wrong entries → 15-minute lock.
    */

    'length' => 6,

    /*
    | رمز ثابت للتطوير المحلي فقط.
    |
    | حين يُضبط `OTP_FIXED_CODE` **وتكون البيئة `local`** يصدر هذا الرمز بدل
    | رمز عشوائي، فلا يحتاج المطوّر إلى قراءة السجل بعد كل محاولة دخول.
    |
    | هذا تعطيل صريح للعامل الثاني: البوابة بيئة مسموح بها (`local` وحدها، لا
    | `testing` ولا `staging` ولا `production`) وليست شرط `!production`،
    | حتى لا يفتحه متغيّر بيئة منسيّ على خادم حقيقي. اتركه فارغاً في أي بيئة
    | أخرى.
    */
    'fixed_code' => env('OTP_FIXED_CODE'),
    'ttl_seconds' => 300,
    'max_sends_per_hour' => 3,
    'max_attempts' => 5,
    'lock_minutes' => 15,

    /*
    |--------------------------------------------------------------------------
    | Delivery channels
    |--------------------------------------------------------------------------
    | `channel` is the primary delivery driver; `fallback_channel` is sent
    | automatically when the primary has not confirmed delivery within
    | `fallback_after_seconds` (spec: WhatsApp → SMS within 60s).
    |
    | A14 wired the real drivers in. In production `OTP_CHANNEL=whatsapp` and
    | `OTP_FALLBACK_CHANNEL=sms`; an unconfigured driver reports "not
    | configured" instead of throwing, so **login never depends on a single
    | channel** (H §4 — «الدخول يجب ألا يتعطل بتعطل قناة واحدة»). The log
    | driver stays the dev/demo default.
    |
    | Security (A3 note): the delayed fallback job must never carry the code
    | in plaintext — `SendOtpFallback` encrypts it and is `ShouldBeEncrypted`.
    */

    'channel' => env('OTP_CHANNEL', 'log'),
    'fallback_channel' => env('OTP_FALLBACK_CHANNEL'),
    'fallback_after_seconds' => 60,

    'channels' => [
        'log' => LogOtpChannel::class,
        'whatsapp' => WhatsAppChannel::class,
        'sms' => SmsChannel::class,
    ],
];

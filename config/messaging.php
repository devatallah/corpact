<?php

use App\Services\Messaging\Channels\LogMessageChannel;
use App\Services\Messaging\Channels\SmsChannel;
use App\Services\Messaging\Channels\WhatsAppChannel;

return [

    /*
    |--------------------------------------------------------------------------
    | Outbound message delivery (H §14)
    |--------------------------------------------------------------------------
    | `channel` selects the driver bound to the legacy `MessageChannel`
    | contract (A4). The delivery *chain* below is what A14's dispatcher walks:
    | WhatsApp → SMS → in-app record (always written regardless).
    */

    'channel' => env('MESSAGE_CHANNEL', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Message locale
    |--------------------------------------------------------------------------
    | Deliberately NOT `app.locale`: the product is Arabic end to end while
    | `APP_LOCALE` is still the starter kit's `en`. Templates carry AR and EN
    | bodies; this picks which one an unqualified send renders.
    */

    'default_locale' => env('MESSAGE_LOCALE', 'ar'),

    'channels' => [
        'log' => LogMessageChannel::class,
        'whatsapp' => WhatsAppChannel::class,
        'sms' => SmsChannel::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Delivery chain
    |--------------------------------------------------------------------------
    | Order matters: the first channel that accepts the message wins; a hard
    | failure (or an unconfigured channel) moves to the next immediately, and
    | an *accepted but unconfirmed* message escalates after
    | `confirm_delivery_after_seconds` (H §4 — «إذا لم يصل رمز الواتساب خلال
    | 60 ثانية، يُرسل تلقائياً كرسالة نصية»).
    |
    | In dev the chain is the log driver so nothing silently no-ops.
    */

    'chain' => array_values(array_filter(
        explode(',', (string) env('MESSAGE_CHAIN', 'log'))
    )),

    'confirm_delivery_after_seconds' => (int) env('MESSAGE_CONFIRM_AFTER_SECONDS', 60),

    /*
    |--------------------------------------------------------------------------
    | Retries (H §14 — «إعادة محاولة 3 مرات بتباعد أسي، ثم التحويل للقناة
    | البديلة، ثم تسجيل الفشل وتنبيه الأدمن»)
    |--------------------------------------------------------------------------
    */

    'retries' => [
        'attempts' => (int) env('MESSAGE_RETRY_ATTEMPTS', 3),
        'backoff_seconds' => [60, 300, 900],
    ],

    /*
    |--------------------------------------------------------------------------
    | Quiet hours (H §14 — 22:00–08:00 بتوقيت الرياض)
    |--------------------------------------------------------------------------
    | Non-mandatory outbound messages inside the window are deferred to the
    | window's end. OTP and mandatory messages always pass.
    */

    'quiet_hours' => [
        'enabled' => (bool) env('MESSAGE_QUIET_HOURS', true),
        'timezone' => 'Asia/Riyadh',
        'start' => '22:00',
        'end' => '08:00',
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Business Cloud API
    |--------------------------------------------------------------------------
    | OWNER-SUPPLIED. Nothing here is invented or defaulted to a real value:
    | with `enabled=false` (or a missing phone id / token) the driver reports
    | "not configured" and the chain falls through to SMS.
    |
    | `templates` maps a message *purpose* to the WhatsApp-approved template
    | name. Approval takes days–weeks and login depends on it (H §4 critical
    | path) — per-notification template names live on
    | `notification_templates.whatsapp_template_name`.
    */

    'whatsapp' => [
        'enabled' => (bool) env('WHATSAPP_ENABLED', false),
        'base_url' => env('WHATSAPP_API_BASE_URL', 'https://graph.facebook.com'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID'),
        'token' => env('WHATSAPP_ACCESS_TOKEN'),
        'default_language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'ar'),
        'timeout' => (int) env('WHATSAPP_TIMEOUT', 10),
        'webhook_verify_token' => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),

        'templates' => [
            'login' => env('WHATSAPP_TEMPLATE_OTP'),
            'admin_login' => env('WHATSAPP_TEMPLATE_OTP'),
            'invitation' => env('WHATSAPP_TEMPLATE_INVITATION'),
            'default' => env('WHATSAPP_TEMPLATE_DEFAULT'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS gateway (generic HTTP)
    |--------------------------------------------------------------------------
    | OWNER-SUPPLIED. Vendor-neutral: endpoint, auth and field names are all
    | configuration, so a local Saudi gateway drops in without code changes.
    | The SMS path must be operable *standalone* before any pilot (H §4).
    */

    'sms' => [
        'enabled' => (bool) env('SMS_ENABLED', false),
        'endpoint' => env('SMS_GATEWAY_URL'),
        'method' => env('SMS_GATEWAY_METHOD', 'POST'),
        'token' => env('SMS_GATEWAY_TOKEN'),
        'basic_auth_username' => env('SMS_GATEWAY_USERNAME'),
        'basic_auth_password' => env('SMS_GATEWAY_PASSWORD'),
        'sender' => env('SMS_SENDER_NAME'),
        'timeout' => (int) env('SMS_TIMEOUT', 10),
        'response_id_path' => env('SMS_RESPONSE_ID_PATH', 'id'),

        'field_map' => [
            'to' => env('SMS_FIELD_TO', 'to'),
            'body' => env('SMS_FIELD_BODY', 'body'),
            'sender' => env('SMS_FIELD_SENDER', 'sender'),
        ],

        'extra_fields' => [],
    ],
];

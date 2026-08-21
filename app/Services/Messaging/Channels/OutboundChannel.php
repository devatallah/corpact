<?php

namespace App\Services\Messaging\Channels;

use App\Services\Messaging\DeliveryResult;
use App\Services\Messaging\OutboundMessage;
use App\Services\Otp\Channels\OtpChannel;

/**
 * A14 — العقد الموحَّد لدرايفرات القنوات الفعلية.
 *
 * كل درايفر يخدم مسارين بالعقدين القائمين: `MessageChannel` (الرسائل العامة —
 * A4) و`OtpChannel` (رموز الدخول — A3)، ويضيف `deliver()` التي تعيد نتيجة
 * غنية (سُلّمت/قُبلت/فشلت/غير مهيأة) وهي ما تبني عليه سلسلة الاحتياط.
 *
 * قاعدة قاطعة: لا اعتمادات مخترعة. القناة غير المهيأة تعيد
 * `DeliveryResult::notConfigured()` بهدوء ولا ترمي استثناء ولا تعطل نداءً.
 */
interface OutboundChannel extends MessageChannel, OtpChannel
{
    /** اسم القناة كما يُسجَّل في `notification_logs`. */
    public function name(): string;

    /** هل الاعتمادات كاملة فعلاً؟ */
    public function isConfigured(): bool;

    public function deliver(OutboundMessage $message): DeliveryResult;
}

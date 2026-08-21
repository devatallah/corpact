<?php

namespace App\Support\Messaging;

use App\Models\Invitation;
use App\Models\PaymentIntent;

/**
 * روابط تحمل بيانات اعتماد — لا تُخزَّن نصاً في `notification_logs`.
 *
 * كل سطر في سجل الإشعارات يُحفظ بمتحوّلاته ونصه المرسوم ليجيب الدعم عن «ما
 * وصلني شيء» (H §14)، وسجلّ الإشعارات مفتوح لدور **وكيل الدعم**. رابط الدعوة
 * وحده يكفي لفتح جلسة (`/invite/{token}` عام)، فتخزينه نصاً يجعل شاشة قراءة
 * مخزناً لبيانات اعتماد صالحة. هذا امتداد للاستثناء الذي يطبّقه
 * `OtpService::recordAttempt` أصلاً: **الرمز لا يُكتب في السجل أبداً**.
 *
 * الآلية: موضع الاستدعاء يمرر **إشارة** لا رابطاً — `[[link:invitation:12]]` —
 * فتُخزَّن الإشارة في `variables` و`rendered_body`، ويُستبدل الرابط الحقيقي
 * **لحظة التسليم** فقط (`MessageDispatcher::message`، مسار البريد، ونص
 * الإشعار داخل المنصة الذي يقرأه صاحبه وحده).
 *
 * لماذا الإشارة لا الحجب؟ لأن `MessageDispatcher::clone()` يعيد قراءة
 * `rendered_body` نصاً للرسالة عند التصعيد واتساب ← SMS: تفريغه كان سيرسل
 * رسائل فارغة بصمت. الإشارة تُبقي النص كاملاً وقابلاً للترطيب في كل محاولة.
 */
final class SecretLink
{
    public const INVITATION = 'invitation';

    public const PAYMENT_INTENT = 'payment_intent';

    /** ما يراه الدعم مكان الرابط في الصفوف التاريخية أو المحجوبة. */
    public const REDACTED = '[رابط محجوب]';

    private const PATTERN = '/\[\[link:([a-z_]+):(\d+)\]\]/';

    /** أي رابط مطلق — لحجب الصفوف التي كُتبت قبل هذه الآلية. */
    private const URL_PATTERN = '#https?://\S+#i';

    /** أسماء متحوّلات تحمل اعتماداً مهما كانت قيمتها. */
    private const SECRET_KEYS = ['token', 'code', 'otp', 'password', 'secret', 'url', 'link'];

    /**
     * الإشارة التي يمررها موضع الاستدعاء بدل الرابط.
     */
    public static function ref(string $type, int|string $id): string
    {
        return "[[link:{$type}:{$id}]]";
    }

    /**
     * استبدال كل إشارة بالرابط الحقيقي — تُنادى لحظة التسليم فقط.
     */
    public static function hydrate(?string $text): string
    {
        if ($text === null || ! str_contains($text, '[[link:')) {
            return (string) $text;
        }

        return (string) preg_replace_callback(
            self::PATTERN,
            fn (array $m) => self::resolve($m[1], (int) $m[2]) ?? self::REDACTED,
            $text,
        );
    }

    /**
     * @param  array<string, scalar|null>  $variables
     * @return array<string, scalar|null>
     */
    public static function hydrateVariables(array $variables): array
    {
        return array_map(
            fn ($value) => is_string($value) ? self::hydrate($value) : $value,
            $variables,
        );
    }

    /**
     * الرابط الحقيقي لإشارة واحدة. الصف المحذوف يعيد null فيسقط على نص محجوب
     * بدل أن يُرسل «[[link:…]]» للمستلم.
     */
    public static function resolve(string $type, int $id): ?string
    {
        return match ($type) {
            self::INVITATION => self::invitationUrl($id),
            self::PAYMENT_INTENT => PaymentIntent::query()->withoutGlobalScopes()->find($id)?->signedPaymentUrl(),
            default => null,
        };
    }

    /**
     * حجب النص لشاشة الدعم: الإشارات **والروابط المطلقة** معاً — الثانية
     * تغطي الصفوف التي كُتبت قبل هذه الآلية وما زالت تحمل رابطاً صالحاً.
     */
    public static function redact(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        $text = (string) preg_replace(self::PATTERN, self::REDACTED, $text);

        return (string) preg_replace(self::URL_PATTERN, self::REDACTED, $text);
    }

    /**
     * @param  array<string, mixed>|null  $variables
     * @return array<string, mixed>
     */
    public static function redactVariables(?array $variables): array
    {
        if ($variables === null) {
            return [];
        }

        $redacted = [];

        foreach ($variables as $key => $value) {
            if (! is_string($value)) {
                $redacted[$key] = $value;

                continue;
            }

            $redacted[$key] = self::isSecretKey((string) $key)
                ? self::REDACTED
                : self::redact($value);
        }

        return $redacted;
    }

    private static function isSecretKey(string $key): bool
    {
        $key = mb_strtolower($key);

        foreach (self::SECRET_KEYS as $needle) {
            if (str_contains($key, $needle)) {
                return true;
            }
        }

        return false;
    }

    private static function invitationUrl(int $id): ?string
    {
        $token = Invitation::query()->withoutGlobalScopes()->whereKey($id)->value('token');

        return $token === null ? null : route('invitation.show', $token);
    }
}

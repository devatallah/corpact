<?php

namespace App\Enums;

/**
 * حالة التسليم في `notification_logs` (H §14).
 */
enum DeliveryStatus: string
{
    /** في الطابور بانتظار المحاولة. */
    case Queued = 'queued';

    /** مؤجَّلة لسياسة عدم الإزعاج (22:00–08:00) — تُرسل عند 08:00. */
    case Deferred = 'deferred';

    /** سُلّمت للمزوّد وقُبلت، بانتظار تأكيد التسليم. */
    case Sent = 'sent';

    /** وصل تأكيد التسليم. */
    case Delivered = 'delivered';

    /** فشلت نهائياً بعد المحاولات والقناة البديلة. */
    case Failed = 'failed';

    /** لم تُرسل عمداً (تفضيل المستخدم، لا رقم جوال، قناة غير مهيأة). */
    case Skipped = 'skipped';

    public function isTerminal(): bool
    {
        return in_array($this, [self::Delivered, self::Failed, self::Skipped], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Queued => 'في الطابور',
            self::Deferred => 'مؤجَّلة',
            self::Sent => 'أُرسلت',
            self::Delivered => 'سُلّمت',
            self::Failed => 'فشلت',
            self::Skipped => 'مُتخطَّاة',
        };
    }
}

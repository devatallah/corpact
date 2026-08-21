<?php

namespace App\Services\Messaging;

/**
 * نتيجة محاولة إرسال عبر قناة واحدة.
 *
 * الفرق بين `accepted` و`delivered` هو ما تقوم عليه سلسلة الاحتياط: القناة
 * التي تقبل الرسالة ولا تؤكد تسليمها تُمهَل ٦٠ ثانية ثم يُصعَّد إلى القناة
 * البديلة (H §4/§14).
 */
final class DeliveryResult
{
    private function __construct(
        public readonly string $status,
        public readonly ?string $providerMessageId = null,
        public readonly ?string $error = null,
        public readonly bool $retryable = false,
    ) {}

    /** تأكيد تسليم فوري — لا احتياط. */
    public static function delivered(?string $providerMessageId = null): self
    {
        return new self('delivered', $providerMessageId);
    }

    /** قُبلت لدى المزوّد بلا تأكيد تسليم — يُنتظر ٦٠ ثانية ثم يُصعَّد. */
    public static function accepted(?string $providerMessageId = null): self
    {
        return new self('accepted', $providerMessageId);
    }

    /** فشل يستحق إعادة محاولة (شبكة، 5xx، حد معدل). */
    public static function retryable(string $error): self
    {
        return new self('failed', null, $error, true);
    }

    /** فشل نهائي على هذه القناة — انتقل للبديلة فوراً. */
    public static function failed(string $error): self
    {
        return new self('failed', null, $error);
    }

    /** القناة غير مهيأة (لا اعتمادات) — تخطَّ إلى البديلة بلا ضجيج. */
    public static function notConfigured(string $channel): self
    {
        return new self('not_configured', null, "قناة [{$channel}] غير مهيأة.");
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /** قُبلت أو سُلّمت — أي أن القناة لم تفشل. */
    public function isSuccessful(): bool
    {
        return $this->isDelivered() || $this->isAccepted();
    }

    public function isNotConfigured(): bool
    {
        return $this->status === 'not_configured';
    }

    public function isRetryable(): bool
    {
        return $this->retryable;
    }
}

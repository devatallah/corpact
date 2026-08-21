<?php

namespace App\Services\Messaging\Channels;

/**
 * Outbound-message delivery abstraction (invitations, reminders). Mirrors
 * the OtpChannel contract: A14 adds the WhatsApp Business (and SMS) drivers
 * behind it; the log driver serves dev/demo. Invitations are delivered over
 * WhatsApp per H §5 — «تُرسل الدعوة عبر واتساب برابط تفعيل صالح 7 أيام».
 */
interface MessageChannel
{
    /**
     * Deliver a message to a phone (normalized 9665XXXXXXXX). Returns true
     * when delivery is confirmed synchronously.
     */
    public function send(string $phone, string $message, string $purpose): bool;
}

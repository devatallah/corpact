<?php

namespace App\Services\Messaging\Channels;

use App\Services\Messaging\DeliveryResult;
use App\Services\Messaging\OutboundMessage;
use Illuminate\Support\Facades\Log;

/**
 * Dev/demo driver: outbound messages land in the application log.
 *
 * It stays the default so a developer machine never silently no-ops and never
 * needs real WhatsApp/SMS credentials. Delivery is confirmed synchronously,
 * so the 60-second fallback never fires behind it.
 */
class LogMessageChannel implements OutboundChannel
{
    public function name(): string
    {
        return 'log';
    }

    public function isConfigured(): bool
    {
        return true;
    }

    public function send(string $phone, string $message, string $purpose): bool
    {
        Log::info("Message [{$purpose}] to {$phone}: {$message}");

        return true;
    }

    public function deliver(OutboundMessage $message): DeliveryResult
    {
        $this->send($message->phone, $message->body, $message->purpose);

        return DeliveryResult::delivered();
    }
}

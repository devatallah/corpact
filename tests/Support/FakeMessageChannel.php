<?php

namespace Tests\Support;

use App\Services\Messaging\Channels\OutboundChannel;
use App\Services\Messaging\DeliveryResult;
use App\Services\Messaging\OutboundMessage;

/**
 * Captures outbound messages so tests can assert delivery. Bind it in a test
 * via `fakeMessages()` (see Pest.php), which registers it both as the legacy
 * `MessageChannel` binding and as the only channel in A14's delivery chain.
 *
 * `$failNext` lets a test drive the retry/fallback chain deterministically.
 */
class FakeMessageChannel implements OutboundChannel
{
    /** @var array<int, array{phone: string, message: string, purpose: string}> */
    public array $sent = [];

    /** Force the next N deliveries to report a retryable failure. */
    public int $failNext = 0;

    /** Report the channel as unconfigured (so the chain skips it). */
    public bool $configured = true;

    /** Report acceptance without delivery confirmation (drives the 60s escalation). */
    public bool $confirmsDelivery = true;

    public function name(): string
    {
        return 'fake';
    }

    public function isConfigured(): bool
    {
        return $this->configured;
    }

    public function send(string $phone, string $message, string $purpose): bool
    {
        return $this->deliver(new OutboundMessage($phone, $message, $purpose))->isSuccessful();
    }

    public function deliver(OutboundMessage $message): DeliveryResult
    {
        if ($this->failNext > 0) {
            $this->failNext--;

            return DeliveryResult::retryable('fake failure');
        }

        $this->sent[] = [
            'phone' => $message->phone,
            'message' => $message->body,
            'purpose' => $message->purpose,
        ];

        return $this->confirmsDelivery
            ? DeliveryResult::delivered('fake-'.count($this->sent))
            : DeliveryResult::accepted('fake-'.count($this->sent));
    }

    public function lastMessage(): ?string
    {
        return $this->sent === [] ? null : end($this->sent)['message'];
    }
}

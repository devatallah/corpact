<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\Messaging\MessageDispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * محاولة تسليم واحدة على قناة واحدة (H §14).
 *
 * المهمة نفسها `tries = 1`: إعادة المحاولة والتباعد الأسي والتحويل للقناة
 * البديلة كلها يديرها `MessageDispatcher` صراحةً بسطور سجل جديدة، حتى تكون
 * السلسلة مقروءة في `notification_logs` وقابلة للاختبار بلا عامل طابور حقيقي.
 */
class DeliverOutboundMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $notificationLogId) {}

    public function handle(MessageDispatcher $dispatcher): void
    {
        $log = NotificationLog::query()->find($this->notificationLogId);

        if ($log === null) {
            return;
        }

        $dispatcher->attempt($log);
    }
}

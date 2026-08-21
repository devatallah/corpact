<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\Messaging\MessageDispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * مهلة تأكيد التسليم (H §4/§14): قناة قبلت الرسالة ولم يصل تأكيد تسليمها خلال
 * ٦٠ ثانية ⇒ تُصعَّد فوراً إلى القناة البديلة. هذه هي الآلية التي تجعل الدخول
 * لا يعتمد على قناة واحدة.
 */
class ConfirmMessageDelivery implements ShouldQueue
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

        $dispatcher->confirmOrEscalate($log);
    }
}

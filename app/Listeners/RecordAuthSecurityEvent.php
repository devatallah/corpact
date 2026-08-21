<?php

namespace App\Listeners;

use App\Models\SecurityEvent;
use App\Services\Audit\SecurityEventService;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;

/**
 * H §19 — «سجل أحداث أمنية منفصل (دخول فاشل …)» plus the limits it pairs
 * with: «5 محاولات ← قفل 15 دقيقة».
 *
 * Listening to the framework events rather than each portal controller means
 * every guard (admin/company/partner/employee) is covered by construction,
 * including flows added later.
 */
class RecordAuthSecurityEvent
{
    public function handleFailed(Failed $event): void
    {
        $identifier = $event->credentials['email']
            ?? $event->credentials['phone']
            ?? null;

        SecurityEventService::loginFailed(
            is_string($identifier) ? $identifier : null,
            $event->guard,
            ['user_exists' => $event->user !== null],
        );
    }

    public function handleLockout(Lockout $event): void
    {
        $identifier = $event->request->input('email')
            ?? $event->request->input('phone');

        SecurityEventService::record(
            event: SecurityEvent::LOGIN_LOCKOUT,
            severity: SecurityEvent::SEVERITY_CRITICAL,
            context: ['path' => $event->request->path()],
            actorIdentifier: SecurityEventService::mask(is_string($identifier) ? $identifier : null),
            resolveActor: false,
        );
    }
}

<?php

namespace App\Services\Audit;

use App\Models\SecurityEvent;
use App\Support\Identity\CurrentActor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * A15 — the single writer of `security_events` (H §19: «سجل أحداث أمنية
 * منفصل: دخول فاشل، تغيير صلاحية، تغيير بيانات بنكية»).
 *
 * A9 flagged provider bank changes with a `security_event` key inside the
 * `activity_logs` JSON blob because this table did not exist yet; that flag
 * now also produces a real row here (see `BankAccountService`).
 */
class SecurityEventService
{
    /**
     * @param  array<string, mixed>  $context
     */
    public static function record(
        string $event,
        string $severity = SecurityEvent::SEVERITY_WARNING,
        ?Model $subject = null,
        ?int $companyId = null,
        array $context = [],
        ?string $actorIdentifier = null,
        ?string $guard = null,
        ?int $actorUserId = null,
        ?string $actorName = null,
        bool $resolveActor = true,
    ): SecurityEvent {
        if ($resolveActor && $actorUserId === null && $actorName === null) {
            ['id' => $actorUserId, 'name' => $actorName] = CurrentActor::resolve();
        }

        $companyId ??= self::inferCompanyId($subject);

        return SecurityEvent::create([
            'event' => $event,
            'severity' => $severity,
            'actor_user_id' => $actorUserId,
            'actor_name' => $actorName,
            'actor_identifier' => $actorIdentifier,
            'guard' => $guard,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'company_id' => $companyId,
            'ip_address' => self::requestValue(fn ($request) => $request->ip()),
            'user_agent' => self::requestValue(fn ($request) => $request->userAgent()),
            'context' => $context === [] ? null : $context,
        ]);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function loginFailed(?string $identifier, ?string $guard, array $context = []): SecurityEvent
    {
        return self::record(
            event: SecurityEvent::LOGIN_FAILED,
            severity: SecurityEvent::SEVERITY_WARNING,
            context: $context,
            actorIdentifier: self::mask($identifier),
            guard: $guard,
            // A failed login has no authenticated actor — never attribute it
            // to whoever happens to hold a session in the same request.
            resolveActor: false,
        );
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function permissionChanged(?Model $subject, array $context = [], ?int $companyId = null): SecurityEvent
    {
        return self::record(
            event: SecurityEvent::PERMISSION_CHANGED,
            severity: SecurityEvent::SEVERITY_WARNING,
            subject: $subject,
            companyId: $companyId,
            context: $context,
        );
    }

    /**
     * A phone number or email in a security row is a liability: keep enough
     * to correlate attempts, not enough to leak the account (G/وكيل الدعم:
     * «لا تنقل رقم جوال أو بيانات موظف خارج القناة الرسمية»).
     */
    public static function mask(?string $identifier): ?string
    {
        if ($identifier === null || $identifier === '') {
            return null;
        }

        if (str_contains($identifier, '@')) {
            [$local, $domain] = explode('@', $identifier, 2);

            return mb_substr($local, 0, 2).'***@'.$domain;
        }

        return mb_strlen($identifier) <= 4
            ? '***'
            : str_repeat('*', mb_strlen($identifier) - 4).mb_substr($identifier, -4);
    }

    private static function inferCompanyId(?Model $subject): ?int
    {
        $companyId = $subject?->getAttribute('company_id');

        return is_numeric($companyId) ? (int) $companyId : null;
    }

    /**
     * @param  callable(Request): (string|null)  $resolver
     */
    private static function requestValue(callable $resolver): ?string
    {
        if (! app()->bound('request')) {
            return null;
        }

        $value = $resolver(request());

        return $value === null ? null : mb_substr($value, 0, 1000);
    }
}

<?php

namespace App\Services\Provider;

use App\Models\Partner;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Audit\SecurityEventService;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * الحساب البنكي للمزوّد (H §11 + §17): اعتماد يدوي من أدمن تيمات، وهو شرط
 * لأي صرف (A11 يقرأ Partner::payoutsBlocked()). أي تغيير بعد الاعتماد يعيد
 * الحالة إلى «بانتظار الاعتماد» ويُسجَّل حدثاً أمنياً (H §19: تغيير بيانات
 * بنكية = حدث أمني).
 */
class BankAccountService
{
    /**
     * تحديث بيانات الحساب البنكي من لوحة المزوّد.
     */
    public function update(Partner $provider, string $accountHolder, string $iban): Partner
    {
        $iban = strtoupper(preg_replace('/\s+/', '', $iban) ?? '');

        if (! preg_match('/^SA\d{22}$/', $iban)) {
            throw ValidationException::withMessages([
                'bank_iban' => ['رقم الآيبان يجب أن يكون آيبان سعودياً صحيحاً (SA + 22 رقماً).'],
            ]);
        }

        return DB::transaction(function () use ($provider, $accountHolder, $iban) {
            /** @var Partner $locked */
            $locked = Partner::query()->whereKey($provider->id)->lockForUpdate()->firstOrFail();

            $wasApproved = $locked->bank_status === 'approved';
            $changed = $locked->bank_iban !== $iban || $locked->bank_account_holder !== $accountHolder;

            if (! $changed) {
                return $locked;
            }

            $locked->update([
                'bank_account_holder' => $accountHolder,
                'bank_iban' => $iban,
                // أي تغيير = بانتظار اعتماد يدوي جديد؛ الصرف محجوب حتى الاعتماد
                'bank_status' => 'pending',
                'bank_approved_at' => null,
                'bank_approved_by' => null,
            ]);

            ActivityLogService::log(
                null,
                $locked,
                $wasApproved ? 'security_bank_account_changed' : 'provider_bank_account_submitted',
                $wasApproved
                    ? "حدث أمني: تغيير بيانات الحساب البنكي لمزوّد معتمد #{$locked->id} — أُعيدت الحالة إلى بانتظار الاعتماد وحُجب الصرف"
                    : "قدّم المزوّد #{$locked->id} بيانات حسابه البنكي — بانتظار اعتماد أدمن تيمات",
                [
                    'iban_last4' => substr($iban, -4),
                    'was_approved' => $wasApproved,
                    'security_event' => $wasApproved,
                ],
            );

            // A15 — H §19: «سجل أحداث أمنية منفصل (… تغيير بيانات بنكية)».
            // A9 flagged this inside the activity payload while the table did
            // not exist; the flag stays for compatibility, the row is here.
            SecurityEventService::record(
                event: SecurityEvent::BANK_ACCOUNT_CHANGED,
                severity: $wasApproved ? SecurityEvent::SEVERITY_CRITICAL : SecurityEvent::SEVERITY_INFO,
                subject: $locked,
                context: [
                    'iban_last4' => substr($iban, -4),
                    'was_approved' => $wasApproved,
                    'payouts_blocked' => true,
                ],
            );

            return $locked;
        });
    }

    /**
     * اعتماد يدوي — أدمن تيمات (platform_admin) حصراً؛ يُفرض في طبقة المسار.
     */
    public function approve(Partner $provider, User $admin): Partner
    {
        return DB::transaction(function () use ($provider, $admin) {
            /** @var Partner $locked */
            $locked = Partner::query()->whereKey($provider->id)->lockForUpdate()->firstOrFail();

            if ($locked->bank_status !== 'pending') {
                throw ValidationException::withMessages([
                    'bank_status' => ['لا يمكن الاعتماد إلا لحساب بانتظار الاعتماد.'],
                ]);
            }

            $locked->update([
                'bank_status' => 'approved',
                'bank_approved_at' => now(),
                'bank_approved_by' => $admin->id,
            ]);

            ActivityLogService::log(
                null,
                $locked,
                'provider_bank_account_approved',
                "اعتمد أدمن تيمات الحساب البنكي للمزوّد #{$locked->id} — الصرف متاح",
                ['approved_by' => $admin->id],
                actorUserId: $admin->id,
                actorName: $admin->name,
            );

            SecurityEventService::record(
                event: SecurityEvent::BANK_ACCOUNT_APPROVED,
                severity: SecurityEvent::SEVERITY_WARNING,
                subject: $locked,
                context: ['approved_by' => $admin->id, 'iban_last4' => substr((string) $locked->bank_iban, -4)],
                actorUserId: $admin->id,
                actorName: $admin->name,
            );

            Notify::send('provider.bank_account.approved', $locked);

            return $locked;
        });
    }
}

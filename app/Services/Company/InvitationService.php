<?php

namespace App\Services\Company;

use App\Enums\DeliveryStatus;
use App\Enums\NotificationChannel;
use App\Models\Company;
use App\Models\Invitation;
use App\Models\NotificationLog;
use App\Services\Messaging\Channels\MessageChannel;
use App\Services\Notifications\TemplateRenderer;
use App\Support\Identity\PhoneNumber;
use App\Support\Notify;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Invitation lifecycle (H §5): a 7-day activation link delivered over the
 * outbound-message abstraction (WhatsApp driver is A14's; the log channel
 * serves dev). An expired link is only ever resent — resending extends the
 * SAME invitation; a new account is never created from expiry.
 */
class InvitationService
{
    public function __construct(private MessageChannel $channel) {}

    /**
     * Create and deliver an invitation.
     *
     * @param  array{email: string, name?: ?string, phone?: ?string, department_id?: ?int, employee_number?: ?string, employee_import_id?: ?int}  $attributes
     */
    public function invite(Company $company, array $attributes, ?int $invitedByEmployeeId = null): Invitation
    {
        $invitation = Invitation::create([
            'company_id' => $company->id,
            'invited_by' => $invitedByEmployeeId,
            'email' => $attributes['email'],
            'name' => $attributes['name'] ?? null,
            'phone' => PhoneNumber::normalize($attributes['phone'] ?? null),
            'department_id' => $attributes['department_id'] ?? null,
            'employee_number' => $attributes['employee_number'] ?? null,
            'employee_import_id' => $attributes['employee_import_id'] ?? null,
            'token' => Str::random(48),
            'status' => 'pending',
            'expires_at' => now()->addDays(Invitation::VALIDITY_DAYS),
            'last_sent_at' => now(),
            'send_count' => 1,
        ]);

        $this->deliver($invitation);

        return $invitation;
    }

    /**
     * Resend a pending or expired invitation: the same row is revived with a
     * fresh 7-day window («قابل لإعادة الإرسال» — never a new account).
     */
    public function resend(Invitation $invitation): Invitation
    {
        if ($invitation->status === 'accepted') {
            throw ValidationException::withMessages([
                'invitation' => ['هذه الدعوة مقبولة بالفعل — الموظف فعّل حسابه.'],
            ]);
        }

        $invitation->update([
            'status' => 'pending',
            'expires_at' => now()->addDays(Invitation::VALIDITY_DAYS),
            'last_sent_at' => now(),
            'send_count' => $invitation->send_count + 1,
        ]);

        $this->deliver($invitation);

        return $invitation;
    }

    /**
     * Deliver the activation link through the message channel. Email-only
     * invitations (no phone yet) have nothing to deliver to until A14 adds
     * the mail path — the link remains reachable from the portal.
     */
    public function deliver(Invitation $invitation): void
    {
        $companyName = $invitation->company()->withoutGlobalScopes()->value('name');

        $variables = [
            'company' => $companyName,
            'days' => Invitation::VALIDITY_DAYS,
            'url' => route('invitation.show', $invitation->token),
        ];

        // A14 — النص من قالب `invite.employee` وسلسلة القنوات تتكفل بواتساب ثم
        // الرسائل النصية. الدعوة إلزامية فلا تخضع لسياسة عدم الإزعاج.
        if ($invitation->phone !== null) {
            Notify::toPhone('invite.employee', $invitation->phone, $variables, ['purpose' => 'invitation']);

            return;
        }

        // ملاحظة A4: دعوة بلا رقم جوال كانت لا يُسلَّم لها شيء إطلاقاً. البريد
        // مسار احتياطي كامل حتى لا تسقط دعوة إلزامية بصمت.
        if ($invitation->email !== null) {
            $rendered = app(TemplateRenderer::class)->render('invite.employee', $variables);

            $log = NotificationLog::query()->create([
                'template_key' => 'invite.employee',
                'recipient_phone' => null,
                'channel' => NotificationChannel::Mail->value,
                'status' => DeliveryStatus::Queued,
                'attempt' => 1,
                'reason' => 'no_phone',
                'variables' => $variables,
                'rendered_body' => $rendered->body,
                'locale' => $rendered->locale,
                'purpose' => 'invitation',
                'queued_at' => now(),
            ]);

            try {
                Mail::raw($rendered->body, fn ($message) => $message->to($invitation->email)->subject($rendered->title));
                $log->markDelivered();
            } catch (\Throwable $e) {
                $log->markFailed($e->getMessage(), 'mail_failed');
            }
        }
    }
}

<?php

namespace App\Console\Commands;

use App\Models\CommunityPoll;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Invitation;
use App\Models\Notification;
use App\Models\QuickMatch;
use Illuminate\Console\Command;

class ExpireStaleRecords extends Command
{
    protected $signature = 'app:expire-stale';

    protected $description = 'انتهاء صلاحية الدعوات القديمة والتصويتات المنتهية والمباريات السريعة والفعاليات المنتهية مهلة الدفع';

    public function handle(): int
    {
        // Expire pending invitations older than 7 days
        $expiredInvitations = Invitation::where('status', 'pending')
            ->where('created_at', '<', now()->subDays(7))
            ->update(['status' => 'expired']);

        // Close polls past their expires_at
        $closedPolls = CommunityPoll::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => 'closed']);

        // Expire quick matches older than 14 days
        $expiredMatches = QuickMatch::where('status', 'open')
            ->where('created_at', '<', now()->subDays(14))
            ->update(['status' => 'expired']);

        // Cancel confirmed events past their 30-minute payment deadline
        // and refund community budget
        $expiredPayments = 0;
        $pastDeadlineEvents = Event::where('status', 'confirmed')
            ->whereNotNull('payment_deadline')
            ->where('payment_deadline', '<', now())
            ->with('community')
            ->get();

        foreach ($pastDeadlineEvents as $event) {
            // Refund community contribution since the payment window expired
            if ($event->budget_deducted_at) {
                $contribution = (float) $event->community_contribution;
                if ($contribution > 0 && $event->community) {
                    $event->community->increment('balance', $contribution);
                }
            }

            $event->update([
                'status' => 'cancelled',
                'rejection_reason' => 'تم إلغاء الفعالية تلقائياً — انتهت مهلة الدفع (30 دقيقة).',
            ]);

            // Notify company
            Notification::create([
                'notifiable_type' => \App\Models\Company::class,
                'notifiable_id' => $event->company_id,
                'type' => 'error',
                'title' => 'إلغاء تلقائي — انتهاء مهلة الدفع',
                'body' => "تم إلغاء الفعالية #{$event->id} — انتهت مهلة الدفع (30 دقيقة) وتم استرداد الميزانية",
                'data' => ['event_id' => $event->id],
            ]);

            // Notify community members
            $event->load('community.members');
            if ($event->community && $event->community->members) {
                foreach ($event->community->members as $member) {
                    Notification::create([
                        'notifiable_type' => Employee::class,
                        'notifiable_id' => $member->id,
                        'type' => 'error',
                        'title' => 'تم إلغاء الفعالية',
                        'body' => "تم إلغاء فعالية {$event->community->name} تلقائياً — انتهت مهلة الدفع",
                        'data' => ['event_id' => $event->id],
                    ]);
                }
            }

            $expiredPayments++;
        }

        $this->info("الدعوات المنتهية: {$expiredInvitations}");
        $this->info("التصويتات المغلقة: {$closedPolls}");
        $this->info("المباريات المنتهية: {$expiredMatches}");
        $this->info("فعاليات ملغاة (مهلة الدفع): {$expiredPayments}");

        return self::SUCCESS;
    }
}

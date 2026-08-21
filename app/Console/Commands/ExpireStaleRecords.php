<?php

namespace App\Console\Commands;

use App\Models\CommunityPoll;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Invitation;
use App\Models\QuickMatch;
use App\Services\Events\EventStateMachine;
use App\Services\Events\IllegalEventTransition;
use App\Support\Notify;
use Illuminate\Console\Command;

class ExpireStaleRecords extends Command
{
    protected $signature = 'app:expire-stale';

    protected $description = 'انتهاء صلاحية الدعوات القديمة والتصويتات المنتهية والمباريات السريعة واقتراحات الفعاليات منتهية مهلة الاعتماد';

    public function handle(): int
    {
        // Expire pending invitations past their 7-day window. Invitations
        // created before the explicit `expires_at` column fall back to
        // created_at + 7 days (A4 — H §5).
        $expiredInvitations = Invitation::where('status', 'pending')
            ->where(function ($query) {
                $query->where(fn ($q) => $q->whereNotNull('expires_at')->where('expires_at', '<', now()))
                    ->orWhere(fn ($q) => $q->whereNull('expires_at')->where('created_at', '<', now()->subDays(7)));
            })
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

        // مهلة الدفع القديمة (30 دقيقة بعد قبول المزوّد) ماتت مع آلة A7 —
        // مهلة تحصيل الحصص الحقيقية (awaiting_payment ← cancelled_payment_failed)
        // ملك A10 في app:expire-payment-deadlines.

        // H §7: اقتراح موظف بلا اعتماد خلال 48 ساعة → rejected تلقائياً
        // مع إشعار المُقترح.
        $autoRejected = 0;
        $approvalHours = (int) config('events.proposal_approval_hours', 48);
        $machine = app(EventStateMachine::class);

        $staleProposals = Event::where('status', 'pending_approval')
            ->where('created_at', '<', now()->subHours($approvalHours))
            ->get();

        foreach ($staleProposals as $event) {
            try {
                $machine->rejectProposal($event, null, "انقضت مهلة الاعتماد ({$approvalHours} ساعة) دون قرار — رُفض الاقتراح تلقائياً");

                Notify::sendToId(
                    'event.proposal.auto_rejected',
                    Employee::class,
                    (int) $event->created_by,
                    ['hours' => $approvalHours],
                    ['data' => ['event_id' => $event->id]],
                );

                $autoRejected++;
            } catch (IllegalEventTransition) {
                // سباق مع اعتماد/رفض متزامن — تجاهل.
            }
        }

        $this->info("الدعوات المنتهية: {$expiredInvitations}");
        $this->info("التصويتات المغلقة: {$closedPolls}");
        $this->info("المباريات المنتهية: {$expiredMatches}");
        $this->info("اقتراحات مرفوضة تلقائياً (48 ساعة): {$autoRejected}");

        return self::SUCCESS;
    }
}

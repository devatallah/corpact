<?php

namespace App\Console\Commands;

use App\Models\CommunityPoll;
use App\Models\Invitation;
use App\Models\QuickMatch;
use Illuminate\Console\Command;

class ExpireStaleRecords extends Command
{
    protected $signature = 'app:expire-stale';

    protected $description = 'انتهاء صلاحية الدعوات القديمة والتصويتات المنتهية والمباريات السريعة';

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

        $this->info("الدعوات المنتهية: {$expiredInvitations}");
        $this->info("التصويتات المغلقة: {$closedPolls}");
        $this->info("المباريات المنتهية: {$expiredMatches}");

        return self::SUCCESS;
    }
}

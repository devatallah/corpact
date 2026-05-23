<?php

namespace App\Console\Commands;

use App\Models\Community;
use App\Models\Event;
use App\Models\QuickMatch;
use App\Services\Employee\QuickMatchService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SuggestQuickMatches extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:suggest-matches';

    /**
     * The console command description.
     */
    protected $description = 'إنشاء لعبات سريعة تلقائية للمجتمعات غير النشطة';

    /**
     * Execute the console command.
     */
    public function handle(QuickMatchService $quickMatchService): int
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);
        $count = 0;

        $communities = Community::active()->get();

        foreach ($communities as $community) {
            // Skip if an open quick match already exists for this community
            $hasOpenMatch = QuickMatch::where('community_id', $community->id)
                ->open()
                ->exists();

            if ($hasOpenMatch) {
                continue;
            }

            // Find the most recent confirmed/completed event date
            $lastEventDate = Event::where('community_id', $community->id)
                ->whereIn('status', ['confirmed', 'completed'])
                ->max('event_date');

            // Skip if the community had an event within the last 7 days
            if ($lastEventDate && Carbon::parse($lastEventDate)->gte($sevenDaysAgo)) {
                continue;
            }

            // Create an auto-suggested quick match
            $quickMatch = QuickMatch::create([
                'community_id' => $community->id,
                'created_by' => null,
                'preferred_date' => null,
                'preferred_time' => null,
                'message' => 'مجتمعكم ما لعب من فترة، وش رايكم نسوي مباراة؟',
                'source' => 'auto',
                'status' => 'open',
            ]);

            // Notify community members
            $quickMatchService->notifyCommunityMembers($quickMatch);

            $count++;
        }

        $this->info("تم إنشاء {$count} لعبة سريعة تلقائية.");

        return self::SUCCESS;
    }
}

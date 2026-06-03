<?php

namespace App\Console\Commands;

use App\Models\Community;
use App\Models\Event;
use App\Models\QuickMatch;
use App\Models\QuickMatchOption;
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
    protected $description = 'إنشاء تصويتات تلقائية للمجتمعات غير النشطة';

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

            // Create an auto-suggested quick match poll
            $quickMatch = QuickMatch::create([
                'community_id' => $community->id,
                'created_by' => null,
                'message' => 'مجتمعكم ما لعب من فترة، وش رايكم نسوي مباراة؟ صوّتوا على الموعد المناسب!',
                'source' => 'auto',
                'status' => 'open',
            ]);

            // Create default date/time options for the next few days
            $nextThursday = Carbon::now()->next(Carbon::THURSDAY);
            $nextFriday = Carbon::now()->next(Carbon::FRIDAY);
            $nextSaturday = Carbon::now()->next(Carbon::SATURDAY);

            QuickMatchOption::create([
                'quick_match_id' => $quickMatch->id,
                'date' => $nextThursday->toDateString(),
                'time' => '18:00',
                'sort_order' => 0,
            ]);

            QuickMatchOption::create([
                'quick_match_id' => $quickMatch->id,
                'date' => $nextFriday->toDateString(),
                'time' => '20:00',
                'sort_order' => 1,
            ]);

            QuickMatchOption::create([
                'quick_match_id' => $quickMatch->id,
                'date' => $nextSaturday->toDateString(),
                'time' => '18:00',
                'sort_order' => 2,
            ]);

            // Notify community members
            $quickMatchService->notifyCommunityMembers($quickMatch);

            $count++;
        }

        $this->info("تم إنشاء {$count} تصويت تلقائي.");

        return self::SUCCESS;
    }
}

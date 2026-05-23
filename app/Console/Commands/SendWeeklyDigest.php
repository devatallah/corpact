<?php

namespace App\Console\Commands;

use App\Models\CommunityMember;
use App\Models\Employee;
use App\Models\Event;
use App\Models\LeagueMatch;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendWeeklyDigest extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:weekly-digest';

    /**
     * The console command description.
     */
    protected $description = 'إرسال الملخص الأسبوعي للموظفين';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();
        $weekAgo = $now->copy()->subWeek();
        $weekFromNow = $now->copy()->addWeek();

        $employees = Employee::active()
            ->whereHas('communities')
            ->with('communities')
            ->get();

        if ($employees->isEmpty()) {
            $this->info('لا يوجد موظفون لديهم مجتمعات.');

            return self::SUCCESS;
        }

        $count = 0;

        foreach ($employees as $employee) {
            $communityIds = $employee->communities->pluck('id')->toArray();

            // 1. Upcoming events in the next 7 days (open or confirmed)
            $upcomingEventsCount = Event::whereIn('community_id', $communityIds)
                ->whereIn('status', ['open', 'confirmed'])
                ->whereBetween('event_date', [$now->toDateString(), $weekFromNow->toDateString()])
                ->count();

            // 2. New members who joined their communities in the last 7 days
            $newMembersCount = CommunityMember::whereIn('community_id', $communityIds)
                ->where('joined_at', '>=', $weekAgo)
                ->count();

            // 3. League matches played in the last 7 days in their communities
            $matchesPlayed = LeagueMatch::where('status', 'played')
                ->whereHas('league', fn ($q) => $q->whereIn('community_id', $communityIds))
                ->where('updated_at', '>=', $weekAgo)
                ->count();

            // 4. Streak — consecutive weeks with event participation
            $streak = $this->calculateStreak($employee);

            // Build Arabic body text
            $body = "📅 لديك {$upcomingEventsCount} فعاليات قادمة هذا الأسبوع\n"
                . "👥 انضم {$newMembersCount} أعضاء جدد لمجتمعاتك\n"
                . "🏆 تم لعب {$matchesPlayed} مباريات في الدوريات\n"
                . "🔥 سلسلتك: {$streak} أسابيع متتالية";

            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $employee->id,
                'type' => 'weekly_digest',
                'title' => 'ملخصك الأسبوعي',
                'body' => $body,
                'data' => [
                    'upcoming_events_count' => $upcomingEventsCount,
                    'new_members_count' => $newMembersCount,
                    'matches_played' => $matchesPlayed,
                    'streak' => $streak,
                ],
            ]);

            $count++;
        }

        $this->info("تم إرسال الملخص الأسبوعي لـ {$count} موظف.");

        return self::SUCCESS;
    }

    /**
     * Calculate consecutive weeks with event participation for an employee.
     * Counts backwards from the current week, checking if the employee
     * has a joined event_participant for a confirmed/completed event in each week.
     */
    private function calculateStreak(Employee $employee): int
    {
        $streak = 0;
        $currentWeekStart = Carbon::now()->startOfWeek();

        for ($i = 0; $i < 52; $i++) {
            $weekStart = $currentWeekStart->copy()->subWeeks($i);
            $weekEnd = $weekStart->copy()->endOfWeek();

            $hasParticipation = $employee->events()
                ->whereIn('events.status', ['confirmed', 'completed'])
                ->wherePivot('status', 'joined')
                ->whereBetween('event_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
                ->exists();

            if ($hasParticipation) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}

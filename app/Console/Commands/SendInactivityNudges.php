<?php

namespace App\Console\Commands;

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendInactivityNudges extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:send-nudges';

    /**
     * The console command description.
     */
    protected $description = 'إرسال تنبيهات النشاط للموظفين غير النشطين';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $inactiveCount = $this->nudgeInactiveEmployees();
        $communityCount = $this->nudgeInactiveCommunities();
        $newMemberCount = $this->nudgeNewMembers();

        $this->info("تم إرسال التنبيهات: {$inactiveCount} موظف غير نشط، {$communityCount} مجتمع غير نشط، {$newMemberCount} عضو جديد.");

        return self::SUCCESS;
    }

    /**
     * Nudge employees who haven't participated in any event for 7+ days.
     */
    private function nudgeInactiveEmployees(): int
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);
        $count = 0;

        // Get active employees who are members of at least one community
        $employees = Employee::active()
            ->whereHas('communities')
            ->get();

        foreach ($employees as $employee) {
            // Find the most recent event participation (joined + confirmed/completed event)
            $lastEventDate = Event::whereHas('participants', function ($q) use ($employee) {
                $q->where('employee_id', $employee->id)
                    ->where('event_participants.status', 'joined');
            })
                ->whereIn('events.status', ['confirmed', 'completed'])
                ->max('event_date');

            // Skip if they participated in an event within the last 7 days
            if ($lastEventDate && Carbon::parse($lastEventDate)->gte($sevenDaysAgo)) {
                continue;
            }

            // If they have no participations at all and no communities, skip (already filtered above)
            // If they have recent participations, skip (handled above)
            // Now check: don't nudge if already nudged in the last 7 days
            $alreadyNudged = Notification::where('notifiable_type', Employee::class)
                ->where('notifiable_id', $employee->id)
                ->where('type', 'nudge_inactive')
                ->where('created_at', '>=', $sevenDaysAgo)
                ->exists();

            if ($alreadyNudged) {
                continue;
            }

            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $employee->id,
                'type' => 'nudge_inactive',
                'title' => 'وحشتنا! 👋',
                'body' => 'فريقك سوّى فعاليات وأنت غايب، ارجع العب معهم!',
                'data' => [
                    'nudge_type' => 'inactive_employee',
                ],
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Nudge community leaders whose communities haven't had an event in 14+ days.
     */
    private function nudgeInactiveCommunities(): int
    {
        $fourteenDaysAgo = Carbon::now()->subDays(14);
        $count = 0;

        // Get active communities that have a leader
        $communities = Community::active()
            ->whereNotNull('leader_id')
            ->get();

        foreach ($communities as $community) {
            // Find the most recent event date for this community
            $lastEventDate = Event::where('community_id', $community->id)
                ->whereIn('status', ['confirmed', 'completed'])
                ->max('event_date');

            // Skip if the community had an event within the last 14 days
            if ($lastEventDate && Carbon::parse($lastEventDate)->gte($fourteenDaysAgo)) {
                continue;
            }

            // Don't nudge same leader for same community in last 14 days
            $alreadyNudged = Notification::where('notifiable_type', Employee::class)
                ->where('notifiable_id', $community->leader_id)
                ->where('type', 'nudge_community')
                ->where('created_at', '>=', $fourteenDaysAgo)
                ->whereJsonContains('data->community_id', $community->id)
                ->exists();

            if ($alreadyNudged) {
                continue;
            }

            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $community->leader_id,
                'type' => 'nudge_community',
                'title' => 'مجتمعك يحتاجك! 🏃',
                'body' => "مجتمع {$community->name} ما لعب من أسبوعين، وش رايك تسوي فعالية؟",
                'data' => [
                    'nudge_type' => 'inactive_community',
                    'community_id' => $community->id,
                    'community_name' => $community->name,
                ],
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Nudge new community members who joined 7+ days ago but never attended
     * an event in that community.
     */
    private function nudgeNewMembers(): int
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);
        $count = 0;

        // Find community members who joined 7+ days ago
        $memberships = CommunityMember::where('joined_at', '<=', $sevenDaysAgo)
            ->with(['community', 'employee'])
            ->get();

        foreach ($memberships as $membership) {
            $employee = $membership->employee;
            $community = $membership->community;

            // Skip if employee or community is missing/inactive
            if (!$employee || !$community || $employee->status !== 'active' || $community->status !== 'active') {
                continue;
            }

            // Check if the employee has any event participation (joined) for an event in this community
            $hasParticipated = Event::where('community_id', $community->id)
                ->whereIn('status', ['confirmed', 'completed'])
                ->whereHas('participants', function ($q) use ($employee) {
                    $q->where('employee_id', $employee->id)
                        ->where('event_participants.status', 'joined');
                })
                ->exists();

            if ($hasParticipated) {
                continue;
            }

            // Don't nudge same employee for same community twice (ever)
            $alreadyNudged = Notification::where('notifiable_type', Employee::class)
                ->where('notifiable_id', $employee->id)
                ->where('type', 'nudge_new_member')
                ->whereJsonContains('data->community_id', $community->id)
                ->exists();

            if ($alreadyNudged) {
                continue;
            }

            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $employee->id,
                'type' => 'nudge_new_member',
                'title' => 'وقت أول مباراة! 🏸',
                'body' => "انضميت لـ {$community->name} ولسّا ما لعبت، أول مباراة دايم أحلى!",
                'data' => [
                    'nudge_type' => 'new_member_no_play',
                    'community_id' => $community->id,
                    'community_name' => $community->name,
                ],
            ]);

            $count++;
        }

        return $count;
    }
}

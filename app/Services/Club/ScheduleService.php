<?php

namespace App\Services\Club;

use App\Models\Club;
use App\Models\Court;
use App\Models\Event;
use App\Models\Slot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ScheduleService
{
    /**
     * Get schedule grid data: events organized by court and time slot for a given date.
     *
     * @return array{courts: Collection, grid: Collection, date: string}
     */
    public function getScheduleGrid(Club $club, string $date): array
    {
        $parsedDate = Carbon::parse($date);
        $weekStart = $parsedDate->copy()->startOfWeek(Carbon::SUNDAY);
        $weekEnd = $weekStart->copy()->addDays(6);

        $courts = Court::query()
            ->where('club_id', $club->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'sport_id']);

        $events = Event::query()
            ->with(['courts', 'community.company', 'sport'])
            ->where('club_id', $club->id)
            ->whereBetween('event_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->orderBy('start_time')
            ->get();

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $weekStart->copy()->addDays($i);
            $dayStr = $day->toDateString();

            $dayEvents = $events->filter(fn (Event $e) => substr((string) $e->event_date, 0, 10) === $dayStr);

            $days[] = [
                'date' => $dayStr,
                'day_name' => $this->arabicDayName($day->dayOfWeek),
                'events' => $dayEvents->values()->map(fn (Event $event) => [
                    'id' => $event->id,
                    'start_time' => $event->start_time,
                    'duration_minutes' => $event->duration_minutes,
                    'company_name' => $event->community?->company?->name ?? $event->company?->name,
                    'sport_name' => $event->sport?->name,
                    'sport_icon' => $event->sport?->icon,
                    'status' => $event->status,
                    'capacity' => $event->capacity,
                    'participants_count' => $event->participants_count,
                    'court_ids' => $event->courts->pluck('id')->toArray(),
                ])->all(),
            ];
        }

        return [
            'courts' => $courts,
            'days' => $days,
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekEnd->toDateString(),
        ];
    }

    private function arabicDayName(int $dayOfWeek): string
    {
        return match ($dayOfWeek) {
            Carbon::SUNDAY => 'الأحد',
            Carbon::MONDAY => 'الاثنين',
            Carbon::TUESDAY => 'الثلاثاء',
            Carbon::WEDNESDAY => 'الأربعاء',
            Carbon::THURSDAY => 'الخميس',
            Carbon::FRIDAY => 'الجمعة',
            Carbon::SATURDAY => 'السبت',
            default => '',
        };
    }

    /**
     * Create a schedule slot for a court on a given date.
     */
    public function getSchedule(int $clubId, string $date): Collection
    {
        $courtIds = Court::where('club_id', $clubId)->pluck('id');

        return Slot::whereIn('court_id', $courtIds)
            ->whereDate('date', $date)
            ->orderBy('start_time')
            ->get();
    }
}

<?php

namespace App\Services\Business;

use App\Models\Business;
use App\Models\Venue;
use App\Models\Event;
use App\Models\Slot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ScheduleService
{
    /**
     * Get schedule grid data: events organized by venue and time slot for a given date.
     *
     * @return array{venues: Collection, grid: Collection, date: string}
     */
    public function getScheduleGrid(Business $business, string $date): array
    {
        $parsedDate = Carbon::parse($date);
        $weekStart = $parsedDate->copy()->startOfWeek(Carbon::SUNDAY);
        $weekEnd = $weekStart->copy()->addDays(6);

        $venues = Venue::query()
            ->where('business_id', $business->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'category_id']);

        $events = Event::query()
            ->with(['venues', 'community.company', 'category'])
            ->where('business_id', $business->id)
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
                    'category_name' => $event->category?->name,
                    'category_icon' => $event->category?->icon,
                    'status' => $event->status,
                    'capacity' => $event->capacity,
                    'participants_count' => $event->participants_count,
                    'venue_ids' => $event->venues->pluck('id')->toArray(),
                ])->all(),
            ];
        }

        return [
            'venues' => $venues,
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
     * Create a schedule slot for a venue on a given date.
     */
    public function getSchedule(int $businessId, string $date): Collection
    {
        $venueIds = Venue::where('business_id', $businessId)->pluck('id');

        return Slot::whereIn('venue_id', $venueIds)
            ->whereDate('date', $date)
            ->orderBy('start_time')
            ->get();
    }
}

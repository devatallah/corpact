<?php

namespace App\Services\Business;

use App\Models\Business;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BusinessReportService
{
    private static array $arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

    /**
     * Overview stats for the business.
     */
    public function overview(Business $business): array
    {
        $resolved = $business->resolvedBusiness();
        $businessId = $resolved->id;

        $now = Carbon::now();
        $thisMonthStart = $now->copy()->startOfMonth()->toDateString();
        $thisMonthEnd   = $now->copy()->endOfMonth()->toDateString();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth()->toDateString();

        $statuses = ['confirmed', 'completed'];

        // This month
        $thisMonth = DB::table('events')
            ->where('business_id', $businessId)
            ->whereIn('status', $statuses)
            ->whereBetween('event_date', [$thisMonthStart, $thisMonthEnd])
            ->selectRaw('COUNT(*) as bookings, COALESCE(SUM(total_amount), 0) as revenue')
            ->first();

        // Last month
        $lastMonth = DB::table('events')
            ->where('business_id', $businessId)
            ->whereIn('status', $statuses)
            ->whereBetween('event_date', [$lastMonthStart, $lastMonthEnd])
            ->selectRaw('COUNT(*) as bookings, COALESCE(SUM(total_amount), 0) as revenue')
            ->first();

        // All-time distinct companies
        $companiesCount = DB::table('events')
            ->where('business_id', $businessId)
            ->whereIn('status', $statuses)
            ->distinct()
            ->count('company_id');

        $thisBookings = (int) ($thisMonth->bookings ?? 0);
        $thisRevenue  = (float) ($thisMonth->revenue ?? 0);
        $lastBookings = (int) ($lastMonth->bookings ?? 0);
        $lastRevenue  = (float) ($lastMonth->revenue ?? 0);

        $avgBooking = $thisBookings > 0 ? round($thisRevenue / $thisBookings, 2) : 0;

        $bookingsChangePct = $lastBookings > 0
            ? round((($thisBookings - $lastBookings) / $lastBookings) * 100, 1)
            : ($thisBookings > 0 ? 100.0 : 0.0);

        $revenueChangePct = $lastRevenue > 0
            ? round((($thisRevenue - $lastRevenue) / $lastRevenue) * 100, 1)
            : ($thisRevenue > 0 ? 100.0 : 0.0);

        return [
            'bookings'             => $thisBookings,
            'revenue'              => $thisRevenue,
            'companies'            => $companiesCount,
            'avg_booking'          => $avgBooking,
            'bookings_change_pct'  => $bookingsChangePct,
            'revenue_change_pct'   => $revenueChangePct,
        ];
    }

    /**
     * Monthly revenue for the last 6 months.
     */
    public function monthlyRevenue(Business $business): array
    {
        $resolved   = $business->resolvedBusiness();
        $businessId = $resolved->id;

        $statuses = ['confirmed', 'completed'];
        $now      = Carbon::now();

        // Build a list of the last 6 months (oldest first)
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $months[] = $now->copy()->subMonths($i)->startOfMonth();
        }

        // Fetch aggregated revenue grouped by year-month
        $rows = DB::table('events')
            ->where('business_id', $businessId)
            ->whereIn('status', $statuses)
            ->where('event_date', '>=', $months[0]->toDateString())
            ->selectRaw("DATE_FORMAT(event_date, '%Y-%m') as ym, COALESCE(SUM(total_amount), 0) as amount")
            ->groupBy('ym')
            ->get()
            ->keyBy('ym');

        $currentYm = $now->format('Y-m');

        $result = [];
        foreach ($months as $month) {
            $ym     = $month->format('Y-m');
            $amount = isset($rows[$ym]) ? (float) $rows[$ym]->amount : 0.0;

            $result[] = [
                'month'      => self::$arabicMonths[$month->month - 1],
                'amount'     => $amount,
                'is_current' => $ym === $currentYm,
            ];
        }

        return $result;
    }

    /**
     * Top companies by booking count.
     */
    public function topCompanies(Business $business): array
    {
        $resolved   = $business->resolvedBusiness();
        $businessId = $resolved->id;

        $statuses = ['confirmed', 'completed'];

        $rows = DB::table('events')
            ->join('companies', 'events.company_id', '=', 'companies.id')
            ->where('events.business_id', $businessId)
            ->whereIn('events.status', $statuses)
            ->selectRaw('companies.name as company_name, COUNT(*) as bookings, COALESCE(SUM(events.total_amount), 0) as revenue, MAX(events.event_date) as last_booking')
            ->groupBy('events.company_id', 'companies.name')
            ->orderByDesc('bookings')
            ->get();

        $top5  = $rows->take(5);
        $rest  = $rows->skip(5);

        $result = $top5->map(function ($row) {
            return [
                'company_name' => $row->company_name,
                'bookings'     => (int) $row->bookings,
                'revenue'      => (float) $row->revenue,
                'last_booking' => $row->last_booking,
            ];
        })->values()->toArray();

        if ($rest->count() > 0) {
            $othersBookings = $rest->sum('bookings');
            $othersRevenue  = $rest->sum('revenue');
            $othersLastBook = $rest->max('last_booking');

            $result[] = [
                'company_name' => 'أخرى (' . $rest->count() . ')',
                'bookings'     => (int) $othersBookings,
                'revenue'      => (float) $othersRevenue,
                'last_booking' => $othersLastBook,
            ];
        }

        return $result;
    }

    /**
     * Demand heatmap: bookings by day of week × time slot.
     */
    public function demandHeatmap(Business $business): array
    {
        $resolved   = $business->resolvedBusiness();
        $businessId = $resolved->id;

        $now            = Carbon::now();
        $thisMonthStart = $now->copy()->startOfMonth()->toDateString();
        $thisMonthEnd   = $now->copy()->endOfMonth()->toDateString();

        $statuses = ['confirmed', 'completed'];

        // DAYOFWEEK: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
        $rows = DB::table('events')
            ->where('business_id', $businessId)
            ->whereIn('status', $statuses)
            ->whereBetween('event_date', [$thisMonthStart, $thisMonthEnd])
            ->selectRaw('DAYOFWEEK(event_date) as dow, HOUR(start_time) as hr, COUNT(*) as cnt')
            ->groupByRaw('DAYOFWEEK(event_date), HOUR(start_time)')
            ->get();

        // Slot definitions
        $slotOrder = ['4pm', '6pm', '7pm', '9pm'];
        $slotLabels = [
            '4pm' => '٤م',
            '6pm' => '٦م',
            '7pm' => '٧م',
            '9pm' => '٩م',
        ];

        // Map MySQL DAYOFWEEK (1=Sun..7=Sat) to Arabic day names
        // We want display order: Sat, Sun, Mon, Tue, Wed, Thu, Fri
        $dowToArabic = [
            1 => 'الأحد',
            2 => 'الاثنين',
            3 => 'الثلاثاء',
            4 => 'الأربعاء',
            5 => 'الخميس',
            6 => 'الجمعة',
            7 => 'السبت',
        ];

        $dayOrder = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

        // Initialise the heatmap matrix
        $matrix = [];
        foreach ($slotOrder as $slot) {
            $matrix[$slot] = array_fill_keys($dayOrder, 0);
        }

        // Bucket each row into a slot
        foreach ($rows as $row) {
            $hr  = (int) $row->hr;
            $cnt = (int) $row->cnt;
            $day = $dowToArabic[$row->dow] ?? null;

            if ($day === null) {
                continue;
            }

            if ($hr < 17) {
                $slot = '4pm';
            } elseif ($hr < 19) {
                $slot = '6pm';
            } elseif ($hr < 21) {
                $slot = '7pm';
            } else {
                $slot = '9pm';
            }

            $matrix[$slot][$day] += $cnt;
        }

        // Build result with intensity levels
        $result = [];
        foreach ($slotOrder as $slot) {
            $days = $matrix[$slot];

            $daysWithIntensity = [];
            foreach ($days as $day => $count) {
                if ($count < 5) {
                    $intensity = 'low';
                } elseif ($count <= 10) {
                    $intensity = 'medium';
                } else {
                    $intensity = 'high';
                }

                $daysWithIntensity[$day] = [
                    'count'     => $count,
                    'intensity' => $intensity,
                ];
            }

            $result[] = [
                'slot'  => $slot,
                'label' => $slotLabels[$slot],
                'days'  => $daysWithIntensity,
            ];
        }

        // Insight: find lowest-demand slots (slots where total count is lowest)
        $slotTotals = [];
        foreach ($result as $item) {
            $total = array_sum(array_column($item['days'], 'count'));
            $slotTotals[$item['slot']] = $total;
        }

        $minTotal      = min($slotTotals);
        $lowestSlots   = array_keys(array_filter($slotTotals, fn ($v) => $v === $minTotal));
        $lowestLabels  = array_map(fn ($s) => $slotLabels[$s], $lowestSlots);
        $insightText   = 'أقل الأوقات طلباً: ' . implode('، ', $lowestLabels);

        return [
            'heatmap' => $result,
            'insight' => $insightText,
        ];
    }
}

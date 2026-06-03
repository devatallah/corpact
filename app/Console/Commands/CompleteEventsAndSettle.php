<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Models\Event;
use App\Models\PlatformRevenue;
use App\Models\Settlement;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CompleteEventsAndSettle extends Command
{
    protected $signature = 'app:complete-events';

    protected $description = 'تحويل الفعاليات المؤكدة المنتهية إلى مكتملة وإنشاء التسويات';

    public function handle(): int
    {
        $completedCount = 0;
        $settlementCount = 0;

        // Step 1: Mark confirmed events as completed if their date+time has passed
        $events = Event::where('status', 'confirmed')
            ->where('event_date', '<', Carbon::today())
            ->get();

        foreach ($events as $event) {
            $event->update(['status' => 'completed']);
            $completedCount++;
        }

        // Also mark events from today that have already ended
        $todayEvents = Event::where('status', 'confirmed')
            ->where('event_date', Carbon::today()->toDateString())
            ->get();

        foreach ($todayEvents as $event) {
            $endTime = Carbon::createFromFormat('H:i:s', $event->start_time)
                ->addMinutes($event->duration_minutes);

            if (Carbon::now()->gte($endTime)) {
                $event->update(['status' => 'completed']);
                $completedCount++;
            }
        }

        // Step 2: Generate settlements for completed events without settlements
        $period = Carbon::now()->format('Y-m');

        $unsettledEvents = Event::where('status', 'completed')
            ->whereDoesntHave('platformRevenues')
            ->whereNotNull('business_id')
            ->with('business')
            ->get();

        // Group by business for settlement creation
        $byBusiness = $unsettledEvents->groupBy('business_id');

        foreach ($byBusiness as $businessId => $bizEvents) {
            $business = Business::find($businessId);
            if (! $business) {
                continue;
            }

            $commissionRate = (float) ($business->commission_rate ?? 10) / 100;

            DB::transaction(function () use ($business, $bizEvents, $period, $commissionRate, &$settlementCount) {
                $grossAmount = $bizEvents->sum('total_amount');
                $commissionAmount = round($grossAmount * $commissionRate, 2);
                $netAmount = $grossAmount - $commissionAmount;

                $settlement = Settlement::create([
                    'business_id' => $business->id,
                    'company_id' => $bizEvents->first()->company_id,
                    'period' => $period,
                    'events_count' => $bizEvents->count(),
                    'gross_amount' => $grossAmount,
                    'commission_amount' => $commissionAmount,
                    'net_amount' => $netAmount,
                    'status' => 'pending',
                ]);

                foreach ($bizEvents as $event) {
                    $eventCommission = round((float) $event->total_amount * $commissionRate, 2);

                    PlatformRevenue::create([
                        'settlement_id' => $settlement->id,
                        'event_id' => $event->id,
                        'amount' => $eventCommission,
                        'source' => 'commission',
                        'description' => "عمولة الفعالية #{$event->id}",
                        'revenue_date' => $event->event_date,
                    ]);
                }

                $business->increment('total_bookings', $bizEvents->count());

                $settlementCount++;
            });
        }

        $this->info("تم تحويل {$completedCount} فعالية إلى مكتملة.");
        $this->info("تم إنشاء {$settlementCount} تسوية.");

        return self::SUCCESS;
    }
}

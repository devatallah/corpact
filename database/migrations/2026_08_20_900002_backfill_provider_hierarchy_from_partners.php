<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A9 — Backfill: every existing partner (owner rows only — staff rows share the
 * parent's hierarchy) becomes a provider with one default branch; its venues
 * become activity units under that branch (pricing from the venue's cheapest
 * venue_pricing row); branch working hours are parsed from the legacy
 * `partners.working_hours` string ("06:00 - 00:00") applied to all 7 days.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $partners = DB::table('partners')->whereNull('parent_id')->get();

        foreach ($partners as $partner) {
            $existing = DB::table('provider_branches')->where('partner_id', $partner->id)->exists();
            if ($existing) {
                continue;
            }

            $branchId = DB::table('provider_branches')->insertGetId([
                'partner_id' => $partner->id,
                'name' => 'الفرع الرئيسي',
                'address' => trim(($partner->city ?? '').' '.($partner->district ?? '')) ?: null,
                'city' => $partner->city,
                'district' => $partner->district,
                'working_hours' => json_encode($this->parseWorkingHours($partner->working_hours)),
                'contact_name' => $partner->contact_name,
                'contact_phone' => $partner->contact_phone,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $venues = DB::table('venues')->where('partner_id', $partner->id)->get();

            // A10 حوّل أعمدة السعر إلى هللات (price_halalas) بعد هذا الترحيل —
            // إعادة التشغيل idempotent بعد التحويل تكتب العمود الموجود فعلاً.
            $halalaColumns = Schema::hasColumn('activity_units', 'price_halalas');

            foreach ($venues as $venue) {
                $pricing = DB::table('venue_pricings')
                    ->where('venue_id', $venue->id)
                    ->orderBy($halalaColumns ? 'price_halalas' : 'price')
                    ->first();

                DB::table('activity_units')->insert([
                    'provider_branch_id' => $branchId,
                    'category_id' => $venue->category_id,
                    'venue_id' => $venue->id,
                    'name' => $venue->name,
                    'min_capacity' => 1,
                    'max_capacity' => 30,
                    'pricing_type' => 'unit_hour',
                    ...($halalaColumns
                        ? ['price_halalas' => $pricing->price_halalas ?? 0]
                        : ['price' => $pricing->price ?? 0]),
                    'default_duration_minutes' => $pricing->duration_minutes ?? 60,
                    'status' => $venue->status === 'active' ? 'active' : 'maintenance',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // الفروع والوحدات المولّدة هنا تُحذف مع جداولها في migration المخطط.
    }

    /**
     * "06:00 - 00:00" → same window on all seven days. Unparseable/absent
     * strings → open 24h (availability rules stay permissive for legacy data).
     *
     * @return array<string, array<int, array{from: string, to: string}>>
     */
    private function parseWorkingHours(?string $legacy): array
    {
        $from = '00:00';
        $to = '23:59';

        if ($legacy && preg_match('/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/u', $legacy, $m)) {
            $from = strlen($m[1]) === 4 ? '0'.$m[1] : $m[1];
            $to = strlen($m[2]) === 4 ? '0'.$m[2] : $m[2];
            // "06:00 - 00:00" means until midnight
            if ($to === '00:00') {
                $to = '23:59';
            }
        }

        $window = [['from' => $from, 'to' => $to]];

        return [
            'sun' => $window, 'mon' => $window, 'tue' => $window, 'wed' => $window,
            'thu' => $window, 'fri' => $window, 'sat' => $window,
        ];
    }
};

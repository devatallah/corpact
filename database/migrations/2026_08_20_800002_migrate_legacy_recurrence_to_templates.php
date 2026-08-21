<?php

use App\Services\Events\LegacyRecurrenceMigrator;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A8 — ترحيل التكرار القديم المدمج على الفعالية إلى قوالب `event_templates`
 * (الخريطة موثقة في {@see LegacyRecurrenceMigrator} ومثبتة باختبار):
 *
 * 1) كل فعالية أم (`recurrence_type` غير none وبلا أب) ← قالب/قوالب، مع ربط
 *    الأم وكل تكراراتها بالقالب عبر `template_id` (يمنع فحص وجود التوليد أي
 *    ازدواج مع المولد سلفاً دفعة واحدة).
 * 2) النوع `daily` (غير موجود في H §8) ← قالب weekly بيوم الأم.
 * 3) `recurrence_end_date` ← `ends_on`؛ سلسلة منتهية ← قالب paused.
 * 4) ثم تُحذف أعمدة التكرار المدمجة نهائياً — مسار التوليد المسبق مات
 *    (أزيل من EventCreationService)، والمصدر الوحيد للتكرار هو القالب.
 *    `parent_event_id` يبقى نسباً تاريخياً للسلاسل المرحّلة.
 */
return new class extends Migration
{
    /** حالات §9 الست عشرة — كما ثبّتتها migration A7 (700001). */
    private const STATUSES = [
        'pending_approval', 'open', 'rejected', 'pending_provider',
        'provider_alternative', 'booked', 'awaiting_payment', 'confirmed',
        'in_progress', 'completed', 'settled', 'expired', 'cancelled_min_not_met',
        'cancelled_provider', 'cancelled_company', 'cancelled_payment_failed',
    ];

    public function up(): void
    {
        $migrator = new LegacyRecurrenceMigrator;
        $today = Carbon::today();

        $seriesRows = DB::table('events')
            ->whereNull('parent_event_id')
            ->whereIn('recurrence_type', ['daily', 'weekly', 'monthly'])
            ->orderBy('id')
            ->get();

        foreach ($seriesRows as $series) {
            $row = (array) $series;
            $row['recurrence_days'] = ! empty($row['recurrence_days'])
                ? (array) json_decode((string) $row['recurrence_days'], true)
                : [];
            $row['event_date'] = substr((string) $row['event_date'], 0, 10);
            $row['venue_ids'] = DB::table('event_venue')
                ->where('event_id', $series->id)->pluck('venue_id')->values()->all();

            // وحدة النشاط عبر جسر venue_id إن وُجدت (تسلسل A9)
            $row['activity_unit_id'] = $row['venue_ids'] !== []
                ? DB::table('activity_units')->whereIn('venue_id', $row['venue_ids'])->value('id')
                : null;

            $templates = [];
            foreach ($migrator->templateAttributesFor($row, $today) as $attributes) {
                $attributes['venue_ids'] = json_encode($attributes['venue_ids'] ?? []);
                $attributes['created_at'] = now();
                $attributes['updated_at'] = now();
                if ($attributes['status'] === 'paused') {
                    $attributes['paused_at'] = now();
                }

                $id = DB::table('event_templates')->insertGetId($attributes);
                $templates[] = ['id' => $id, 'day_of_week' => $attributes['day_of_week']];
            }

            if ($templates === []) {
                continue;
            }

            // ربط الأم وكل تكراراتها: قالب اليوم المطابق عند التعدد وإلا الأول.
            $memberIds = DB::table('events')
                ->where('parent_event_id', $series->id)
                ->orWhere('id', $series->id)
                ->pluck('event_date', 'id');

            foreach ($memberIds as $eventId => $eventDate) {
                $dayOfWeek = Carbon::parse(substr((string) $eventDate, 0, 10))->dayOfWeek;
                $match = collect($templates)->firstWhere('day_of_week', $dayOfWeek) ?? $templates[0];

                DB::table('events')->where('id', $eventId)->update(['template_id' => $match['id']]);
            }
        }

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['recurrence_type', 'recurrence_end_date', 'recurrence_days']);
        });

        // إسقاط عمود enum في SQLite يعيد بناء الجدول فيُفقد قيد CHECK على
        // الحالة — يُعاد فرض حالات §9 حصراً (قاعدة A7: لا قيمة خارج الجدول).
        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', self::STATUSES)->default('open')->change();
        });
    }

    public function down(): void
    {
        // لا ترحيل عكسي: أعمدة التكرار المدمجة ماتت مع مسار التوليد المسبق.
        Schema::table('events', function (Blueprint $table) {
            $table->enum('recurrence_type', ['none', 'daily', 'weekly', 'monthly'])->default('none');
            $table->date('recurrence_end_date')->nullable();
            $table->json('recurrence_days')->nullable();
        });
    }
};

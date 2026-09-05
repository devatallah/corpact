<?php

namespace Database\Seeders;

use App\Enums\ReportAction;
use App\Enums\ReportCause;
use App\Models\ActivityUnit;
use App\Models\Community;
use App\Models\CompetitionResult;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventTemplate;
use App\Models\PaymentIntent;
use App\Models\Season;
use App\Models\User;
use App\Models\VenuePricing;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * المنافسة والقياس والأثر التقني: النتائج واللوحات والمجاميع وسجلات البوابة.
 *
 * آخر ما يُبذر لأنه مشتق من كل ما قبله — نتيجة بلا فعالية مكتملة لا معنى
 * لها، ومجموع حضور بلا حضور مسجَّل رقم مخترع.
 */
class EngagementSeeder extends Seeder
{
    public function run(): void
    {
        Model::setEventDispatcher(app('events'));

        $this->competitionResults();
        $this->attendanceAggregates();
        $this->leaderboards();
        $this->reportRecommendations();
        $this->templates();
        $this->notificationPreferences();
        $this->paymentTrail();
        $this->priceChanges();
        $this->securityTrail();
    }

    /** نتائج فردية على الفعاليات المكتملة، وتصحيح واحد موثّق. */
    private function competitionResults(): void
    {
        $season = Season::query()->where('status', 'active')->first() ?? Season::query()->first();
        $admin = User::query()->where('email', 'admin@teamat.com')->first();

        if ($season === null) {
            return;
        }

        foreach (Event::query()->whereIn('status', ['completed', 'settled'])->get() as $event) {
            // `participants()` علاقة إلى الموظفين عبر جدول وسيط — الصف نفسه
            // يُقرأ من الوسيط، فـ`$employee->id` هو المطلوب لا حقل غير موجود.
            $attended = $event->participants()
                ->wherePivot('attendance_status', 'attended')
                ->get();

            foreach ($attended as $index => $employee) {
                $result = CompetitionResult::query()->create([
                    'company_id' => $event->company_id,
                    'community_id' => $event->community_id,
                    'season_id' => $season->id,
                    'subject_type' => CompetitionResult::SUBJECT_EMPLOYEE,
                    'subject_id' => $employee->id,
                    'employee_id' => $employee->id,
                    'source_type' => CompetitionResult::SOURCE_EVENT,
                    'source_id' => $event->id,
                    'event_id' => $event->id,
                    'measurement_type' => CompetitionResult::TYPE_INDIVIDUAL_VALUE,
                    'unit' => 'نقطة',
                    // القيمة مخزَّنة مضروبة في 100 كبقية الأرقام — لا كسور عائمة.
                    'value_scaled' => (18 - $index * 2) * 100,
                    'recorded_by_user_id' => $admin?->id,
                    'recorded_at' => $event->ends_at ?? Carbon::now()->subDays(30),
                    'notes' => $index === 0 ? 'أعلى نتيجة في الجولة.' : null,
                ]);

                // تصحيح واحد موثّق: النتيجة تُعدَّل ويبقى الأثر — وهو ما يمنع
                // أن يصير التعديل بابَ تلاعب صامت.
                if ($index === 1) {
                    DB::table('competition_result_changes')->insert([
                        'competition_result_id' => $result->id,
                        'from_value_scaled' => $result->value_scaled,
                        'to_value_scaled' => $result->value_scaled + 200,
                        'from_unit' => $result->unit,
                        'to_unit' => $result->unit,
                        'reason' => 'خطأ إدخال — احتُسبت جولة ناقصة عند التسجيل.',
                        'actor_user_id' => $admin?->id,
                        'actor_name' => $admin?->name,
                        'created_at' => Carbon::now()->subDays(3),
                    ]);

                    $result->forceFill(['value_scaled' => $result->value_scaled + 200])->save();
                }
            }
        }
    }

    /** مجاميع الحضور الشهرية — محسوبة من المشاركات لا مخترعة. */
    private function attendanceAggregates(): void
    {
        $rows = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->whereNotNull('event_participants.attendance_status')
            ->selectRaw("events.company_id, events.community_id, strftime('%Y-%m', events.event_date) as period")
            ->selectRaw('count(distinct events.id) as events_count')
            ->selectRaw("sum(case when event_participants.attendance_status = 'attended' then 1 else 0 end) as attended_count")
            ->selectRaw("sum(case when event_participants.attendance_status = 'absent' then 1 else 0 end) as absent_count")
            ->selectRaw('count(distinct event_participants.employee_id) as distinct_participants')
            ->groupBy('events.company_id', 'events.community_id', 'period')
            ->get();

        foreach ($rows as $row) {
            DB::table('attendance_aggregates')->insert([
                'company_id' => $row->company_id,
                'community_id' => $row->community_id,
                'period' => $row->period,
                'events_count' => $row->events_count,
                'attended_count' => $row->attended_count,
                'absent_count' => $row->absent_count,
                'distinct_participants' => $row->distinct_participants,
                'results_count' => CompetitionResult::query()->where('community_id', $row->community_id)->count(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    /**
     * لقطات لوحات الصدارة.
     *
     * المفتاح الفريد (موسم + لوحة + مستوى + وحدة) لا يتضمن المجتمع: اللقطة
     * على مستوى الموسم لا المجتمع، فلقطة لكل مجتمع تصطدم بالقيد. لوحتان في
     * مستويين — المهارة والمواظبة، فرداً وقسماً.
     */
    private function leaderboards(): void
    {
        $season = Season::query()->where('status', 'active')->first();

        if ($season === null) {
            return;
        }

        $top = CompetitionResult::query()
            ->orderByDesc('value_scaled')
            ->with('employee')
            ->take(10)
            ->get();

        if ($top->isEmpty()) {
            return;
        }

        $boards = [
            ['skill', 'individual', 'نقطة'],
            ['skill', 'department', 'نقطة'],
            ['consistency', 'individual', 'حضور'],
            ['consistency', 'department', 'حضور'],
        ];

        foreach ($boards as [$board, $level, $unit]) {
            $payload = $top->values()->map(fn ($r, $i) => [
                'rank' => $i + 1,
                'employee_id' => $r->employee_id,
                'name' => $r->employee?->name,
                'community_id' => $r->community_id,
                'value_scaled' => $board === 'skill' ? $r->value_scaled : ($i + 3) * 100,
            ])->all();

            DB::table('leaderboard_snapshots')->insert([
                'company_id' => $top->first()->company_id,
                'community_id' => $top->first()->community_id,
                'season_id' => $season->id,
                'board' => $board,
                'level' => $level,
                'unit' => $unit,
                'payload' => json_encode($payload, JSON_UNESCAPED_UNICODE),
                'generated_at' => Carbon::now()->subDay(),
                'created_at' => Carbon::now()->subDay(),
            ]);
        }
    }

    /** توصيات المنسّق على تقاريره — سبب وإجراء مقترح لكل مجتمع متعثر. */
    private function reportRecommendations(): void
    {
        $admin = User::query()->where('email', 'admin@teamat.com')->first();

        $pairs = [
            [ReportCause::MinimumNotMet, ReportAction::LowerMinimum],
            [ReportCause::UnsuitableTiming, ReportAction::ChangeTimeSlot],
            [ReportCause::ManualScheduling, ReportAction::ConvertToTemplate],
            [ReportCause::LowActivation, ReportAction::TargetedInvite],
        ];

        foreach (DB::table('coordinator_monthly_reports')->get() as $index => $report) {
            [$cause, $action] = $pairs[$index % count($pairs)];

            DB::table('coordinator_report_recommendations')->insert([
                'coordinator_monthly_report_id' => $report->id,
                'community_id' => Community::query()->where('company_id', $report->company_id ?? 1)->value('id'),
                'cause' => $cause->value,
                'action' => $action->value,
                'created_by_user_id' => $admin?->id,
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(6),
            ]);
        }
    }

    /** قوالب الفعاليات المتكررة: نشط، وموقوف مؤقتاً. */
    private function templates(): void
    {
        foreach (Community::query()->where('status', 'active')->take(2)->get() as $index => $community) {
            $pricing = VenuePricing::query()
                ->whereHas('venue', fn ($q) => $q->where('category_id', $community->category_id))
                ->first();

            if ($pricing === null) {
                continue;
            }

            $anchor = Carbon::now()->startOfDay();

            while ($anchor->dayOfWeek !== 0) {
                $anchor->addDay();
            }

            EventTemplate::query()->create([
                'company_id' => $community->company_id,
                'community_id' => $community->id,
                'partner_id' => $pricing->venue->partner_id,
                'category_id' => $community->category_id,
                'venue_pricing_id' => $pricing->id,
                'venue_ids' => [$pricing->venue_id],
                'created_by' => $community->primaryLeader()?->id ?? Employee::query()->where('company_id', $community->company_id)->value('id'),
                'title' => 'تدريب أسبوعي — '.$community->name,
                'recurrence_pattern' => EventTemplate::PATTERN_WEEKLY,
                'day_of_week' => 0,
                'anchor_date' => $anchor->toDateString(),
                'start_time' => '19:00',
                'duration_minutes' => $pricing->duration_minutes,
                'capacity' => 8,
                'min_participants' => 4,
                'venues_count' => 1,
                'blackout_behavior' => 'skip',
                'status' => $index === 0 ? 'active' : 'paused',
                'paused_at' => $index === 0 ? null : Carbon::now()->subDays(8),
                'total_amount_halalas' => $pricing->price_halalas,
                'subsidy_type' => 'percentage',
                'subsidy_value' => 100,
            ]);
        }
    }

    /** تفضيلات الإشعارات — موظفون أوقفوا قوالب بعينها. */
    private function notificationPreferences(): void
    {
        $keys = DB::table('notification_templates')->orderBy('id')->take(4)->pluck('key');

        foreach (Employee::query()->orderBy('id')->take(6)->get() as $index => $employee) {
            DB::table('notification_preferences')->insert([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $employee->id,
                'template_key' => $keys[$index % max($keys->count(), 1)] ?? 'event_created',
                'enabled' => $index % 3 !== 0,
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(30),
            ]);
        }
    }

    /** أثر البوابة: حركة لكل مطالبة مدفوعة، وويبهوك بما فيه مكرر. */
    private function paymentTrail(): void
    {
        foreach (PaymentIntent::query()->get() as $intent) {
            $reference = $intent->gateway_reference ?? 'GW-'.Str::upper(Str::random(10));

            DB::table('gateway_transactions')->insert([
                'payment_intent_id' => $intent->id,
                'type' => 'charge',
                'gateway' => $intent->gateway ?? 'local_test',
                'gateway_reference' => $reference,
                'amount_halalas' => $intent->amount_halalas,
                'status' => $intent->status === PaymentIntent::STATUS_PAID ? 'succeeded' : 'pending',
                'idempotency_key' => 'seed:charge:'.$intent->id,
                'payload' => json_encode(['source' => 'seed', 'intent' => $intent->id], JSON_UNESCAPED_UNICODE),
                'created_at' => $intent->created_at,
                'updated_at' => $intent->updated_at,
            ]);

            // ويبهوك أصلي وآخر مكرر بنفس المفتاح — التكرار يُبتلع ولا يُحصَّل مرتين.
            foreach (['processed', 'duplicate'] as $pass) {
                DB::table('payment_webhooks')->insert([
                    'gateway' => $intent->gateway ?? 'local_test',
                    'event_type' => 'payment.succeeded',
                    'gateway_reference' => $reference,
                    'idempotency_key' => 'seed:webhook:'.$intent->id,
                    'payload' => json_encode(['reference' => $reference, 'amount' => $intent->amount_halalas], JSON_UNESCAPED_UNICODE),
                    'signature' => hash('sha256', $reference),
                    'processing_status' => $pass,
                    'payment_intent_id' => $intent->id,
                    'processed_at' => Carbon::now()->subMinutes(5),
                    'created_at' => Carbon::now()->subMinutes(6),
                    'updated_at' => Carbon::now()->subMinutes(5),
                ]);
            }
        }
    }

    /** طلبات تغيير أسعار الوحدات: معلّق، ومقبول، ومرفوض. */
    private function priceChanges(): void
    {
        $admin = User::query()->where('email', 'admin@teamat.com')->first();
        $states = [['pending', null], ['approved', 'admin'], ['rejected', 'admin']];

        foreach (ActivityUnit::query()->orderBy('id')->take(3)->get() as $index => $unit) {
            [$status, $decider] = $states[$index % 3];

            DB::table('unit_price_changes')->insert([
                'activity_unit_id' => $unit->id,
                'old_price_halalas' => $unit->price_halalas,
                'new_price_halalas' => (int) round($unit->price_halalas * 1.1),
                'status' => $status,
                'requested_by' => $unit->branch?->partner_id,
                'decided_by' => $decider ? $admin?->id : null,
                'decided_at' => $decider ? Carbon::now()->subDays(2) : null,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays($decider ? 2 : 5),
            ]);
        }
    }

    /** أحداث أمنية وملفات مخزَّنة — ما تقرأه شاشتا الأمن والمرفقات. */
    private function securityTrail(): void
    {
        $admin = User::query()->where('email', 'admin@teamat.com')->first();

        $events = [
            ['failed_login', 'warning', 'محاولة دخول فاشلة متكررة من عنوان واحد.'],
            ['otp_throttled', 'warning', 'تجاوز حد طلبات رمز التحقق.'],
            ['cross_company_access_denied', 'critical', 'محاولة وصول إلى بيانات شركة أخرى — رُدّت بـ404.'],
            ['permission_granted', 'info', 'مُنحت صلاحية إدارة المحفظة لمسؤول حساب.'],
        ];

        foreach ($events as $index => [$event, $severity, $note]) {
            DB::table('security_events')->insert([
                'event' => $event,
                'severity' => $severity,
                'actor_user_id' => $admin?->id,
                'actor_name' => $admin?->name,
                'actor_identifier' => $admin?->email,
                'guard' => 'admin',
                'company_id' => 1,
                'ip_address' => '10.0.0.'.(10 + $index),
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'context' => json_encode(['note' => $note], JSON_UNESCAPED_UNICODE),
                'created_at' => Carbon::now()->subHours($index * 7 + 1),
            ]);
        }
    }
}

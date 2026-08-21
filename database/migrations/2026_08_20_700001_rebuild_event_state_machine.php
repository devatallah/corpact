<?php

use App\Services\Events\LegacyStatusMap;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A7 — إعادة بناء مخطط الفعالية وآلة حالاتها (H §7 + §9).
 *
 * 1) أعمدة §7 الجديدة: starts_at/ends_at (UTC — يبقى event_date/start_time
 *    جسراً مُزامَناً في النموذج)، registration_closes_at المشتق،
 *    min_participants، funding_status منفصلاً عن status، عَلَم is_full المشتق
 *    (بديل حالة `full` المحذوفة نهائياً)، template_id/reschedule_attempt/
 *    original_starts_at (يستهلكها A8)، event_snapshot (يُكتب عند confirmed)،
 *    creator_role، free_withdrawal_until (نافذة الـ 6 ساعات بعد قبول البديل).
 *
 * 2) ترحيل الحالات القديمة إلى حالات §9 حسب LegacyStatusMap (موثقة هناك
 *    ومثبتة باختبار). enum يُوسَّع أولاً (قديم + جديد) ثم تُرحَّل البيانات ثم
 *    يُضيَّق إلى حالات §9 فقط — `full` و`waiting_*` و`alternative_proposed`
 *    تموت من المخطط.
 *
 * 3) جدول `event_status_history` مع سطر افتتاحي لكل فعالية قائمة يحفظ حالتها
 *    القديمة في metadata.
 *
 * 4) `payment_deadline` القديمة (مهلة الـ 30 دقيقة على الشركة) تُصفَّر — التدفق
 *    مات مع الآلة الجديدة (التحصيل بعد إغلاق التسجيل — A10).
 */
return new class extends Migration
{
    private const LEGACY_STATUSES = [
        'open', 'full', 'waiting_business', 'waiting_partner', 'confirmed',
        'rejected', 'alternative_proposed', 'in_progress', 'completed', 'cancelled',
    ];

    private const NEW_STATUSES = [
        'pending_approval', 'open', 'rejected', 'pending_provider',
        'provider_alternative', 'booked', 'awaiting_payment', 'confirmed',
        'in_progress', 'completed', 'settled', 'expired', 'cancelled_min_not_met',
        'cancelled_provider', 'cancelled_company', 'cancelled_payment_failed',
    ];

    public function up(): void
    {
        // ── 1) الأعمدة الجديدة ────────────────────────────────────────────
        Schema::table('events', function (Blueprint $table) {
            $table->dateTime('starts_at')->nullable()->after('start_time');
            $table->dateTime('ends_at')->nullable()->after('starts_at');
            $table->dateTime('registration_closes_at')->nullable()->after('ends_at');
            $table->dateTime('free_withdrawal_until')->nullable()->after('registration_closes_at');
            $table->unsignedInteger('min_participants')->default(1)->after('capacity');
            $table->boolean('is_full')->default(false)->after('participants_count');
            $table->string('funding_status')->default('not_started')->after('is_full');
            $table->unsignedBigInteger('template_id')->nullable()->after('parent_event_id');
            $table->unsignedTinyInteger('reschedule_attempt')->default(0)->after('template_id');
            $table->dateTime('original_starts_at')->nullable()->after('reschedule_attempt');
            $table->json('event_snapshot')->nullable()->after('notes');
            $table->string('creator_role')->nullable()->after('created_by');

            $table->index('starts_at');
            $table->index('registration_closes_at');
        });

        // ── 2) تعبئة الأعمدة المشتقة من البيانات القائمة ──────────────────
        $closeHours = DB::table('company_settings')
            ->pluck('registration_close_hours', 'company_id');

        DB::table('events')
            ->orderBy('id')
            ->select(['id', 'company_id', 'event_date', 'start_time', 'duration_minutes', 'capacity', 'participants_count'])
            ->chunk(200, function ($events) use ($closeHours) {
                foreach ($events as $event) {
                    $date = substr((string) $event->event_date, 0, 10);
                    $startsAt = Carbon::parse($date.' '.$event->start_time);
                    $hours = (int) ($closeHours[$event->company_id] ?? 24);

                    DB::table('events')->where('id', $event->id)->update([
                        'starts_at' => $startsAt,
                        'ends_at' => $startsAt->copy()->addMinutes((int) $event->duration_minutes),
                        'registration_closes_at' => $startsAt->copy()->subHours($hours),
                        'is_full' => $event->participants_count >= $event->capacity,
                        'min_participants' => 1, // لا مفهوم حد أدنى قبل A7 — الفعاليات القائمة لا تُلزم به بأثر رجعي
                    ]);
                }
            });

        // ── 3) ترحيل الحالات: توسيع enum ← ترحيل بيانات ← تضييق ──────────
        $legacy = DB::table('events')->pluck('status', 'id');

        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', array_values(array_unique([...self::LEGACY_STATUSES, ...self::NEW_STATUSES])))
                ->default('open')->change();
        });

        // full → open + is_full (بلوغ السعة عَلَم لا حالة — H §9 قاعدة 3)
        DB::table('events')->where('status', 'full')->update(['is_full' => true]);

        // الإلغاء القديم بانتهاء «مهلة الدفع» → cancelled_payment_failed
        DB::table('events')
            ->where('status', 'cancelled')
            ->where('rejection_reason', 'like', '%'.LegacyStatusMap::PAYMENT_EXPIRY_MARKER.'%')
            ->update(['status' => 'cancelled_payment_failed']);

        foreach (LegacyStatusMap::MAP as $from => $to) {
            if ($from !== $to) {
                DB::table('events')->where('status', $from)->update(['status' => $to]);
            }
        }

        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', self::NEW_STATUSES)->default('open')->change();
        });

        // مهلة الدفع القديمة (30 دقيقة بعد قبول المزوّد) ماتت مع الآلة الجديدة —
        // تصفيرها يمنع أوامر الجدولة القديمة من إلغاء فعاليات مؤكدة مرحَّلة.
        DB::table('events')->whereNotNull('payment_deadline')->update(['payment_deadline' => null]);

        // ── 4) سجل الانتقالات ─────────────────────────────────────────────
        Schema::create('event_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->string('actor_type')->nullable();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->text('reason')->nullable();
            $table->boolean('is_manual')->default(false);
            $table->json('metadata')->nullable();
            $table->dateTime('created_at');

            $table->index(['event_id', 'created_at']);
        });

        $now = now();
        DB::table('events')->orderBy('id')->select(['id', 'status'])->chunk(200, function ($events) use ($legacy, $now) {
            $rows = [];
            foreach ($events as $event) {
                $rows[] = [
                    'event_id' => $event->id,
                    'from_status' => null,
                    'to_status' => $event->status,
                    'actor_type' => null,
                    'actor_id' => null,
                    'reason' => 'ترحيل الحالات من النظام القديم (A7)',
                    'is_manual' => false,
                    'metadata' => json_encode(['legacy_status' => $legacy[$event->id] ?? null], JSON_UNESCAPED_UNICODE),
                    'created_at' => $now,
                ];
            }
            DB::table('event_status_history')->insert($rows);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_status_history');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'starts_at', 'ends_at', 'registration_closes_at', 'free_withdrawal_until',
                'min_participants', 'is_full', 'funding_status', 'template_id',
                'reschedule_attempt', 'original_starts_at', 'event_snapshot', 'creator_role',
            ]);
        });

        // لا ترحيل عكسي للحالات — الخريطة ليست تقابلاً واحداً لواحد.
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A8 — قوالب التكرار وأيام الحظر (H §8).
 *
 * 1) `event_templates`: القالب يحل محل أعمدة التكرار المدمجة على الفعالية
 *    والتوليد المسبق دفعة واحدة (52 تكراراً). الأنماط: أسبوعي · كل أسبوعين ·
 *    شهري — لا يومي في المواصفة (ترحيل النوع القديم في migration 800002).
 *    التوليد الدوري قبل 14 يوماً من الموعد (أمر app:generate-template-events).
 *    الحقول المالية قيم تمريرية فقط — دلالاتها ملك A10.
 *
 * 2) `blackout_dates`: يديره أدمن تيمات (إجازات/رمضان). الفعالية الواقعة فيه
 *    تُتخطى افتراضياً أو تُزاح أسبوعاً حسب إعداد القالب.
 *
 * 3) عمودا تمديد التسجيل مرة واحدة 24 ساعة على الفعالية (بديل فتح الفعالية
 *    على مجتمعات أخرى المؤجل — H §24) قبل مسار إعادة الجدولة.
 *
 * ملاحظة: عمود events.template_id أنشأه A7 (migration 700001) بلا قيد مرجعي —
 * إضافة FK لاحقاً غير مدعومة في SQLite، فيُكتفى بفهرس (سلامة المرجع في الكود).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_id')->nullable()->constrained('partners')->nullOnDelete();
            $table->foreignId('activity_unit_id')->nullable()->constrained('activity_units')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            // جسر النموذج القديم: تسعيرة/ملاعب venue حتى يرحّل A15 واجهات الإنشاء للوحدات
            $table->foreignId('venue_pricing_id')->nullable()->constrained('venue_pricings')->nullOnDelete();
            $table->json('venue_ids')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('employees')->nullOnDelete();

            $table->string('title')->nullable();
            $table->text('notes')->nullable();

            // النمط: weekly | biweekly | monthly — بداية الأسبوع الأحد (H §8)
            $table->string('recurrence_pattern', 20);
            $table->unsignedTinyInteger('day_of_week')->nullable();  // 0=الأحد .. 6=السبت
            $table->unsignedTinyInteger('day_of_month')->nullable(); // «يوم 31» في شهر أقصر ← آخر يوم
            // أول موعد للقالب — مرجع تعاقب «كل أسبوعين» وبداية التوليد
            $table->date('anchor_date');
            // جسر ترحيل السلاسل القديمة ذات نهاية — قوالب المواصفة بلا نهاية (توقف بالإيقاف)
            $table->date('ends_on')->nullable();
            $table->time('start_time');
            $table->unsignedInteger('duration_minutes')->default(60);

            $table->unsignedInteger('capacity');
            $table->unsignedInteger('min_participants')->default(2);
            $table->unsignedInteger('venues_count')->default(1);

            // تمرير قيم فقط — المعادلة والدلالات لـ A10 (H §12)
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('company_subsidy', 10, 2)->default(0);
            $table->decimal('community_contribution', 10, 2)->default(0);
            $table->decimal('player_payment', 10, 2)->default(0);
            $table->decimal('cost_per_person', 10, 2)->default(0);

            $table->string('blackout_behavior', 20)->default('skip'); // skip | shift_week
            // H §8: إعادة الجدولة «بعد 7 أيام (قابل للإعداد على القالب)»
            $table->unsignedTinyInteger('reschedule_interval_days')->default(7);
            $table->string('status', 20)->default('active'); // active | paused
            $table->timestamp('paused_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'community_id']);
        });

        Schema::create('blackout_dates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['starts_on', 'ends_on']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->timestamp('registration_extended_at')->nullable()->after('registration_closes_at');
            $table->foreignId('registration_extended_by')->nullable()
                ->after('registration_extended_at')->constrained('employees')->nullOnDelete();
            $table->index('template_id');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['template_id']);
            $table->dropConstrainedForeignId('registration_extended_by');
            $table->dropColumn('registration_extended_at');
        });

        Schema::dropIfExists('blackout_dates');
        Schema::dropIfExists('event_templates');
    }
};

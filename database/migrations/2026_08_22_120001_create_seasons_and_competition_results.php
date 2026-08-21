<?php

use App\Models\LeaderboardSnapshot;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A12 — المواسم والنتائج ولوحات الصدارة (H §13).
 *
 * `seasons`: المجتمع + النشاط + الاسم + البداية والنهاية + الحالة. الافتراضي
 * موسم ربع سنوي يُنشأ تلقائياً لكل مجتمع (مفتاح `period_key` مثل 2026-Q3 يجعل
 * الإنشاء idempotent)، ويستطيع القائد أو أدمن تيمات إنشاء مواسم مخصصة.
 *
 * `competition_results`: نتيجة واحدة لكل (فعالية + مشارك + نوع قياس) داخل
 * موسمها — وكل نتيجة تبقى مرتبطة بموسمها **دائماً** (`restrictOnDelete`).
 *
 * **استيعاب الدوري المؤجل بلا كسر المخطط (H §13):** الصف لا يفترض أن الفاعل
 * موظف ولا أن المصدر فعالية:
 * - `subject_type`/`subject_id`: صاحب النتيجة — `employee` في الإصدار الأول،
 *   و`match_team` لاحقاً بلا أي تغيير في المخطط.
 * - `source_type`/`source_id`: مصدر القياس — `event` الآن، و`match` لاحقاً.
 * جدولا `matches` و`match_teams` يُضافان لاحقاً ويُشار إليهما بهذين الحقلين.
 *
 * `competition_result_changes`: كل تصحيح بعد الإدخال سطر بالقيمة قبل/بعد
 * والسبب والفاعل — لا تُحذف نتيجة ولا يُطمس تصحيح.
 *
 * `leaderboard_snapshots`: أرشيف اللوحة عند إغلاق الموسم — نسخة نهائية ثابتة
 * لا تُعدَّل ولا تُحذف (يفرضه {@see LeaderboardSnapshot}).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            // النشاط (H §13) — المجتمع = شركة واحدة + نشاط واحد، فيُختم هنا.
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->enum('status', ['active', 'closed'])->default('active');
            // 2026-Q3 للمواسم التلقائية، null للمخصصة — مفتاح idempotency.
            $table->string('period_key')->nullable();
            $table->boolean('is_auto')->default(false);
            $table->dateTime('closed_at')->nullable();
            $table->unsignedBigInteger('closed_by_user_id')->nullable();
            $table->timestamps();

            $table->unique(['community_id', 'period_key']);
            $table->index(['community_id', 'status']);
            $table->index(['community_id', 'starts_on', 'ends_on']);
        });

        Schema::create('competition_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            // «كل نتيجة تبقى مرتبطة بموسمها دائماً» — لا حذف موسم يحمل نتائج.
            $table->foreignId('season_id')->constrained()->restrictOnDelete();

            // صاحب النتيجة: employee الآن · match_team لاحقاً (الدوري المؤجل).
            $table->string('subject_type')->default('employee');
            $table->unsignedBigInteger('subject_id');
            // مرآة مفهرسة لصاحب النتيجة حين يكون موظفاً — تُبقي كل استعلامات
            // اللوحات بسيطة بلا شرط نوع في كل join.
            $table->foreignId('employee_id')->nullable()->constrained()->cascadeOnDelete();

            // مصدر القياس: event الآن · match لاحقاً.
            $table->string('source_type')->default('event');
            $table->unsignedBigInteger('source_id')->nullable();
            $table->foreignId('event_id')->nullable()->constrained()->cascadeOnDelete();

            // نوعا القياس الوحيدان (H §13).
            $table->enum('measurement_type', ['individual_value', 'consistency']);
            // وحدة من كتالوج القياس المركزي (config/results.php) — لا نص حر.
            $table->string('unit')->nullable();
            // القيمة عدد صحيح مقياسه CompetitionResult::SCALE — لا عوامات.
            $table->bigInteger('value_scaled')->nullable();

            $table->unsignedBigInteger('recorded_by_user_id')->nullable();
            $table->dateTime('recorded_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['source_type', 'source_id', 'subject_type', 'subject_id', 'measurement_type'], 'competition_results_unique_entry');
            $table->index(['season_id', 'measurement_type', 'unit']);
            $table->index(['community_id', 'season_id']);
            $table->index(['employee_id', 'season_id']);
        });

        Schema::create('competition_result_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_result_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('from_value_scaled')->nullable();
            $table->bigInteger('to_value_scaled')->nullable();
            $table->string('from_unit')->nullable();
            $table->string('to_unit')->nullable();
            // السبب إلزامي في التصحيح (H §13) — العمود غير قابل للإفراغ.
            $table->text('reason');
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->string('actor_name')->nullable();
            $table->dateTime('created_at');

            $table->index('competition_result_id');
        });

        Schema::create('leaderboard_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            $table->foreignId('season_id')->constrained()->restrictOnDelete();
            $table->enum('board', ['skill', 'consistency']);
            $table->enum('level', ['individual', 'department']);
            // وحدة القياس للوحة المهارة (لوحة لكل وحدة) — '' للمواظبة، حتى
            // يبقى المفتاح الفريد فعّالاً (NULL لا يتكرر منطقياً في SQL).
            $table->string('unit')->default('');
            $table->json('payload');
            $table->dateTime('generated_at');
            $table->dateTime('created_at');

            $table->unique(['season_id', 'board', 'level', 'unit'], 'leaderboard_snapshots_unique_board');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard_snapshots');
        Schema::dropIfExists('competition_result_changes');
        Schema::dropIfExists('competition_results');
        Schema::dropIfExists('seasons');
    }
};

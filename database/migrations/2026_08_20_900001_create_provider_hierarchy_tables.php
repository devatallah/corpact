<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A9 — Provider hierarchy (H §11): المزوّد ← الفروع ← وحدات النشاط ← التوفر،
 * مع قناة القرار (event_provider_requests)، مؤشر الموثوقية، المزوّدون المفضّلون،
 * وسجل اختيار المزوّد (سبب التجاوز الإلزامي).
 *
 * Design decision (documented in docs/divergences.md): the provider entity
 * EXTENDS the existing `partners` domain — the `partners` table IS the
 * providers table (same auth guard, portal, staff roles). No parallel
 * `providers` table is created.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            // هوية المزوّد (H §11: الاسم التجاري + السجل التجاري)
            $table->string('trade_name')->nullable()->after('name');
            $table->string('cr_number', 30)->nullable()->after('trade_name');

            // مؤشر الموثوقية: يبدأ من 80، ولا يُعرض قبل 10 عينات
            $table->unsignedTinyInteger('reliability_score')->default(80)->after('rating');
            $table->unsignedInteger('reliability_samples')->default(0)->after('reliability_score');

            // الحساب البنكي — اعتماد يدوي من أدمن تيمات، شرط لأي صرف (A11 يقرأ الحالة)
            $table->string('bank_account_holder')->nullable()->after('commission_rate');
            $table->string('bank_iban', 34)->nullable()->after('bank_account_holder');
            $table->string('bank_status', 20)->default('missing')->after('bank_iban'); // missing | pending | approved
            $table->timestamp('bank_approved_at')->nullable()->after('bank_status');
            $table->foreignId('bank_approved_by')->nullable()->after('bank_approved_at')->constrained('users')->nullOnDelete();

            // عقد سعر مع تيمات؟ تعديلات الأسعار تحتاج اعتماد أدمن (H §17)
            $table->boolean('has_price_contract')->default(false)->after('bank_approved_by');
        });

        // الفرع — يتبع مزوّداً واحداً (H §11)
        Schema::create('provider_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            // {"sun":[{"from":"06:00","to":"23:00"}], ...} — أوقات العمل لكل يوم
            $table->json('working_hours')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->string('status', 20)->default('active'); // active | inactive
            $table->timestamps();

            $table->index(['partner_id', 'status']);
        });

        // وحدة النشاط — ملعب/مسار/قاعة تتبع فرعاً واحداً (H §11)
        Schema::create('activity_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_branch_id')->constrained('provider_branches')->cascadeOnDelete();
            // النشاط من الكتالوج المركزي — تختار منه ولا تضيف إليه (G/دليل المزوّد)
            $table->foreignId('category_id')->constrained('categories');
            // جسر إلى صف venue القديم (توافق event_venue في مرحلة الانتقال)
            $table->foreignId('venue_id')->nullable()->constrained('venues')->nullOnDelete();
            $table->string('name');
            $table->unsignedInteger('min_capacity')->default(1);
            $table->unsignedInteger('max_capacity');
            $table->string('pricing_type', 20)->default('unit_hour'); // unit_hour | package | per_person
            // decimal like the rest of event pricing — halala conversion is A10's (divergences §A6)
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('default_duration_minutes')->default(60);
            $table->string('status', 20)->default('active'); // active | maintenance | disabled
            $table->timestamps();

            $table->index(['provider_branch_id', 'status']);
            $table->index('category_id');
        });

        // قناة القرار — طلب مزوّد لكل فعالية تحتاج مزوّداً (H §11)
        Schema::create('event_provider_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->foreignId('activity_unit_id')->nullable()->constrained('activity_units')->nullOnDelete();

            // الطلب بكمية محددة نهائياً — لا يتغير بزيادة المشاركين
            $table->date('requested_date');
            $table->time('start_time');
            $table->unsignedInteger('duration_minutes');
            $table->unsignedInteger('quantity')->default(1); // عدد الوحدات (venues_count)
            $table->string('pricing_type', 20)->nullable();
            // للشخص: العدد يُثبَّت لحظة إرسال الطلب وتُقفل السعة عنده
            $table->unsignedInteger('frozen_participants_count')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable(); // لقطة الإجمالي عند الإرسال

            $table->string('status', 30)->default('pending');
            // pending | accepted | rejected | alternative_proposed | expired | cancelled

            $table->timestamp('sent_at');
            // مهلة القرار: 12 ساعة أو حتى 6 ساعات قبل الموعد أيهما أقرب
            $table->timestamp('deadline_at');
            $table->timestamp('responded_at')->nullable();
            // حساب اللوحة الذي قرّر (أثر رقمي مرتبط بحساب الفرع — H §11)
            $table->foreignId('responded_by')->nullable()->constrained('partners')->nullOnDelete();
            $table->boolean('late_response')->default(false);
            $table->string('rejection_reason')->nullable();
            $table->string('cancellation_reason')->nullable();

            // رابط موقّع أحادي الاستخدام صالح 72 ساعة — مؤشر لا تجاوز للدخول
            $table->string('link_token_hash', 64)->nullable()->unique();
            $table->timestamp('link_expires_at')->nullable();
            $table->timestamp('link_used_at')->nullable();

            $table->timestamps();

            $table->index(['partner_id', 'status']);
            $table->index(['status', 'deadline_at']);
            $table->index('event_id');
        });

        // تقويم الوحدة — تقويم المنصة هو مصدر الحقيقة الوحيد (H §11).
        // النموذج: أوقات العمل على الفرع تحدد «المتاح»، وصفوف هذا الجدول تحجز
        // «المشغول»: داخلي (فعالية) أو خارجي بوسم «حجز خارجي».
        Schema::create('unit_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_unit_id')->constrained('activity_units')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('booking_type', 20); // internal | external
            $table->foreignId('event_id')->nullable()->constrained('events')->cascadeOnDelete();
            $table->foreignId('event_provider_request_id')->nullable()->constrained('event_provider_requests')->nullOnDelete();
            $table->string('note')->nullable(); // «حجز خارجي» annotation
            $table->timestamps();

            $table->index(['activity_unit_id', 'date']);
            // صمّام أمان ضد الحجز المزدوج لنفس الفتحة تماماً — القفل الحقيقي في
            // AvailabilityService::book داخل معاملة بقفل يفحص التداخل الزمني.
            $table->unique(['activity_unit_id', 'date', 'start_time']);
        });

        // سجل الموثوقية — صف لكل تغيّر (H §11)
        Schema::create('provider_reliability_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->foreignId('event_provider_request_id')->nullable()->constrained('event_provider_requests')->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->integer('delta');
            $table->unsignedTinyInteger('score_before');
            $table->unsignedTinyInteger('score_after');
            $table->string('reason', 40);
            // accept_within_deadline | late_response | reject | cancel_after_accept |
            // event_completed_clean | stale_availability_conflict | manual_adjustment
            $table->text('note')->nullable(); // إلزامي للتعديل اليدوي
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('counts_as_sample')->default(true);
            $table->timestamps();

            $table->index(['partner_id', 'created_at']);
        });

        // المزوّدون المفضّلون للمجتمع — يرتَّبون قبل غيرهم دائماً (H §11)
        Schema::create('community_preferred_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained('communities')->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['community_id', 'partner_id']);
        });

        // سجل اختيار المزوّد — سبب التجاوز إلزامي: المادة الوحيدة لأتمتة الاختيار لاحقاً
        Schema::create('provider_selection_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->nullable()->constrained('events')->cascadeOnDelete();
            $table->foreignId('community_id')->constrained('communities')->cascadeOnDelete();
            $table->foreignId('chosen_partner_id')->constrained('partners')->cascadeOnDelete();
            $table->foreignId('suggested_partner_id')->nullable()->constrained('partners')->nullOnDelete();
            $table->boolean('was_override')->default(false);
            $table->text('override_reason')->nullable(); // إلزامي عند التجاوز — يفرضه الكود
            $table->json('suggestions_json')->nullable(); // لقطة القائمة المرتبة
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // تعديل سعر وحدة تحت عقد سعر — يسري بعد اعتماد أدمن تيمات (H §17)
        Schema::create('unit_price_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_unit_id')->constrained('activity_units')->cascadeOnDelete();
            $table->decimal('old_price', 10, 2);
            $table->decimal('new_price', 10, 2);
            $table->string('status', 20)->default('pending'); // pending | approved | rejected
            $table->foreignId('requested_by')->nullable()->constrained('partners')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_price_changes');
        Schema::dropIfExists('provider_selection_logs');
        Schema::dropIfExists('community_preferred_providers');
        Schema::dropIfExists('provider_reliability_log');
        Schema::dropIfExists('unit_slots');
        Schema::dropIfExists('event_provider_requests');
        Schema::dropIfExists('activity_units');
        Schema::dropIfExists('provider_branches');
        Schema::table('partners', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bank_approved_by');
            $table->dropColumn([
                'trade_name', 'cr_number', 'reliability_score', 'reliability_samples',
                'bank_account_holder', 'bank_iban', 'bank_status', 'bank_approved_at',
                'has_price_contract',
            ]);
        });
    }
};

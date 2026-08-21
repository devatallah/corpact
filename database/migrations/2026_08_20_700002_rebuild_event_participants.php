<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A7 — تفكيك حقل حالة المشارك المدمج إلى الحقول الثلاثة المستقلة (H §10):
 *
 * - seat_status:       reserved · waitlisted · released · cancelled
 * - payment_status:    not_due · due · paid · failed · refunded (الافتراضي not_due —
 *                      دلالات ما بعده لـ A10)
 * - attendance_status: موجود من A1 (attended · absent · null)
 *
 * الترحيل: joined → reserved، waitlisted → waitlisted، cancelled → cancelled.
 * ثم يُحذف العمود المدمج. الانسحاب لم يعد يحذف صفوفاً أبداً — التاريخ يبقى.
 *
 * حقلا offered_at / offer_expires_at يخدمان عرض المقعد على أول قائمة الانتظار
 * بمهلة (H §10: 120 دقيقة ← 30 ← فوري).
 *
 * جدول `participant_events`: سطر لكل تغيير في أي من الحقول الثلاثة
 * (الفاعل والوقت والسبب)، مع سطر افتتاحي للصفوف القائمة.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->enum('seat_status', ['reserved', 'waitlisted', 'released', 'cancelled'])
                ->default('reserved')->after('employee_id');
            $table->enum('payment_status', ['not_due', 'due', 'paid', 'failed', 'refunded'])
                ->default('not_due')->after('seat_status');
            $table->dateTime('offered_at')->nullable()->after('attendance_status');
            $table->dateTime('offer_expires_at')->nullable()->after('offered_at');
        });

        DB::table('event_participants')->where('status', 'joined')->update(['seat_status' => 'reserved']);
        DB::table('event_participants')->where('status', 'waitlisted')->update(['seat_status' => 'waitlisted']);
        DB::table('event_participants')->where('status', 'cancelled')->update(['seat_status' => 'cancelled']);

        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::create('participant_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('field'); // seat_status | payment_status | attendance_status
            $table->string('from_value')->nullable();
            $table->string('to_value')->nullable();
            $table->string('actor_type')->nullable();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->text('reason')->nullable();
            $table->dateTime('created_at');

            $table->index(['event_id', 'employee_id']);
        });

        $now = now();
        DB::table('event_participants')->orderBy('id')
            ->select(['id', 'event_id', 'employee_id', 'seat_status'])
            ->chunk(200, function ($participants) use ($now) {
                $rows = [];
                foreach ($participants as $participant) {
                    $rows[] = [
                        'event_id' => $participant->event_id,
                        'employee_id' => $participant->employee_id,
                        'field' => 'seat_status',
                        'from_value' => null,
                        'to_value' => $participant->seat_status,
                        'actor_type' => null,
                        'actor_id' => null,
                        'reason' => 'ترحيل من الحقل المدمج القديم (A7)',
                        'created_at' => $now,
                    ];
                }
                DB::table('participant_events')->insert($rows);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_events');

        Schema::table('event_participants', function (Blueprint $table) {
            $table->enum('status', ['joined', 'waitlisted', 'cancelled'])->default('joined')->after('employee_id');
        });

        DB::table('event_participants')->where('seat_status', 'reserved')->update(['status' => 'joined']);
        DB::table('event_participants')->where('seat_status', 'waitlisted')->update(['status' => 'waitlisted']);
        DB::table('event_participants')->whereIn('seat_status', ['cancelled', 'released'])->update(['status' => 'cancelled']);

        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn(['seat_status', 'payment_status', 'offered_at', 'offer_expires_at']);
        });
    }
};

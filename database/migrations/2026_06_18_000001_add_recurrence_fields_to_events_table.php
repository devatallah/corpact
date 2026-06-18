<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('parent_event_id')->nullable()->after('id')->constrained('events')->nullOnDelete();
            $table->enum('recurrence_type', ['none', 'daily', 'weekly', 'monthly'])->default('none')->after('notes');
            $table->date('recurrence_end_date')->nullable()->after('recurrence_type');
            $table->json('recurrence_days')->nullable()->after('recurrence_end_date');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['parent_event_id']);
            $table->dropColumn(['parent_event_id', 'recurrence_type', 'recurrence_end_date', 'recurrence_days']);
        });
    }
};

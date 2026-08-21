<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A4 — Invitations carry the onboarding payload (H §5): name, phone,
 * department and employee number from the uploaded file, an explicit 7-day
 * `expires_at` that resending resets, and provenance to the import batch.
 * `invited_by` becomes nullable — imports are sent by the account manager,
 * who has no employee row.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->string('name')->nullable()->after('email');
            $table->string('phone', 20)->nullable()->after('name'); // normalized 9665XXXXXXXX
            $table->foreignId('department_id')->nullable()->after('phone')->constrained()->nullOnDelete();
            $table->string('employee_number', 50)->nullable()->after('department_id');
            $table->foreignId('employee_import_id')->nullable()->after('employee_number')->constrained()->nullOnDelete();
            $table->timestamp('expires_at')->nullable()->after('status');
            $table->timestamp('last_sent_at')->nullable()->after('expires_at');
            $table->unsignedTinyInteger('send_count')->default(1)->after('last_sent_at');
        });

        Schema::table('invitations', function (Blueprint $table) {
            $table->foreignId('invited_by')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
            $table->dropConstrainedForeignId('employee_import_id');
            $table->dropColumn(['name', 'phone', 'employee_number', 'expires_at', 'last_sent_at', 'send_count']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A4 — `department_history` (H §5): every department change is recorded as a
 * dated interval so historical reports attribute the employee to the
 * department AT EVENT TIME, never the current one. The open interval
 * (`ended_at` null) is the employee's current department.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('department_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            // null = الموظف بلا إدارة خلال هذه الفترة.
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['employee_id', 'started_at']);
            $table->index(['company_id', 'department_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('department_history');
    }
};

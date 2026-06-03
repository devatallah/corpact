<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support MODIFY COLUMN, so we use a column change approach.
        // For MySQL production, this would be: ALTER TABLE employees MODIFY COLUMN status ENUM(...)
        // For SQLite (dev), the string column already accepts any value, so we just document the intent.
        // If using MySQL, uncomment the following line:
        // DB::statement("ALTER TABLE employees MODIFY COLUMN status ENUM('active', 'inactive', 'pending_verification') DEFAULT 'active'");

        // For cross-DB compatibility, we change the column to a string type
        Schema::table('employees', function (Blueprint $table) {
            $table->string('status')->default('active')->change();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('status')->default('active')->change();
        });
    }
};

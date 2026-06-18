<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('super_admin')->after('status');
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->enum('role', ['owner', 'receptionist'])->default('owner')->after('status');
            $table->foreignId('parent_id')->nullable()->after('role')
                ->constrained('businesses')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['role', 'parent_id']);
        });
    }
};

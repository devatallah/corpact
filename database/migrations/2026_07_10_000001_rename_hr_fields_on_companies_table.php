<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->renameColumn('hr_name', 'contact_name');
            $table->renameColumn('hr_phone', 'contact_phone');
            $table->renameColumn('hr_title', 'contact_title');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->renameColumn('contact_name', 'hr_name');
            $table->renameColumn('contact_phone', 'hr_phone');
            $table->renameColumn('contact_title', 'hr_title');
        });
    }
};

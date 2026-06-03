<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->timestamp('activation_token_expires_at')->nullable()->after('activation_token');
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->timestamp('activation_token_expires_at')->nullable()->after('activation_token');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('activation_token_expires_at');
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn('activation_token_expires_at');
        });
    }
};

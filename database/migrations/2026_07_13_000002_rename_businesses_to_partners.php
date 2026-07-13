<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('businesses', 'partners');
        Schema::rename('business_category', 'partner_category');

        Schema::table('partner_category', function (Blueprint $table) {
            $table->renameColumn('business_id', 'partner_id');
        });

        foreach (['venues', 'settlements', 'discounts', 'events'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->renameColumn('business_id', 'partner_id');
            });
        }
    }

    public function down(): void
    {
        foreach (['venues', 'settlements', 'discounts', 'events'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->renameColumn('partner_id', 'business_id');
            });
        }

        Schema::table('partner_category', function (Blueprint $table) {
            $table->renameColumn('partner_id', 'business_id');
        });

        Schema::rename('partner_category', 'business_category');
        Schema::rename('partners', 'businesses');
    }
};

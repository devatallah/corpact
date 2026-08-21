<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A4 — Departure billing note (H §5): a departed employee still counts in
 * the cycle's system-fee invoice if they were activated before leaving.
 * `left_at` makes «غادر خلال الدورة» queryable — A11 joins it with the
 * activation criterion (participated in a completed event, not absent) when
 * computing the invoice.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_memberships', function (Blueprint $table) {
            $table->timestamp('left_at')->nullable()->after('joined_at');
            $table->index(['company_id', 'left_at']);
        });
    }

    public function down(): void
    {
        Schema::table('company_memberships', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'left_at']);
            $table->dropColumn('left_at');
        });
    }
};

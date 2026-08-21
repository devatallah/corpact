<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Bug fix (found by A3, owned by A2/A7): the application writes the status
 * `waiting_partner` (post partner-rename) but the enum re-declared by the
 * 2026_08_19_000001 migration still only allowed the legacy
 * `waiting_business`, so filling the last seat crashed on the CHECK
 * constraint. Both spellings are allowed until A7 rebuilds the state
 * machine; legacy rows are migrated to the new spelling.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', [
                'open',
                'full',
                'waiting_business',
                'waiting_partner',
                'confirmed',
                'rejected',
                'alternative_proposed',
                'in_progress',
                'completed',
                'cancelled',
            ])->default('open')->change();
        });

        DB::table('events')
            ->where('status', 'waiting_business')
            ->update(['status' => 'waiting_partner']);
    }

    public function down(): void
    {
        DB::table('events')
            ->where('status', 'waiting_partner')
            ->update(['status' => 'waiting_business']);

        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', [
                'open',
                'full',
                'waiting_business',
                'confirmed',
                'rejected',
                'alternative_proposed',
                'in_progress',
                'completed',
                'cancelled',
            ])->default('open')->change();
        });
    }
};

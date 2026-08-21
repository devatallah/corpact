<?php

use App\Services\Identity\IdentityBackfillService;
use Illuminate\Database\Migrations\Migration;

/**
 * A3 data migration: fold the legacy per-portal accounts (admin users,
 * employees, company account managers, partners) into the global identity
 * model. Idempotent — safe on an empty database (fresh installs, tests).
 */
return new class extends Migration
{
    public function up(): void
    {
        app(IdentityBackfillService::class)->run();
    }

    public function down(): void
    {
        // Data backfill — nothing to reverse; the structural migration
        // (2026_08_19_300001) owns the tables.
    }
};

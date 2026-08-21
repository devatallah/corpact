<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A3 — Identity model (H §4): global `users` identity + `company_memberships`
 * + `role_assignments` (role with scope) + OTP storage. The legacy portal
 * tables (`employees`, `partners`, `companies`) remain as portal profiles and
 * gain a `user_id` bridge to the global account.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Bumped to revoke every session of the user at once (departure cascade).
            $table->unsignedInteger('auth_epoch')->default(0)->after('status');
            // OTP-only identities (employees, providers, account managers) have no password.
            $table->string('password')->nullable()->change();
            $table->index('phone');
        });

        Schema::create('company_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Bridge to the legacy per-portal employee row backing this membership.
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->date('joined_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'company_id']);
        });

        Schema::create('role_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 40);
            $table->string('scope_type', 20); // platform | company | community | provider
            $table->unsignedBigInteger('scope_id')->nullable(); // null = platform-wide
            $table->boolean('is_primary')->default(false); // primary community leader
            $table->timestamps();

            $table->unique(['user_id', 'role', 'scope_type', 'scope_id']);
            $table->index(['scope_type', 'scope_id']);
            $table->index(['user_id', 'role']);
        });

        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 20);
            $table->string('purpose', 30)->default('login');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code_hash');
            $table->timestamp('expires_at');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('consumed_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('fallback_sent_at')->nullable();
            $table->string('channel', 30)->nullable();
            $table->timestamps();

            $table->index(['phone', 'purpose', 'created_at']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            // Global-account model: the same person (one user) may exist under
            // several companies; the employee email is no longer a global login
            // key, so global uniqueness is lifted (per-company duplication is
            // still rejected at the application layer).
            $table->dropUnique(['email']);
            $table->index('email');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            // Gap analysis: the log had no actor column — "who did it" was unanswerable.
            $table->foreignId('actor_user_id')->nullable()->after('company_id')->constrained('users')->nullOnDelete();
            $table->string('actor_name')->nullable()->after('actor_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('actor_user_id');
            $table->dropColumn('actor_name');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropIndex(['email']);
            $table->unique('email');
        });

        Schema::dropIfExists('otp_codes');
        Schema::dropIfExists('role_assignments');
        Schema::dropIfExists('company_memberships');

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['phone']);
            $table->dropColumn('auth_epoch');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A5 — Communities & leadership (H §6).
 *
 * 1. Leadership lives ONLY in `role_assignments` (community_leader on the
 *    community scope, exactly one `is_primary`). The legacy
 *    `communities.leader_id` column and the parallel pivot `captain` role are
 *    reconciled into assignments, then dropped — two old sources of truth
 *    become one.
 * 2. Lifecycle: `leaderless_since` feeds the 14-day AM alert and the 30-day
 *    dormancy transition; status gains `dormant` (خامل).
 * 3. Membership becomes a state machine on the pivot (active/left/removed/
 *    banned + dates + documented reason) — leaving NEVER deletes the row.
 * 4. Announcements gain `link_url` (text+link only per spec) and `edited_at`
 *    (author 15-minute edit window).
 * 5. `event_comments`: member discussion exists ONLY under events (soft
 *    deleted so reported content stays inspectable).
 */
return new class extends Migration
{
    public function up(): void
    {
        // --- 1) Reconcile legacy leadership into role_assignments ---------
        $now = now();

        $communities = DB::table('communities')->get(['id', 'leader_id']);

        foreach ($communities as $community) {
            if ($community->leader_id === null) {
                continue;
            }

            $userId = DB::table('employees')->where('id', $community->leader_id)->value('user_id');

            if ($userId === null) {
                continue;
            }

            DB::table('role_assignments')->updateOrInsert([
                'user_id' => $userId,
                'role' => 'community_leader',
                'scope_type' => 'community',
                'scope_id' => $community->id,
            ], [
                'is_primary' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // The parallel «captain» representation → non-primary co-leaders.
        $captains = DB::table('community_member')->where('role', 'captain')->get(['community_id', 'employee_id']);
        $leaderByCommunity = $communities->pluck('leader_id', 'id');

        foreach ($captains as $captain) {
            $userId = DB::table('employees')->where('id', $captain->employee_id)->value('user_id');

            if ($userId === null) {
                continue;
            }

            $isPrimary = (int) $leaderByCommunity->get($captain->community_id) === (int) $captain->employee_id;

            DB::table('role_assignments')->updateOrInsert([
                'user_id' => $userId,
                'role' => 'community_leader',
                'scope_type' => 'community',
                'scope_id' => $captain->community_id,
            ], [
                'is_primary' => $isPrimary,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // --- 2) communities: drop leader_id, add lifecycle columns --------
        Schema::table('communities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('leader_id');
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->timestamp('leaderless_since')->nullable()->after('status');
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'dormant'])->default('active')->change();
        });

        // Communities left with no leader start their leaderless clock now.
        $ledCommunityIds = DB::table('role_assignments')
            ->where('role', 'community_leader')
            ->where('scope_type', 'community')
            ->pluck('scope_id');

        DB::table('communities')
            ->whereNotIn('id', $ledCommunityIds)
            ->update(['leaderless_since' => $now]);

        // --- 3) community_member: membership as states, never deletion ----
        Schema::table('community_member', function (Blueprint $table) {
            $table->enum('status', ['active', 'left', 'removed', 'banned'])->default('active')->after('employee_id');
            $table->timestamp('left_at')->nullable()->after('joined_at');
            $table->string('status_reason', 500)->nullable()->after('left_at');
        });

        Schema::table('community_member', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        // --- 4) announcements: text + link, edit window -------------------
        Schema::table('community_announcements', function (Blueprint $table) {
            $table->string('link_url', 2048)->nullable()->after('body');
            $table->timestamp('edited_at')->nullable()->after('link_url');
        });

        // --- 5) event comments (the ONLY member discussion surface) -------
        Schema::create('event_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamp('edited_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['event_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_comments');

        Schema::table('community_announcements', function (Blueprint $table) {
            $table->dropColumn(['link_url', 'edited_at']);
        });

        Schema::table('community_member', function (Blueprint $table) {
            $table->enum('role', ['member', 'captain'])->default('member');
        });

        Schema::table('community_member', function (Blueprint $table) {
            $table->dropColumn(['status', 'left_at', 'status_reason']);
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn('leaderless_since');
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active')->change();
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->foreignId('leader_id')->nullable()->constrained('employees')->nullOnDelete();
        });

        DB::table('role_assignments')
            ->where('role', 'community_leader')
            ->where('scope_type', 'community')
            ->delete();
    }
};

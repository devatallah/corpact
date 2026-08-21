<?php

namespace App\Support\Database;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Installs database-level append-only protection on a table — the same
 * belt-and-braces pattern A6 used for `wallet_transactions` (model guard +
 * trigger), so a raw `DB::table(...)->update()/delete()` cannot bypass the
 * Eloquent guard.
 *
 * H §19: «جدول `audit_logs` للكتابة فقط — لا تعديل ولا حذف».
 *
 * Unlike A6's inline SQL this also covers `pgsql`, so a Postgres deployment
 * is not silently left unprotected.
 */
class AppendOnlyTable
{
    public static function protect(string $table, string $message): void
    {
        $driver = Schema::getConnection()->getDriverName();

        match ($driver) {
            'sqlite' => self::protectSqlite($table, $message),
            'mysql', 'mariadb' => self::protectMysql($table, $message),
            'pgsql' => self::protectPgsql($table, $message),
            default => null,
        };
    }

    public static function unprotect(string $table): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['sqlite', 'mysql', 'mariadb'], true)) {
            DB::unprepared("DROP TRIGGER IF EXISTS {$table}_no_update");
            DB::unprepared("DROP TRIGGER IF EXISTS {$table}_no_delete");

            return;
        }

        if ($driver === 'pgsql') {
            DB::unprepared("DROP TRIGGER IF EXISTS {$table}_no_update ON {$table}");
            DB::unprepared("DROP TRIGGER IF EXISTS {$table}_no_delete ON {$table}");
            DB::unprepared("DROP FUNCTION IF EXISTS {$table}_append_only()");
        }
    }

    private static function protectSqlite(string $table, string $message): void
    {
        foreach (['update' => 'UPDATE', 'delete' => 'DELETE'] as $suffix => $operation) {
            DB::unprepared(
                "CREATE TRIGGER {$table}_no_{$suffix} BEFORE {$operation} ON {$table} ".
                "BEGIN SELECT RAISE(ABORT, '{$message}'); END;"
            );
        }
    }

    private static function protectMysql(string $table, string $message): void
    {
        foreach (['update' => 'UPDATE', 'delete' => 'DELETE'] as $suffix => $operation) {
            DB::unprepared(
                "CREATE TRIGGER {$table}_no_{$suffix} BEFORE {$operation} ON {$table} FOR EACH ROW ".
                "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '{$message}';"
            );
        }
    }

    private static function protectPgsql(string $table, string $message): void
    {
        DB::unprepared(
            "CREATE OR REPLACE FUNCTION {$table}_append_only() RETURNS trigger AS \$\$ ".
            "BEGIN RAISE EXCEPTION '{$message}'; END; \$\$ LANGUAGE plpgsql;"
        );

        foreach (['update' => 'UPDATE', 'delete' => 'DELETE'] as $suffix => $operation) {
            DB::unprepared(
                "CREATE TRIGGER {$table}_no_{$suffix} BEFORE {$operation} ON {$table} ".
                "FOR EACH ROW EXECUTE FUNCTION {$table}_append_only();"
            );
        }
    }
}

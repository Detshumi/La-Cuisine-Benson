<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create unique constraints/indexes for lookup names.
        // For Postgres we prefer expression-based unique indexes on LOWER(column)
        // so uniqueness is enforced case-insensitively. For other DBs fall back
        // to normal unique constraints (user intends to run fresh migrations).
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            $stmts = [
                "CREATE UNIQUE INDEX IF NOT EXISTS categories_name_en_ci_unique ON categories (LOWER(name_en));",
                "CREATE UNIQUE INDEX IF NOT EXISTS categories_name_fr_ci_unique ON categories (LOWER(name_fr));",
                "CREATE UNIQUE INDEX IF NOT EXISTS options_name_en_ci_unique ON options (LOWER(name_en));",
                "CREATE UNIQUE INDEX IF NOT EXISTS options_name_fr_ci_unique ON options (LOWER(name_fr));",
            ];

            foreach ($stmts as $sql) {
                Schema::getConnection()->statement($sql);
            }
        } else {
            Schema::table('categories', function (Blueprint $table) {
                // use text columns; create simple unique index
                $table->unique('name_en', 'categories_name_en_unique');
                $table->unique('name_fr', 'categories_name_fr_unique');
            });

            Schema::table('options', function (Blueprint $table) {
                $table->unique('name_en', 'options_name_en_unique');
                $table->unique('name_fr', 'options_name_fr_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            $stmts = [
                "DROP INDEX IF EXISTS categories_name_en_ci_unique;",
                "DROP INDEX IF EXISTS categories_name_fr_ci_unique;",
                "DROP INDEX IF EXISTS options_name_en_ci_unique;",
                "DROP INDEX IF EXISTS options_name_fr_ci_unique;",
            ];

            foreach ($stmts as $sql) {
                Schema::getConnection()->statement($sql);
            }
        } else {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropUnique('categories_name_en_unique');
                $table->dropUnique('categories_name_fr_unique');
            });

            Schema::table('options', function (Blueprint $table) {
                $table->dropUnique('options_name_en_unique');
                $table->dropUnique('options_name_fr_unique');
            });
        }
    }
};

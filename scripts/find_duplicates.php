<?php
// scripts/find_duplicates.php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = ['categories', 'options'];
$columns = ['name_en', 'name_fr'];

$results = [];
foreach ($tables as $table) {
    foreach ($columns as $col) {
        $sql = "SELECT lower({$col}) AS lc, array_agg(id) AS ids, array_agg({$col}) AS names, count(*) AS cnt FROM {$table} WHERE {$col} IS NOT NULL GROUP BY lc HAVING count(*) > 1;";
        $rows = DB::select($sql);
        $results["{$table}.{$col}"] = $rows;
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);


<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Option::unguard();
$opt = \App\Models\Option::first();
if ($opt) {
    echo 'option.thumbnail: ' . ($opt->thumbnail ?? 'NULL') . PHP_EOL;
    echo 'option.thumbnail_url: ' . ($opt->thumbnail_url ?? 'NULL') . PHP_EOL;
} else {
    echo 'no option records' . PHP_EOL;
}

$prod = \App\Models\Product::first();
if ($prod) {
    echo 'product.thumbnail: ' . ($prod->thumbnail ?? 'NULL') . PHP_EOL;
    echo 'product.thumbnail_url: ' . ($prod->thumbnail_url ?? 'NULL') . PHP_EOL;
} else {
    echo 'no product records' . PHP_EOL;
}

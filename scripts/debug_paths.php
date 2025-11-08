<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "public_path: " . public_path() . PHP_EOL;
echo "storage_path: " . storage_path() . PHP_EOL;
$test = 'images/test_upload.jpg';
$storedFullPath = storage_path('app/public/' . $test);
$publicFullPath = public_path('images/test_upload.jpg');

echo "storedFullPath: " . $storedFullPath . PHP_EOL;
echo "file_exists storedFullPath: " . (file_exists($storedFullPath) ? 'yes' : 'no') . PHP_EOL;
echo "publicFullPath: " . $publicFullPath . PHP_EOL;
echo "file_exists publicFullPath: " . (file_exists($publicFullPath) ? 'yes' : 'no') . PHP_EOL;

<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$stored = storage_path('app/public/images/test_upload.jpg');
$publicDir = public_path('images');
$publicPath = $publicDir . DIRECTORY_SEPARATOR . 'test_upload.jpg';

if (!is_dir($publicDir)) {
    echo "Creating public dir: $publicDir\n";
    $r = @mkdir($publicDir, 0755, true);
    echo "mkdir result: " . ($r ? 'ok' : 'failed') . "\n";
}

if (file_exists($stored)) {
    echo "Copying $stored -> $publicPath\n";
    $r = @copy($stored, $publicPath);
    echo "copy result: " . ($r ? 'ok' : 'failed') . "\n";
    echo "file_exists public: " . (file_exists($publicPath) ? 'yes' : 'no') . "\n";
} else {
    echo "stored not found: $stored\n";
}

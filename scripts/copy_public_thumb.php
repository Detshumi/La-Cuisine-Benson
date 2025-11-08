<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$thumbStored = storage_path('app/public/images/thumbs/1762635181_PbVGHi4A_thumb.jpg');
$publicThumbDir = public_path('images/thumbs');
$publicThumbPath = $publicThumbDir . DIRECTORY_SEPARATOR . basename($thumbStored);

if (!is_dir($publicThumbDir)) {
    echo "Creating public thumb dir: $publicThumbDir\n";
    $r = @mkdir($publicThumbDir, 0755, true);
    echo "mkdir thumbs result: " . ($r ? 'ok' : 'failed') . "\n";
}

if (file_exists($thumbStored)) {
    echo "Copying $thumbStored -> $publicThumbPath\n";
    $r = @copy($thumbStored, $publicThumbPath);
    echo "copy thumb result: " . ($r ? 'ok' : 'failed') . "\n";
    echo "file_exists public thumb: " . (file_exists($publicThumbPath) ? 'yes' : 'no') . "\n";
} else {
    echo "stored thumb not found: $thumbStored\n";
}

<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\UploadController;

$path = __DIR__ . '/../storage/app/public/images/test_upload.jpg';
if (!file_exists($path)) {
    echo "file not found: $path\n";
    exit(1);
}

$uploaded = new UploadedFile($path, basename($path), null, null, true);
$request = Request::create('/admin/uploads/image', 'POST', [], [], ['image' => $uploaded]);

$controller = new UploadController();
try {
    $response = $controller->image($request);
    if (is_object($response) && method_exists($response, 'getStatusCode')) {
        echo "Status: " . $response->getStatusCode() . "\n";
        echo $response->getContent() . "\n";
    } else {
        var_dump($response);
    }
} catch (\Throwable $e) {
    echo "Exception: " . get_class($e) . " - " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

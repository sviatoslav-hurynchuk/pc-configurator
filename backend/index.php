<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';
    $len = strlen($prefix);

    if (strncmp($prefix, $class, $len) !== 0) { return; }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use App\Controllers\ComponentController;
use App\Controllers\AuthController;
use App\Core\Router;

$router = new Router();

// ==========================================
// (ROUTES)
// ==========================================

$componentController = new ComponentController();
$router->add('GET', '/api/components', [$componentController, 'index']);

$authController = new AuthController();
$router->add('POST', '/api/register', [$authController, 'register']);
$router->add('POST', '/api/login', [$authController, 'login']);
$router->add('POST', '/api/logout', [$authController, 'logout']);
$router->add('GET', '/api/me', [$authController, 'me']);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$router->dispatch($_SERVER['REQUEST_METHOD'], $uri);
<?php
session_start();
require_once __DIR__ . '/app/Core/ErrorHandler.php';
\App\Core\ErrorHandler::register();

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

// Redirects
$redirectManager = new \App\Core\RedirectManager();
$redirectManager->handle($_SERVER['REQUEST_URI'] ?? '/');

// Rate Limiting
$rateLimiter = new \App\Core\RateLimiter(null, 60, 60);
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (!$rateLimiter->check($clientIp)) {
    http_response_code(429);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'Занадто багато запитів. Спробуйте пізніше. (Rate Limit Exceeded)'
    ], JSON_UNESCAPED_UNICODE);
    exit(0);
}

use App\Controllers\ComponentController;
use App\Controllers\AuthController;
use App\Core\Router;
use App\Controllers\OrderController;
use App\Controllers\PageController;

$router = new Router();



$componentController = new ComponentController();
$router->add('GET', '/api/components', [$componentController, 'index']);
$router->add('POST', '/api/admin/components', [$componentController, 'storeComponent']);
$router->add('POST', '/api/admin/components/([0-9]+)', [$componentController, 'updateComponent']);
$router->add('DELETE', '/api/admin/components/([0-9]+)', [$componentController, 'deleteComponent']);
$router->add('POST', '/api/admin/upload', [$componentController, 'uploadImage']);

$orderController = new OrderController();
$router->add('POST', '/api/orders', [$orderController, 'save']);
$router->add('GET', '/api/orders', [$orderController, 'getUserHistory']);
$router->add('POST', '/api/orders/status', [$orderController, 'updateStatus']);
$router->add('GET', '/api/admin/orders', [$orderController, 'getAllOrders']);
$router->add('POST', '/api/admin/orders/status', [$orderController, 'adminUpdateStatus']);

$pageController = new PageController();
$router->add('GET', '/api/pages', [$pageController, 'index']);
$router->add('GET', '/api/pages/([a-z0-9-]+)', [$pageController, 'show']);
$router->add('GET', '/api/admin/pages', [$pageController, 'adminIndex']);
$router->add('POST', '/api/admin/pages', [$pageController, 'store']);
$router->add('POST', '/api/admin/pages/([0-9]+)', [$pageController, 'update']);
$router->add('DELETE', '/api/admin/pages/([0-9]+)', [$pageController, 'delete']);

$authController = new AuthController();
$router->add('POST', '/api/register', [$authController, 'register']);
$router->add('POST', '/api/login', [$authController, 'login']);
$router->add('POST', '/api/logout', [$authController, 'logout']);
$router->add('GET', '/api/me', [$authController, 'me']);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$router->dispatch($_SERVER['REQUEST_METHOD'], $uri);
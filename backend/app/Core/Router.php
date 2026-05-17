<?php
namespace App\Core;

use Exception;

class Router {
    private array $routes = [];

    public function add(string $method, string $path, callable|array $callback): void {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'callback' => $callback
        ];
    }

    public function dispatch(string $method, string $uri): void {
        $parsedUrl = parse_url($uri);
        $path = $parsedUrl['path'] ?? '/';

        ob_start();

        try {
            foreach ($this->routes as $route) {
                $pattern = '#^' . $route['path'] . '$#';
                if ($route['method'] === $method && preg_match($pattern, $path, $matches)) {
                    array_shift($matches); // remove the full match

                    call_user_func_array($route['callback'], $matches);

                    $output = ob_get_contents();
                    ob_end_flush();
                    return;
                }
            }

            // Path not found
            ob_clean();
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
            ob_end_flush();

        } catch (Exception $e) {
            // Critical error
            ob_clean();
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            ob_end_flush();
        }
    }
}
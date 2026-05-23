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
            $isApi = (strpos($path, '/api/') === 0);
            if ($isApi) {
                header('Content-Type: application/json');
                echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
            } else {
                header('Content-Type: text/html; charset=utf-8');
                echo self::render404Html();
            }
            ob_end_flush();

        } catch (\Throwable $e) {
            ob_clean();
            throw $e;
        }
    }

    private static function render404Html(): string {
        return <<<HTML
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Сторінку не знайдено</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Outfit', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #f8fafc;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 3rem 4rem;
            max-width: 600px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 1s ease-out;
        }
        h1 {
            font-size: 8rem;
            font-weight: 800;
            background: linear-gradient(to right, #6366f1, #a855f7, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            margin-bottom: 1rem;
            animation: pulse 2s infinite alternate;
        }
        h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1rem; color: #e2e8f0; }
        p { font-size: 1.1rem; color: #94a3b8; margin-bottom: 2rem; line-height: 1.6; }
        .btn {
            display: inline-block;
            text-decoration: none;
            background: linear-gradient(90deg, #6366f1, #a855f7);
            color: #fff;
            padding: 0.8rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            from { transform: scale(1); }
            to { transform: scale(1.05); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <h2>Сторінку не знайдено</h2>
        <p>На жаль, запитуваний вами шлях не існує або був переміщений. Будь ласка, поверніться на головну сторінку конфігуратора.</p>
        <a href="http://localhost:5173" class="btn">На головну</a>
    </div>
</body>
</html>
HTML;
    }
}
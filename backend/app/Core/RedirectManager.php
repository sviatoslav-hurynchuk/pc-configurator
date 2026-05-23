<?php
namespace App\Core;

class RedirectManager {
    private string $configFile;

    public function __construct(string $configFile = null) {
        $this->configFile = $configFile ?: dirname(__DIR__, 2) . '/config/redirects.json';
    }

    public function getRedirect(string $requestUri): ?array {
        if (!file_exists($this->configFile)) {
            return null;
        }

        $json = file_get_contents($this->configFile);
        $redirects = json_decode($json, true);
        if (!is_array($redirects)) {
            return null;
        }

        $parsedUrl = parse_url($requestUri, PHP_URL_PATH);
        $path = rtrim($parsedUrl ?? '', '/');
        if (empty($path)) {
            $path = '/';
        }

        return $redirects[$path] ?? null;
    }

    public function handle(string $requestUri): void {
        $rule = $this->getRedirect($requestUri);
        if ($rule) {
            $status = isset($rule['status']) ? (int)$rule['status'] : 301;
            
            if ($status === 404) {
                http_response_code(404);
                header('Content-Type: text/html; charset=utf-8');
                echo <<<HTML
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Сторінку не знайдено</title>    
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
                exit(0);
            }

            if (!empty($rule['destination'])) {
                http_response_code($status);
                header('Location: ' . $rule['destination']);
                exit(0);
            }
        }
    }
}

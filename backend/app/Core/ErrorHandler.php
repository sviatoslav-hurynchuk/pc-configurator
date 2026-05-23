<?php
namespace App\Core;

class ErrorHandler {
    public static function register(): void {
        ob_start();
        register_shutdown_function([self::class, 'handleShutdown']);
        set_exception_handler([self::class, 'handleException']);
        set_error_handler([self::class, 'handleError']);
    }

    public static function handleShutdown(): void {
        $error = error_get_last();
        if ($error && self::isFatal($error['type'])) {
            self::renderErrorPage(500, $error['message'], $error['file'], $error['line']);
        }
    }

    public static function handleException(\Throwable $exception): void {
        self::renderErrorPage(500, $exception->getMessage(), $exception->getFile(), $exception->getLine());
    }

    public static function handleError(int $errno, string $errstr, string $errfile, int $errline): bool {
        if (!(error_reporting() & $errno)) {
            return false;
        }
        self::renderErrorPage(500, $errstr, $errfile, $errline);
        return true;
    }

    private static function isFatal(int $type): bool {
        return in_array($type, [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR]);
    }

    private static function renderErrorPage(int $statusCode, string $message, string $file, int $line): void {
        if (ob_get_length()) {
            ob_clean();
        }

        http_response_code($statusCode);

        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        $isApi = (strpos($requestUri, '/api/') === 0) || 
                 (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

        if ($isApi) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status' => 'error',
                'message' => 'Внутрішня помилка сервера. Спробуйте пізніше.'
            ], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        header('Content-Type: text/html; charset=utf-8');
        echo <<<HTML
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Внутрішня помилка сервера</title>
</head>
<body>
    <div class="container">
        <h1>500</h1>
        <h2>Внутрішня помилка сервера</h2>
        <p>Сталася непередбачувана помилка під час обробки вашого запиту. Наші адміністратори вже працюють над її вирішенням.</p>
        <a href="http://localhost:5173" class="btn">Повернутися на головну</a>
    </div>
</body>
</html>
HTML;
        exit(0);
    }
}

<?php
namespace App\Core;

abstract class BaseController {
    protected function jsonResponse(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    protected function requireAuth(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Необхідна авторизація'], 401);
            exit;
        }
    }

    protected function requireAdmin(): void {
        $this->requireAuth();

        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            $this->jsonResponse(['status' => 'error', 'message' => 'Доступ заборонено'], 403);
            exit;
        }
    }
}
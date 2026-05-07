<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\UserModel;

class AuthController extends BaseController {

    private UserModel $userModel;

    public function __construct() {
        $this->userModel = new UserModel();


        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => 86400,
                'path' => '/',
                'domain' => 'localhost',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
    }

    public function register(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        // Базова валідація (Лаб 1-2)
        if (empty($name) || empty($email) || empty($password)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Всі поля обов\'язкові'], 400);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Некоректний формат email'], 400);
            return;
        }

        if (strlen($password) < 6) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Пароль має бути не менше 6 символів'], 400);
            return;
        }

        if ($this->userModel->create($name, $email, $password)) {
            $user = $this->userModel->findByEmail($email);
            $this->startUserSession($user);
            $this->jsonResponse(['status' => 'success', 'message' => 'Реєстрація успішна', 'user' => $this->getSafeUserData($user)]);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Користувач з таким email вже існує'], 409);
        }
    }

    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Введіть email та пароль'], 400);
            return;
        }

        $user = $this->userModel->findByEmail($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            $this->startUserSession($user);
            $this->jsonResponse(['status' => 'success', 'message' => 'Успішний вхід', 'user' => $this->getSafeUserData($user)]);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Невірний email або пароль'], 401);
        }
    }

    public function logout(): void {
        session_unset();
        session_destroy();
        $this->jsonResponse(['status' => 'success', 'message' => 'Вихід виконано']);
    }

    public function me(): void {
        if (isset($_SESSION['user_id'])) {
            $this->jsonResponse([
                'status' => 'success',
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'name' => $_SESSION['user_name'],
                    'email' => $_SESSION['user_email'],
                    'role' => $_SESSION['user_role']
                ]
            ]);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Не авторизовано'], 401);
        }
    }

    private function startUserSession(array $user): void {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
    }

    private function getSafeUserData(array $user): array {
        return [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];
    }
}
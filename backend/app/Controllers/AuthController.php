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
        $rememberMe = $input['rememberMe'] ?? false;

        if (empty($email) || empty($password)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Введіть email та пароль'], 400);
            return;
        }

        $user = $this->userModel->findByEmail($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            $this->startUserSession($user);

            if ($rememberMe) {
                $series = bin2hex(random_bytes(32));
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', time() + (86400 * 30));

                $this->userModel->createAuthToken($user['id'], $series, hash('sha256', $token), $expires);

                $cookieValue = $series . '|' . $token;
                setcookie('remember_token', $cookieValue, time() + (86400 * 30), "/", "", false, true);
            }

            $this->jsonResponse(['status' => 'success', 'message' => 'Успішний вхід', 'user' => $this->getSafeUserData($user)]);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Невірний email або пароль'], 401);
        }
    }

    public function logout(): void {
        if (isset($_COOKIE['remember_token'])) {
            $parts = explode('|', $_COOKIE['remember_token']);
            $this->userModel->deleteTokenBySeries($parts[0]);
            setcookie('remember_token', '', time() - 3600, '/');
        }
        session_unset();
        session_destroy();
        $this->jsonResponse(['status' => 'success', 'message' => 'Вихід виконано']);
    }

    public function me(): void {
        if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
            $parts = explode('|', $_COOKIE['remember_token']);
            if (count($parts) === 2) {
                $series = $parts[0];
                $token = $parts[1];

                $storedToken = $this->userModel->getAuthTokenBySeries($series);

                if ($storedToken && strtotime($storedToken['expires_at']) > time()) {
                    if (hash_equals($storedToken['token_hash'], hash('sha256', $token))) {
                        $newToken = bin2hex(random_bytes(32));
                        $newExpires = date('Y-m-d H:i:s', time() + (86400 * 30));
                        $this->userModel->updateAuthToken($series, hash('sha256', $newToken), $newExpires);

                        setcookie('remember_token', $series . '|' . $newToken, time() + (86400 * 30), "/", "", false, true);

                        $user = $this->userModel->findById($storedToken['user_id']);
                        if ($user) {
                            $this->startUserSession($user);
                        }
                    } else {
                        $this->userModel->deleteAllTokensForUser($storedToken['user_id']);
                        setcookie('remember_token', '', time() - 3600, '/');
                        $this->jsonResponse(['status' => 'error', 'message' => 'Security alert: dynamic token mismatch!'], 403);
                        return;
                    }
                }
            }
        }

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
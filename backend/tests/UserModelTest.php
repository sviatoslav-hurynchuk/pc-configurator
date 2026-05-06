<?php
use PHPUnit\Framework\TestCase;
use App\Models\UserModel;

class UserModelTest extends TestCase {
    private $userModel;

    protected function setUp(): void {
        // Ініціалізація моделі перед кожним тестом
        $this->userModel = new UserModel();
        // (Опціонально) Очищення тестової таблиці користувачів
    }

    public function testUserCreationAndRetrieval() {
        // 1. Створюємо тестового користувача
        $email = 'test' . time() . '@example.com';
        $password = 'secret123';
        $result = $this->userModel->create('Test User', $email, $password);

        $this->assertTrue($result, "User creation should return true");

        // 2. Шукаємо його за email
        $user = $this->userModel->findByEmail($email);

        $this->assertNotNull($user, "User should be found in DB");
        $this->assertEquals('Test User', $user['name']);

        // 3. Перевіряємо, що пароль дійсно захешований
        $this->assertNotEquals($password, $user['password_hash'], "Password must be hashed in DB");
        $this->assertTrue(password_verify($password, $user['password_hash']), "Hash should verify with correct password");
    }
}
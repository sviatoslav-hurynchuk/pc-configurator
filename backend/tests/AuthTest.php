<?php
use PHPUnit\Framework\TestCase;
use App\Models\UserModel;

class AuthTest extends TestCase {
    private UserModel $userModel;

    protected function setUp(): void {
        $this->userModel = new UserModel();
    }

    public function testFindNonExistentUserReturnsNull() {
        $user = $this->userModel->findByEmail('fake_email@test.com');
        $this->assertNull($user, "Пошук неіснуючого email має повертати null");
    }

    public function testPasswordHashingRules() {
        $rawPassword = 'mySecretPassword123';
        $hash = password_hash($rawPassword, PASSWORD_DEFAULT);

        $this->assertNotEquals($rawPassword, $hash, "Хеш не повинен дорівнювати паролю");
        $this->assertTrue(password_verify($rawPassword, $hash), "Функція verify має успішно валідувати правильний пароль");
    }
}
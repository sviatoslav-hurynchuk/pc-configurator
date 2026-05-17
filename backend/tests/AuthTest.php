<?php
use PHPUnit\Framework\TestCase;
use App\Models\UserModel;

class AuthTest extends TestCase {

    public function testFindNonExistentUserReturnsNull() {
        $userModel = new UserModel();
        $user = $userModel->findByEmail('fake_email@test.com');

        $this->assertNull($user, "Пошук неіснуючого email має повертати null");
    }

    public function testPasswordHashingRules() {
        $rawPassword = 'mySecretPassword123';
        $hash = password_hash($rawPassword, PASSWORD_DEFAULT);

        $this->assertNotEquals($rawPassword, $hash, "Хеш не повинен дорівнювати паролю");
        $this->assertTrue(password_verify($rawPassword, $hash), "Функція verify має успішно валідувати правильний пароль");
    }
    public function testUserCreationAndRetrieval() {
        $userModel = new UserModel();

        $email = 'test' . time() . '@example.com';
        $password = 'secret123';
        $result = $userModel->create('Test User', $email, $password);

        $this->assertTrue($result);

        $user = $userModel->findByEmail($email);

        $this->assertNotNull($user);
        $this->assertEquals('Test User', $user['name']);

        $this->assertNotEquals($password, $user['password_hash']);
        $this->assertTrue(password_verify($password, $user['password_hash']));
    }

    public function testRememberMeTokenLifecycle() {
        $userModel = new UserModel();

        $email = 'token_tester_' . time() . '@example.com';
        $userModel->create('Token Tester', $email, 'password123');
        $user = $userModel->findByEmail($email);
        $this->assertNotNull($user);

        $userId = $user['id'];
        $series = bin2hex(random_bytes(32));
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $isCreated = $userModel->createAuthToken($userId, $series, $tokenHash, $expires);
        $this->assertTrue($isCreated);

        $storedToken = $userModel->getAuthTokenBySeries($series);
        $this->assertNotNull($storedToken);
        $this->assertEquals($userId, $storedToken['user_id']);
        $this->assertEquals($tokenHash, $storedToken['token_hash']);

        $newToken = bin2hex(random_bytes(32));
        $newTokenHash = hash('sha256', $newToken);
        $newExpires = date('Y-m-d H:i:s', time() + 7200);

        $isUpdated = $userModel->updateAuthToken($series, $newTokenHash, $newExpires);
        $this->assertTrue($isUpdated);

        $updatedToken = $userModel->getAuthTokenBySeries($series);
        $this->assertNotNull($updatedToken);
        $this->assertEquals($newTokenHash, $updatedToken['token_hash']);

        $isDeleted = $userModel->deleteTokenBySeries($series);
        $this->assertTrue($isDeleted);

        $checkDeleted = $userModel->getAuthTokenBySeries($series);
        $this->assertNull($checkDeleted);
    }
}
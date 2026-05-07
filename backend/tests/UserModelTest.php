<?php
use PHPUnit\Framework\TestCase;
use App\Models\UserModel;

class UserModelTest extends TestCase {

    public function testUserCreationAndRetrieval() {
        $userModel = new UserModel();

        $email = 'test' . time() . '@example.com';
        $password = 'secret123';
        $result = $userModel->create('Test User', $email, $password);

        $this->assertTrue($result, "User creation should return true");

        $user = $userModel->findByEmail($email);

        $this->assertNotNull($user, "User should be found in DB");
        $this->assertEquals('Test User', $user['name']);

        $this->assertNotEquals($password, $user['password_hash'], "Password must be hashed in DB");
        $this->assertTrue(password_verify($password, $user['password_hash']), "Hash should verify with correct password");
    }
}
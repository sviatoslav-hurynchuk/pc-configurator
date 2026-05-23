<?php
use PHPUnit\Framework\TestCase;
use App\Models\UserModel;

class UserModelTest extends TestCase {

    public function testFindById() {
        $userModel = new UserModel();

        $email = 'findbyid_' . time() . '@example.com';
        $userModel->create('FindById User', $email, 'pass123');
        $userByEmail = $userModel->findByEmail($email);
        $this->assertNotNull($userByEmail);

        $userById = $userModel->findById($userByEmail['id']);
        $this->assertNotNull($userById, "findById має знайти користувача за його ID");
        $this->assertEquals($email, $userById['email'], "Email знайденого користувача має збігатися");
        $this->assertEquals('FindById User', $userById['name']);

        $nonExistent = $userModel->findById(999999);
        $this->assertNull($nonExistent);
    }

    public function testDeleteAllTokensForUser() {
        $userModel = new UserModel();

        $email = 'deltokens_' . time() . '@example.com';
        $userModel->create('Del Tokens User', $email, 'pass123');
        $user = $userModel->findByEmail($email);
        $userId = $user['id'];

        $series1 = bin2hex(random_bytes(32));
        $series2 = bin2hex(random_bytes(32));
        $hash = hash('sha256', 'sometoken');
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $userModel->createAuthToken($userId, $series1, $hash, $expires);
        $userModel->createAuthToken($userId, $series2, $hash, $expires);

        $this->assertNotNull($userModel->getAuthTokenBySeries($series1));
        $this->assertNotNull($userModel->getAuthTokenBySeries($series2));

        $result = $userModel->deleteAllTokensForUser($userId);
        $this->assertTrue($result);

        $this->assertNull($userModel->getAuthTokenBySeries($series1));
        $this->assertNull($userModel->getAuthTokenBySeries($series2));
    }

    public function testUpdateUser() {
        $userModel = new UserModel();

        $email = 'update_' . time() . '@example.com';
        $userModel->create('Original User', $email, 'pass123');
        $user = $userModel->findByEmail($email);
        $userId = $user['id'];

        $newEmail = 'updated_' . time() . '@example.com';
        $result = $userModel->updateUser($userId, 'Updated User', $newEmail, null);
        $this->assertTrue($result);

        $updatedUser = $userModel->findById($userId);
        $this->assertEquals('Updated User', $updatedUser['name']);
        $this->assertEquals($newEmail, $updatedUser['email']);
        $this->assertTrue(password_verify('pass123', $updatedUser['password_hash']));

        $resultWithPass = $userModel->updateUser($userId, 'Updated User 2', $newEmail, 'newsecurepass');
        $this->assertTrue($resultWithPass);

        $updatedUser2 = $userModel->findById($userId);
        $this->assertEquals('Updated User 2', $updatedUser2['name']);
        $this->assertTrue(password_verify('newsecurepass', $updatedUser2['password_hash']));
    }

    public function testDeleteUser() {
        $userModel = new UserModel();

        $email = 'delete_' . time() . '@example.com';
        $userModel->create('Delete User', $email, 'pass123');
        $user = $userModel->findByEmail($email);
        $userId = $user['id'];

        $this->assertNotNull($userModel->findById($userId));

        $result = $userModel->deleteUser($userId);
        $this->assertTrue($result);

        $this->assertNull($userModel->findById($userId));
    }
}
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
}
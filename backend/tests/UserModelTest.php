<?php
use PHPUnit\Framework\TestCase;
use App\Models\UserModel;

class UserModelTest extends TestCase {

    /**
     * Перевіряє пошук користувача за числовим ID.
     * findById() повинен знаходити існуючого користувача та повертати null для неіснуючого.
     */
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
        $this->assertNull($nonExistent, "findById має повертати null для неіснуючого ID");
    }

    /**
     * Перевіряє масове видалення всіх remember-me токенів одного користувача.
     * Необхідно для security-механізму: при виявленні крадіжки токена
     * всі сесії користувача примусово завершуються.
     */
    public function testDeleteAllTokensForUser() {
        $userModel = new UserModel();

        $email = 'deltokens_' . time() . '@example.com';
        $userModel->create('Del Tokens User', $email, 'pass123');
        $user = $userModel->findByEmail($email);
        $userId = $user['id'];

        // Створюємо 2 окремих токени (імітація входу з двох пристроїв)
        $series1 = bin2hex(random_bytes(32));
        $series2 = bin2hex(random_bytes(32));
        $hash = hash('sha256', 'sometoken');
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $userModel->createAuthToken($userId, $series1, $hash, $expires);
        $userModel->createAuthToken($userId, $series2, $hash, $expires);

        // Переконуємося, що обидва токени існують
        $this->assertNotNull($userModel->getAuthTokenBySeries($series1));
        $this->assertNotNull($userModel->getAuthTokenBySeries($series2));

        // Видаляємо всі токени користувача
        $result = $userModel->deleteAllTokensForUser($userId);
        $this->assertTrue($result, "deleteAllTokensForUser має повертати true");

        // Обидва токени мають бути видалені
        $this->assertNull($userModel->getAuthTokenBySeries($series1), "Перший токен має бути видалений");
        $this->assertNull($userModel->getAuthTokenBySeries($series2), "Другий токен має бути видалений");
    }
}
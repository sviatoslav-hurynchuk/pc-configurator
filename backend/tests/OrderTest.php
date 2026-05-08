<?php
use PHPUnit\Framework\TestCase;
use App\Models\OrderModel;
use App\Models\UserModel;

class OrderTest extends TestCase {

    public function testCompleteOrderFlow() {
        $orderModel = new OrderModel();
        $userModel = new UserModel();

        
        $email = 'buyer_' . time() . '@test.com';
        $userModel->create('Test Buyer', $email, 'password123');
        $user = $userModel->findByEmail($email);

        $this->assertNotNull($user, "Тестовий користувач має бути створений");
        $userId = $user['id'];

        
        $componentIds = [1, 2];
        $totalPrice = 25500.00;

        $isCreated = $orderModel->createOrder($userId, $totalPrice, 'processing', $componentIds);
        $this->assertTrue($isCreated, "Модель має повернути true при успішному збереженні збірки");

        
        $history = $orderModel->getUserOrders($userId);

        
        $this->assertCount(1, $history, "В історії має з'явитися рівно 1 нове замовлення");

        $latestOrder = $history[0];
        $this->assertEquals($totalPrice, $latestOrder['total_price'], "Ціна замовлення має збігатися");
        $this->assertArrayHasKey('items', $latestOrder, "Замовлення має містити масив 'items' (деталі)");
        $this->assertCount(2, $latestOrder['items'], "У замовленні має бути рівно 2 збережені деталі");
    }
}
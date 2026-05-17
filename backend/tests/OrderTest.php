<?php
use PHPUnit\Framework\TestCase;
use App\Models\OrderModel;
use App\Models\UserModel;
use App\Models\ComponentModel;

class OrderTest extends TestCase {

    /**
     * Повний E2E-тест збірки: створення → збереження → перевірка історії.
     * Динамічно зчитує перші 2 компоненти з БД (не хардкодить ID),
     * щоб тест не залежав від конкретного стану seed-даних.
     */
    public function testCompleteOrderFlow() {
        $orderModel = new OrderModel();
        $userModel  = new UserModel();
        $componentModel = new ComponentModel();

        // Отримуємо реальні ID компонентів з БД
        $allComponents = $componentModel->getAll();
        $this->assertGreaterThanOrEqual(2, count($allComponents), "В БД має бути мінімум 2 компоненти для тесту");
        $componentIds = [$allComponents[0]['id'], $allComponents[1]['id']];

        // Створюємо тестового користувача
        $email = 'buyer_' . time() . '@test.com';
        $userModel->create('Test Buyer', $email, 'password123');
        $user = $userModel->findByEmail($email);
        $this->assertNotNull($user, "Тестовий користувач має бути створений");
        $userId = $user['id'];

        // Зберігаємо збірку
        $totalPrice = 25500.00;
        $isCreated = $orderModel->createOrder($userId, $totalPrice, 'saved', $componentIds);
        $this->assertTrue($isCreated, "Модель має повернути true при успішному збереженні збірки");

        // Перевіряємо історію замовлень
        $history = $orderModel->getUserOrders($userId);
        $this->assertCount(1, $history, "В історії має з'явитися рівно 1 нове замовлення");

        $latestOrder = $history[0];
        $this->assertEquals($totalPrice, $latestOrder['total_price'], "Ціна замовлення має збігатися");
        $this->assertArrayHasKey('items', $latestOrder, "Замовлення має містити масив 'items' (деталі)");
        $this->assertCount(2, $latestOrder['items'], "У замовленні має бути рівно 2 збережені деталі");
    }

    /**
     * Перевіряє зміну статусу замовлення.
     * Статус 'saved' → 'processing' має зберегтися в БД.
     * Також перевіряє, що updateOrderStatus не змінює чужі замовлення (захист user_id).
     */
    public function testUpdateOrderStatus() {
        $orderModel = new OrderModel();
        $userModel  = new UserModel();
        $componentModel = new ComponentModel();

        $allComponents = $componentModel->getAll();
        $this->assertGreaterThanOrEqual(1, count($allComponents), "В БД має бути мінімум 1 компонент для тесту");
        $componentIds = [$allComponents[0]['id']];

        // Власник замовлення
        $email = 'status_owner_' . time() . '@test.com';
        $userModel->create('Status Owner', $email, 'pass123');
        $owner = $userModel->findByEmail($email);
        $ownerId = $owner['id'];

        // Сторонній користувач
        $email2 = 'status_stranger_' . time() . '@test.com';
        $userModel->create('Stranger', $email2, 'pass123');
        $stranger = $userModel->findByEmail($email2);
        $strangerId = $stranger['id'];

        // Створюємо замовлення від імені власника
        $orderModel->createOrder($ownerId, 1000.00, 'saved', $componentIds);
        $orders = $orderModel->getUserOrders($ownerId);
        $orderId = $orders[0]['id'];

        // Власник успішно змінює статус
        $result = $orderModel->updateOrderStatus($orderId, $ownerId, 'processing');
        $this->assertTrue($result, "Власник має мати змогу змінити статус свого замовлення");

        $updated = $orderModel->getUserOrders($ownerId);
        $this->assertEquals('processing', $updated[0]['status'], "Статус має оновитися до 'processing'");

        // Сторонній НЕ може змінити чужий статус (WHERE user_id захист)
        $strangersAttempt = $orderModel->updateOrderStatus($orderId, $strangerId, 'saved');
        // execute() повертає true навіть якщо 0 рядків змінено — перевіряємо що статус не змінився
        $stillUpdated = $orderModel->getUserOrders($ownerId);
        $this->assertEquals('processing', $stillUpdated[0]['status'], "Сторонній не має змінити статус чужого замовлення");
    }
}
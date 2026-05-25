<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\OrderModel;

class OrderController extends BaseController {
    private OrderModel $orderModel;

    public function __construct() {
        $this->orderModel = new OrderModel();
    }

    public function save(): void {
        $this->requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        $componentIds = $input['componentIds'] ?? [];
        $status = $input['status'] ?? 'saved';

        $allowedStatuses = ['saved', 'processing'];
        if (!in_array($status, $allowedStatuses, true)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Недозволений статус замовлення'], 400);
            return;
        }

        if (empty($componentIds) || !is_array($componentIds)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Збірка порожня'], 400);
            return;
        }

        $componentIds = array_map('intval', $componentIds);
        $componentIds = array_filter($componentIds, fn($id) => $id > 0);
        $componentIds = array_values($componentIds);

        if (empty($componentIds)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Некоректні ідентифікатори компонентів'], 400);
            return;
        }

        $userId = $_SESSION['user_id'];

        if (!$this->orderModel->validateComponentIds($componentIds)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Один або декілька компонентів не існують'], 422);
            return;
        }

        $totalPrice = $this->orderModel->calculateTotalPrice($componentIds);

        if ($this->orderModel->createOrder($userId, $totalPrice, $status, $componentIds)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Збірку успішно збережено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка при збереженні збірки'], 500);
        }
    }
    public function getUserHistory(): void {
        $this->requireAuth();

        $userId = $_SESSION['user_id'];
        $orders = $this->orderModel->getUserOrders($userId);

        $this->jsonResponse([
            'status' => 'success',
            'orders' => $orders
        ]);
    }
    public function updateStatus(): void {
        $this->requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $orderId = isset($input['orderId']) ? (int)$input['orderId'] : null;
        $status = $input['status'] ?? '';

        if (!$orderId || $orderId <= 0) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Не вказано ID замовлення'], 400);
            return;
        }

        if ($status !== 'processing') {
            $this->jsonResponse(['status' => 'error', 'message' => 'Недозволена зміна статусу'], 403);
            return;
        }

        $userId = $_SESSION['user_id'];

        if ($this->orderModel->updateOrderStatus($orderId, $userId, $status)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Замовлення успішно оформлено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка оформлення або недозволена операція'], 422);
        }
    }
    public function adminUpdateStatus(): void {
        $this->requireAdmin();

        $input = json_decode(file_get_contents('php://input'), true);
        $orderId = $input['orderId'] ?? null;
        $status = $input['status'] ?? 'processing';

        if (!$orderId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Не вказано ID замовлення'], 400);
            return;
        }

        if ($this->orderModel->adminUpdateOrderStatus($orderId, $status)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Статус оновлено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка оновлення статусу'], 500);
        }
    }

    public function getAllOrders(): void
    {
        $this->requireAdmin();

        $orderModel = new OrderModel();
        $orders = $orderModel->getAllOrdersForAdmin();

        echo json_encode($orders);
    }
}
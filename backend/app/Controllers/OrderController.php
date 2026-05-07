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
        $totalPrice = $input['totalPrice'] ?? 0;

        if (empty($componentIds)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Збірка порожня'], 400);
            return;
        }

        $userId = $_SESSION['user_id'];

        if ($this->orderModel->createOrder($userId, $totalPrice, $componentIds)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Збірку успішно збережено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка при збереженні збірки'], 500);
        }
    }
}
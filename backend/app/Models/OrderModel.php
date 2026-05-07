<?php
namespace App\Models;

use App\Core\BaseModel;
use PDO;
use Exception;

class OrderModel extends BaseModel {
    public function createOrder(int $userId, float $totalPrice, array $componentIds): bool {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("INSERT INTO orders (user_id, total_price) VALUES (:user_id, :total_price)");
            $stmt->execute([
                'user_id' => $userId,
                'total_price' => $totalPrice
            ]);

            $orderId = $this->db->lastInsertId();

            $stmtItem = $this->db->prepare("INSERT INTO order_items (order_id, component_id, price_at_purchase) VALUES (:order_id, :component_id, (SELECT price FROM components WHERE id = :cid))");

            foreach ($componentIds as $componentId) {
                $stmtItem->execute([
                    'order_id' => $orderId,
                    'component_id' => $componentId,
                    'cid' => $componentId
                ]);
            }

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }
}
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
    public function getUserOrders(int $userId): array {
        $stmt = $this->db->prepare("SELECT id, total_price, status, created_at FROM orders WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->execute(['user_id' => $userId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            $stmtItems = $this->db->prepare("
                SELECT c.name, c.image_url, oi.price_at_purchase 
                FROM order_items oi
                JOIN components c ON oi.component_id = c.id
                WHERE oi.order_id = :order_id
            ");
            $stmtItems->execute(['order_id' => $order['id']]);
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
        }

        return $orders;
    }
}
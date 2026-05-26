<?php
namespace App\Models;

use App\Core\BaseModel;
use PDO;
use Exception;

class OrderModel extends BaseModel {
    public function calculateTotalPrice(array $componentIds): float {
        if (empty($componentIds)) return 0.0;
        $placeholders = implode(',', array_fill(0, count($componentIds), '?'));
        $stmt = $this->db->prepare("SELECT COALESCE(SUM(price), 0) as total FROM components WHERE id IN ($placeholders)");
        $stmt->execute(array_values($componentIds));
        return (float) $stmt->fetchColumn();
    }

    public function validateComponentIds(array $componentIds): bool {
        if (empty($componentIds)) return false;
        $placeholders = implode(',', array_fill(0, count($componentIds), '?'));
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM components WHERE id IN ($placeholders)");
        $stmt->execute(array_values($componentIds));
        return (int) $stmt->fetchColumn() === count($componentIds);
    }

    public function createOrder(int $userId, float $totalPrice, string $status, array $componentIds): bool {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("INSERT INTO orders (user_id, total_price, status) VALUES (:user_id, :total_price, :status)");
            $stmt->execute([
                'user_id' => $userId,
                'total_price' => $totalPrice,
                'status' => $status
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
                SELECT COALESCE(c.name, 'Застарілий товар') as name, c.image_url, oi.price_at_purchase 
                FROM order_items oi
                LEFT JOIN components c ON oi.component_id = c.id
                WHERE oi.order_id = :order_id
            ");
            $stmtItems->execute(['order_id' => $order['id']]);
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
        }

        return $orders;
    }
    public function updateOrderStatus(int $orderId, int $userId, string $status): bool {
        $checkStmt = $this->db->prepare("SELECT status FROM orders WHERE id = :id AND user_id = :user_id");
        $checkStmt->execute(['id' => $orderId, 'user_id' => $userId]);
        $current = $checkStmt->fetchColumn();
        if ($current === false || $current !== 'saved') {
            return false;
        }
        $stmt = $this->db->prepare("UPDATE orders SET status = :status WHERE id = :id AND user_id = :user_id");
        return $stmt->execute([
            'status' => $status,
            'id' => $orderId,
            'user_id' => $userId
        ]);
    }
    public function adminUpdateOrderStatus(int $orderId, string $status): bool {
        $stmt = $this->db->prepare("UPDATE orders SET status = :status WHERE id = :id");
        return $stmt->execute([
            'status' => $status,
            'id' => $orderId
        ]);
    }

    public function getAllOrdersForAdmin() {
        $sql = "SELECT o.id, o.total_price, o.status, o.created_at, 
                       u.name as user_name, u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC";

        $stmt = $this->db->query($sql);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            $stmtItems = $this->db->prepare("
                SELECT COALESCE(c.name, 'Застарілий товар') as name, c.image_url, oi.price_at_purchase 
                FROM order_items oi
                LEFT JOIN components c ON oi.component_id = c.id
                WHERE oi.order_id = :order_id
            ");
            $stmtItems->execute(['order_id' => $order['id']]);
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
        }

        return $orders;
    }
}
<?php
namespace App\Models;

use App\Core\BaseModel;
use PDO;

class ComponentModel extends BaseModel {

    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM components");
        $components = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($components as &$component) {
            if (!empty($component['specs'])) {
                $component['specs'] = json_decode($component['specs'], true);
            }
        }

        return $components;
    }
    public function createComponent(array $data): bool {
        $sql = "INSERT INTO components (category_id, name, price, power_draw_watts, image_url, specs) 
                VALUES (:category_id, :name, :price, :power_draw_watts, :image_url, :specs)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'price' => $data['price'],
            'power_draw_watts' => $data['power_draw_watts'],
            'image_url' => $data['image_url'],
            'specs' => $data['specs']
        ]);
    }
}
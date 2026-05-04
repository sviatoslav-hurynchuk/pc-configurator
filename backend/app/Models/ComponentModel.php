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
}
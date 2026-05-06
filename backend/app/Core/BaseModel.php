<?php
namespace App\Core;

use PDO;

abstract class BaseModel {
    protected PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
}
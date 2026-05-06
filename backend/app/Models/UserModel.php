<?php
namespace App\Models;

use App\Core\BaseModel;
use PDO;

class UserModel extends BaseModel {

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function create(string $name, string $email, string $password): bool {
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare("INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password_hash)");

        try {
            return $stmt->execute([
                'name' => $name,
                'email' => $email,
                'password_hash' => $hash
            ]);
        } catch (\PDOException $e) {
            return false;
        }
    }
}
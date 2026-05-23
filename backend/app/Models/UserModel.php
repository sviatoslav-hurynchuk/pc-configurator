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
    public function createAuthToken(int $userId, string $series, string $tokenHash, string $expires): bool {
        $stmt = $this->db->prepare("INSERT INTO auth_tokens (user_id, series, token_hash, expires_at) VALUES (:uid, :series, :hash, :expires)");
        return $stmt->execute([
            'uid' => $userId,
            'series' => $series,
            'hash' => $tokenHash,
            'expires' => $expires
        ]);
    }

    public function getAuthTokenBySeries(string $series): ?array {
        $stmt = $this->db->prepare("SELECT * FROM auth_tokens WHERE series = :series LIMIT 1");
        $stmt->execute(['series' => $series]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function updateAuthToken(string $series, string $newTokenHash, string $expires): bool {
        $stmt = $this->db->prepare("UPDATE auth_tokens SET token_hash = :hash, expires_at = :expires WHERE series = :series");
        return $stmt->execute([
            'hash' => $newTokenHash,
            'expires' => $expires,
            'series' => $series
        ]);
    }

    public function deleteAllTokensForUser(int $userId): bool {
        $stmt = $this->db->prepare("DELETE FROM auth_tokens WHERE user_id = :uid");
        return $stmt->execute(['uid' => $userId]);
    }
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function deleteTokenBySeries(string $series): bool {
        $stmt = $this->db->prepare("DELETE FROM auth_tokens WHERE series = :series");
        return $stmt->execute(['series' => $series]);
    }

    public function updateUser(int $id, string $name, string $email, ?string $password): bool {
        if ($password !== null && $password !== '') {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE users SET name = :name, email = :email, password_hash = :password_hash WHERE id = :id");
            return $stmt->execute([
                'name' => $name,
                'email' => $email,
                'password_hash' => $hash,
                'id' => $id
            ]);
        } else {
            $stmt = $this->db->prepare("UPDATE users SET name = :name, email = :email WHERE id = :id");
            return $stmt->execute([
                'name' => $name,
                'email' => $email,
                'id' => $id
            ]);
        }
    }

    public function deleteUser(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
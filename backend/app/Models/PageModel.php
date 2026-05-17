<?php
namespace App\Models;

use App\Core\BaseModel;
use PDO;

class PageModel extends BaseModel {

    /**
     * Get all pages for admin panel.
     */
    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM pages ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get only published pages.
     */
    public function getPublished(): array {
        $stmt = $this->db->query("SELECT * FROM pages WHERE is_published = 1 ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find a page by its slug.
     */
    public function findBySlug(string $slug): ?array {
        $stmt = $this->db->prepare("SELECT * FROM pages WHERE slug = :slug LIMIT 1");
        $stmt->execute(['slug' => $slug]);
        $page = $stmt->fetch(PDO::FETCH_ASSOC);
        return $page ?: null;
    }

    /**
     * Create a new page.
     */
    public function createPage(array $data): bool {
        $sql = "INSERT INTO pages (title, content, slug, is_published) 
                VALUES (:title, :content, :slug, :is_published)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'title'        => $data['title'],
            'content'      => $data['content'],
            'slug'         => $data['slug'],
            'is_published' => isset($data['is_published']) ? (int)$data['is_published'] : 1
        ]);
    }

    /**
     * Update an existing page.
     */
    public function updatePage(int $id, array $data): bool {
        $sql = "UPDATE pages 
                SET title = :title, content = :content, slug = :slug, is_published = :is_published 
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'           => $id,
            'title'        => $data['title'],
            'content'      => $data['content'],
            'slug'         => $data['slug'],
            'is_published' => isset($data['is_published']) ? (int)$data['is_published'] : 1
        ]);
    }

    /**
     * Delete page by ID.
     */
    public function deletePage(int $id): bool {
        $sql = "DELETE FROM pages WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}

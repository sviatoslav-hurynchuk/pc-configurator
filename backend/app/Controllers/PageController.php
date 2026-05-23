<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\PageModel;

class PageController extends BaseController {

    private PageModel $pageModel;

    public function __construct() {
        $this->pageModel = new PageModel();
    }

    public function index(): void {
        $pages = $this->pageModel->getPublished();
        $this->jsonResponse([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    public function show(string $slug): void {
        $page = $this->pageModel->findBySlug($slug);

        if (!$page) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Сторінку не знайдено'], 404);
            return;
        }

        // Check if draft access is requested by non-admin
        if (!$page['is_published']) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
                $this->jsonResponse(['status' => 'error', 'message' => 'Доступ обмежено. Сторінка знаходиться у чернетках.'], 403);
                return;
            }
        }

        $this->jsonResponse([
            'status' => 'success',
            'data' => $page
        ]);
    }

    public function adminIndex(): void {
        $this->requireAdmin();

        $pages = $this->pageModel->getAll();
        $this->jsonResponse([
            'status' => 'success',
            'data' => $pages
        ]);
    }

    public function store(): void {
        $this->requireAdmin();

        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (!$data || empty($data['title']) || empty($data['slug']) || empty($data['content'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Не всі обов\'язкові поля заповнені'], 400);
            return;
        }

        // Validate unique slug
        if ($this->pageModel->findBySlug($data['slug'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Сторінка з таким посиланням (slug) вже існує'], 400);
            return;
        }

        if ($this->pageModel->createPage($data)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Сторінку успішно створено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка бази даних при збереженні'], 500);
        }
    }

    public function update(string $id): void {
        $this->requireAdmin();

        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (!$data || empty($data['title']) || empty($data['slug']) || empty($data['content'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Не всі обов\'язкові поля заповнені'], 400);
            return;
        }

        // Validate unique slug excluding current page
        $existing = $this->pageModel->findBySlug($data['slug']);
        if ($existing && $existing['id'] !== (int)$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Сторінка з таким посиланням (slug) вже існує'], 400);
            return;
        }

        if ($this->pageModel->updatePage((int)$id, $data)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Сторінку успішно оновлено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка бази даних при оновленні'], 500);
        }
    }

    public function delete(string $id): void {
        $this->requireAdmin();

        if ($this->pageModel->deletePage((int)$id)) {
            $this->jsonResponse(['status' => 'success', 'message' => 'Сторінку успішно видалено']);
        } else {
            $this->jsonResponse(['status' => 'error', 'message' => 'Помилка бази даних при видаленні'], 500);
        }
    }
}

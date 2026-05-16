<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\ComponentModel;

class ComponentController extends BaseController {

    public function index(): void {
        $model = new ComponentModel();
        $components = $model->getAll();

        $this->jsonResponse([
            'status' => 'success',
            'data' => $components
        ]);
    }
    public function storeComponent() {
        $this->requireAdmin();


        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (!$data || empty($data['name']) || empty($data['category_id']) || empty($data['price'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Не всі обов\'язкові поля заповнені']);
            return;
        }

        $componentModel = new ComponentModel();

        $isCreated = $componentModel->createComponent($data);

        if ($isCreated) {
            echo json_encode(['status' => 'success', 'message' => 'Деталь успішно додано']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка бази даних при збереженні']);
        }
    }

    public function updateComponent($id) {
        $this->requireAdmin();


        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (!$data || empty($data['name']) || empty($data['category_id']) || empty($data['price'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Не всі обов\'язкові поля заповнені']);
            return;
        }

        $componentModel = new ComponentModel();
        $isUpdated = $componentModel->updateComponent((int)$id, $data);

        if ($isUpdated) {
            echo json_encode(['status' => 'success', 'message' => 'Деталь успішно оновлено']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка бази даних при оновленні']);
        }
    }

    public function uploadImage(): void {
        $this->requireAdmin();

        if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Файл не отримано або виникла помилка завантаження'], 400);
            return;
        }

        $file = $_FILES['image'];

        $allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $imageInfo = @getimagesize($file['tmp_name']);

        if ($imageInfo === false || !in_array($imageInfo['mime'], $allowedMime)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Дозволені тільки зображення: JPG, PNG, WEBP, GIF'], 422);
            return;
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Файл завеликий. Максимум 5MB'], 422);
            return;
        }

        $uploadDir = __DIR__ . '/../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $uniqueName = uniqid('img_', true) . '.' . strtolower($extension);
        $destination = $uploadDir . $uniqueName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Не вдалося зберегти файл на сервері'], 500);
            return;
        }

        $url = '/public/uploads/' . $uniqueName;
        $this->jsonResponse(['status' => 'success', 'url' => $url]);
    }

    public function deleteComponent($id) {
        $this->requireAdmin();


        $componentModel = new ComponentModel();
        $isDeleted = $componentModel->deleteComponent((int)$id);

        if ($isDeleted) {
            echo json_encode(['status' => 'success', 'message' => 'Деталь успішно видалено']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка бази даних при видаленні']);
        }
    }
}
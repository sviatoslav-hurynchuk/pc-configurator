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
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Доступ заборонено']);
            return;
        }

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
}
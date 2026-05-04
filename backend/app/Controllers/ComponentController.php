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
}
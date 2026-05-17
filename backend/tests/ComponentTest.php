<?php
use PHPUnit\Framework\TestCase;
use App\Models\ComponentModel;

class ComponentTest extends TestCase {

    /**
     * Перевіряє, що getAll() повертає масив і кожен елемент
     * має обов'язкові поля: id, name, price, category_id.
     */
    public function testGetAllReturnsValidStructure() {
        $model = new ComponentModel();
        $components = $model->getAll();

        $this->assertIsArray($components, "getAll() має повертати масив");
        $this->assertNotEmpty($components, "Каталог не має бути порожнім (seed-дані мають бути завантажені)");

        $first = $components[0];
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('name', $first);
        $this->assertArrayHasKey('price', $first);
        $this->assertArrayHasKey('category_id', $first);
    }

    /**
     * Перевіряє повний CRUD-цикл компонента:
     * createComponent → getAll (знайти) → updateComponent → deleteComponent.
     */
    public function testCreateUpdateDeleteComponent() {
        $model = new ComponentModel();

        // --- CREATE ---
        $uniqueName = 'Test Component ' . time();
        $data = [
            'category_id'      => 1,
            'name'             => $uniqueName,
            'price'            => 9999.99,
            'power_draw_watts' => 65,
            'image_url'        => 'https://example.com/test.jpg',
            'specs'            => json_encode(['socket' => 'AM5', 'cores' => 8])
        ];

        $created = $model->createComponent($data);
        $this->assertTrue($created, "createComponent() має повертати true при успіху");

        // Знаходимо щойно створений компонент за унікальним іменем
        $all = $model->getAll();
        $found = array_filter($all, fn($c) => $c['name'] === $uniqueName);
        $this->assertCount(1, $found, "Новий компонент має з'явитися в getAll()");

        $component = array_values($found)[0];
        $id = $component['id'];
        $this->assertEquals(9999.99, $component['price'], "Ціна збереженого компонента має збігатися");

        // --- UPDATE ---
        $updatedData = [
            'category_id'      => 1,
            'name'             => $uniqueName . ' (updated)',
            'price'            => 8888.00,
            'power_draw_watts' => 45,
            'image_url'        => 'https://example.com/updated.jpg',
            'specs'            => json_encode(['socket' => 'AM5', 'cores' => 6])
        ];

        $updated = $model->updateComponent($id, $updatedData);
        $this->assertTrue($updated, "updateComponent() має повертати true при успіху");

        // Перевіряємо, що дані оновились
        $afterUpdate = $model->getAll();
        $updatedFound = array_filter($afterUpdate, fn($c) => $c['id'] === $id);
        $this->assertCount(1, $updatedFound);
        $updatedComponent = array_values($updatedFound)[0];
        $this->assertEquals($uniqueName . ' (updated)', $updatedComponent['name'], "Назва має оновитися");
        $this->assertEquals(8888.00, $updatedComponent['price'], "Ціна має оновитися");

        // --- DELETE ---
        $deleted = $model->deleteComponent($id);
        $this->assertTrue($deleted, "deleteComponent() має повертати true при успіху");

        // Переконуємося, що компонент зник з каталогу
        $afterDelete = $model->getAll();
        $stillExists = array_filter($afterDelete, fn($c) => $c['id'] === $id);
        $this->assertCount(0, $stillExists, "Видалений компонент не має з'являтися в getAll()");
    }

    /**
     * Перевіряє, що specs зберігаються як JSON і повертаються як масив.
     * getAll() декодує specs_json автоматично.
     */
    public function testSpecsAreDecodedAsArray() {
        $model = new ComponentModel();

        $specsArray = ['socket' => 'LGA1700', 'cores' => 14, 'threads' => 20];
        $data = [
            'category_id'      => 1,
            'name'             => 'Specs Test Component ' . time(),
            'price'            => 100.00,
            'power_draw_watts' => 10,
            'image_url'        => '',
            'specs'            => json_encode($specsArray)
        ];

        $model->createComponent($data);

        $all = $model->getAll();
        $found = array_filter($all, fn($c) => $c['name'] === $data['name']);
        $this->assertNotEmpty($found, "Компонент має бути знайдений");

        $component = array_values($found)[0];

        // specs має бути масивом (getAll() декодує JSON)
        $this->assertIsArray($component['specs'], "specs мають бути декодовані як масив в getAll()");
        $this->assertEquals('LGA1700', $component['specs']['socket']);
        $this->assertEquals(14, $component['specs']['cores']);

        // Cleanup
        $model->deleteComponent($component['id']);
    }
}

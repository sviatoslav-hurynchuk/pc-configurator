<?php
use PHPUnit\Framework\TestCase;
use App\Models\ComponentModel;

class ComponentTest extends TestCase {

    public function testGetAllReturnsValidStructure() {
        $model = new ComponentModel();
        $components = $model->getAll();

        $this->assertIsArray($components);
        $this->assertNotEmpty($components);

        $first = $components[0];
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('name', $first);
        $this->assertArrayHasKey('price', $first);
        $this->assertArrayHasKey('category_id', $first);
    }

    public function testCreateUpdateDeleteComponent() {
        $model = new ComponentModel();

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
        $this->assertTrue($created);

        $all = $model->getAll();
        $found = array_filter($all, fn($c) => $c['name'] === $uniqueName);
        $this->assertCount(1, $found);

        $component = array_values($found)[0];
        $id = $component['id'];
        $this->assertEquals(9999.99, $component['price']);

        $updatedData = [
            'category_id'      => 1,
            'name'             => $uniqueName . ' (updated)',
            'price'            => 8888.00,
            'power_draw_watts' => 45,
            'image_url'        => 'https://example.com/updated.jpg',
            'specs'            => json_encode(['socket' => 'AM5', 'cores' => 6])
        ];

        $updated = $model->updateComponent($id, $updatedData);
        $this->assertTrue($updated);

        $afterUpdate = $model->getAll();
        $updatedFound = array_filter($afterUpdate, fn($c) => $c['id'] === $id);
        $this->assertCount(1, $updatedFound);
        $updatedComponent = array_values($updatedFound)[0];
        $this->assertEquals($uniqueName . ' (updated)', $updatedComponent['name']);
        $this->assertEquals(8888.00, $updatedComponent['price']);

        $deleted = $model->deleteComponent($id);
        $this->assertTrue($deleted);

        $afterDelete = $model->getAll();
        $stillExists = array_filter($afterDelete, fn($c) => $c['id'] === $id);
        $this->assertCount(0, $stillExists);
    }

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
        $this->assertNotEmpty($found);

        $component = array_values($found)[0];

        $this->assertIsArray($component['specs']);
        $this->assertEquals('LGA1700', $component['specs']['socket']);
        $this->assertEquals(14, $component['specs']['cores']);

        $model->deleteComponent($component['id']);
    }
}

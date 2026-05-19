<?php
use PHPUnit\Framework\TestCase;
use App\Models\PageModel;

class PageTest extends TestCase {

    public function testGetAllPages() {
        $model = new PageModel();
        $pages = $model->getAll();

        $this->assertIsArray($pages);
        $this->assertNotEmpty($pages, "Seed pages must be loaded");

        $first = $pages[0];
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('title', $first);
        $this->assertArrayHasKey('content', $first);
        $this->assertArrayHasKey('slug', $first);
        $this->assertArrayHasKey('is_published', $first);
    }

    public function testCreateUpdateDeletePage() {
        $model = new PageModel();

        $uniqueSlug = 'test-slug-' . time();
        $data = [
            'title'        => 'Test Title',
            'content'      => 'Test content details.',
            'slug'         => $uniqueSlug,
            'is_published' => 1
        ];

        $created = $model->createPage($data);
        $this->assertTrue($created, "createPage() should return true");

        $page = $model->findBySlug($uniqueSlug);
        $this->assertNotNull($page, "Page must be found by unique slug");
        $this->assertEquals('Test Title', $page['title']);
        $this->assertEquals(1, $page['is_published']);

        $id = $page['id'];

        $updatedData = [
            'title'        => 'Updated Title',
            'content'      => 'Updated content.',
            'slug'         => $uniqueSlug . '-updated',
            'is_published' => 0
        ];

        $updated = $model->updatePage($id, $updatedData);
        $this->assertTrue($updated, "updatePage() should return true");

        $updatedPage = $model->findBySlug($uniqueSlug . '-updated');
        $this->assertNotNull($updatedPage);
        $this->assertEquals('Updated Title', $updatedPage['title']);
        $this->assertEquals(0, $updatedPage['is_published']);

        $oldSearch = $model->findBySlug($uniqueSlug);
        $this->assertNull($oldSearch);

        $deleted = $model->deletePage($id);
        $this->assertTrue($deleted, "deletePage() should return true");

        $afterDelete = $model->findBySlug($uniqueSlug . '-updated');
        $this->assertNull($afterDelete, "Deleted page should not exist");
    }
}

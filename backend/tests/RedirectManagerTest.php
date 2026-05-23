<?php
use PHPUnit\Framework\TestCase;
use App\Core\RedirectManager;

class RedirectManagerTest extends TestCase {
    private string $testJsonFile;

    protected function setUp(): void {
        parent::setUp();
        $this->testJsonFile = __DIR__ . '/test_redirects.json';
        $data = [
            "/old-route" => [
                "destination" => "/new-route",
                "status" => 301
            ],
            "/not-found-route" => [
                "destination" => null,
                "status" => 404
            ]
        ];
        file_put_contents($this->testJsonFile, json_encode($data));
    }

    protected function tearDown(): void {
        if (file_exists($this->testJsonFile)) {
            unlink($this->testJsonFile);
        }
        parent::tearDown();
    }

    public function testGetRedirectReturnsCorrectRule() {
        $manager = new RedirectManager($this->testJsonFile);

        $rule301 = $manager->getRedirect('/old-route');
        $this->assertNotNull($rule301);
        $this->assertEquals('/new-route', $rule301['destination']);
        $this->assertEquals(301, $rule301['status']);

        $rule404 = $manager->getRedirect('/not-found-route');
        $this->assertNotNull($rule404);
        $this->assertNull($rule404['destination']);
        $this->assertEquals(404, $rule404['status']);
    }

    public function testGetRedirectReturnsNullForUnknownRoute() {
        $manager = new RedirectManager($this->testJsonFile);
        $rule = $manager->getRedirect('/some-unknown-route');
        $this->assertNull($rule);
    }
}

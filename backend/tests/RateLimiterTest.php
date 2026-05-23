<?php
use PHPUnit\Framework\TestCase;
use App\Core\RateLimiter;

class RateLimiterTest extends TestCase {
    private string $testLogFile;

    protected function setUp(): void {
        parent::setUp();
        $this->testLogFile = __DIR__ . '/test_requests.log';
        if (file_exists($this->testLogFile)) {
            unlink($this->testLogFile);
        }
    }

    protected function tearDown(): void {
        if (file_exists($this->testLogFile)) {
            unlink($this->testLogFile);
        }
        parent::tearDown();
    }

    public function testRateLimiterAllowsWithinLimit() {
        $limiter = new RateLimiter($this->testLogFile, 3, 10);
        $ip = '192.168.1.100';

        $this->assertTrue($limiter->check($ip));
        $this->assertTrue($limiter->check($ip));
        $this->assertTrue($limiter->check($ip));
    }

    public function testRateLimiterBlocksOverLimit() {
        $limiter = new RateLimiter($this->testLogFile, 2, 10);
        $ip = '192.168.1.200';

        $this->assertTrue($limiter->check($ip));
        $this->assertTrue($limiter->check($ip));
        $this->assertFalse($limiter->check($ip));
    }

    public function testRateLimiterCleansUpObsoleteEntries() {
        $limiter = new RateLimiter($this->testLogFile, 2, 1);
        $ip = '192.168.1.50';

        $this->assertTrue($limiter->check($ip));
        $this->assertTrue($limiter->check($ip));
        
        usleep(2100000);

        $this->assertTrue($limiter->check($ip));
    }
}

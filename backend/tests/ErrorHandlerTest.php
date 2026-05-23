<?php
use PHPUnit\Framework\TestCase;
use App\Core\ErrorHandler;

class ErrorHandlerTest extends TestCase {
    public function testRegisterDoesNotThrowException() {
        $this->expectNotToPerformAssertions();
        ErrorHandler::register();
    }
}

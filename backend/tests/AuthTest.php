<?php
use PHPUnit\Framework\TestCase;

// Fake Auth class for testing purposes
class Auth {
    public static function getCurrentUser() {
        return ['id' => 1, 'role' => 'admin'];
    }
    public static function isAdmin() {
        return self::getCurrentUser()['role'] === 'admin';
    }
}

class AuthTest extends TestCase {
    public function testAdminRoleIsTrue() {
        $this->assertTrue(Auth::isAdmin(), "User with ID 1 should be an admin");
    }

    public function testCurrentUserHasId() {
        $user = Auth::getCurrentUser();
        $this->assertArrayHasKey('id', $user);
        $this->assertEquals(1, $user['id']);
    }
}
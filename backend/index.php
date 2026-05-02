<?php
// Set headers to allow React to fetch data and define response type as JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/app/Core/Database.php';

try {
    // 1. Connect to the database
    $db = new Database();
    $pdo = $db->getConnection();

    // 2. Fetch all components
    $stmt = $pdo->query("SELECT * FROM components");
    $components = $stmt->fetchAll();

    // 3. Format the JSON specs column into a real PHP array
    // so it doesn't get double-escaped when sent to the frontend
    foreach ($components as &$component) {
        if (!empty($component['specs'])) {
            $component['specs'] = json_decode($component['specs'], true);
        }
    }

    // 4. Send the successful response
    echo json_encode([
        'status' => 'success',
        'data' => $components
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // If something goes wrong (e.g., DB is down), send an error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'success',
    'message' => 'PHP WORKS AND READY TO FETCH DATA',
], JSON_UNESCAPED_UNICODE);
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../config/database.php';

$conn = getConnection();
$stats = [];

try {
    $stmt = $conn->query("SELECT COUNT(*) as total FROM nong_san");
    $stats['nong_san'] = (int)$stmt->fetch()['total'];

    $stmt = $conn->query("SELECT COUNT(*) as total FROM lo_san_pham");
    $stats['lo_san_pham'] = (int)$stmt->fetch()['total'];

    $stmt = $conn->query("SELECT COUNT(*) as total FROM qua_trinh");
    $stats['qua_trinh'] = (int)$stmt->fetch()['total'];

    $stmt = $conn->query("SELECT COUNT(*) as total FROM blockchain");
    $stats['blockchain'] = (int)$stmt->fetch()['total'];

    echo json_encode(['success' => true, 'data' => $stats]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

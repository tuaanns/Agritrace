<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../config/database.php';

$code = $_GET['code'] ?? '';

if (!$code) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng cung cấp mã truy xuất.']);
    exit;
}

$conn = getConnection();

try {
    // 1. Get Batch Info
    $stmt = $conn->prepare("
        SELECT l.*, n.ten_nong_san, n.hinh_anh, n.mo_ta as mo_ta_nong_san
        FROM lo_san_pham l
        JOIN nong_san n ON l.nong_san_id = n.id
        WHERE l.ma_truy_xuat = ?
    ");
    $stmt->execute([$code]);
    $batch = $stmt->fetch();

    if (!$batch) {
        echo json_encode(['success' => false, 'message' => 'Mã truy xuất không tồn tại hoặc đã bị xóa.']);
        exit;
    }

    // 2. Get Processes
    $stmt = $conn->prepare("SELECT * FROM qua_trinh WHERE lo_san_pham_id = ? ORDER BY ngay_thuc_hien ASC");
    $stmt->execute([$batch['id']]);
    $processes = $stmt->fetchAll();

    // 3. Get Blockchain Verification
    $stmt = $conn->prepare("SELECT * FROM blockchain WHERE lo_san_pham_id = ?");
    $stmt->execute([$batch['id']]);
    $verification = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'data' => [
            'batch' => $batch,
            'processes' => $processes,
            'verification' => $verification
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

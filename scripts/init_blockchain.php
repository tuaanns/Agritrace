<?php
/**
 * Script khởi tạo Blockchain cho dữ liệu mẫu (Seed Data)
 * Chạy file này 1 lần duy nhất sau khi import database
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/blockchain.php';

$conn = getConnection();
$blockchain = new BlockchainSimulator();

echo "<h2>Đang khởi tạo chuỗi Blockchain cho dữ liệu mẫu...</h2>";

// 1. Lấy tất cả các lô sản phẩm
$stmt = $conn->query("SELECT lsp.*, ns.ten_nong_san, nd.ho_ten as nguoi_tao 
                       FROM lo_san_pham lsp 
                       JOIN nong_san ns ON lsp.nong_san_id = ns.id
                       JOIN nguoi_dung nd ON lsp.nguoi_tao_id = nd.id
                       ORDER BY lsp.id ASC");
$batches = $stmt->fetchAll();

foreach ($batches as $batch) {
    // Kiểm tra xem lô này đã có block nào chưa
    $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM blockchain WHERE lo_san_pham_id = ?");
    $stmtCheck->execute([$batch['id']]);
    if ($stmtCheck->fetchColumn() > 0) {
        echo "Lô {$batch['ma_lo']} đã có blockchain. Bỏ qua.<br>";
        continue;
    }

    echo "Đang tạo Genesis Block cho lô: <strong>{$batch['ma_lo']}</strong>... ";
    
    // Tạo Block khởi tạo (Genesis)
    $genesisData = [
        'event' => 'Tạo lô sản phẩm',
        'ma_lo' => $batch['ma_lo'],
        'ma_truy_xuat' => $batch['ma_truy_xuat'],
        'nong_san' => $batch['ten_nong_san'],
        'noi_san_xuat' => $batch['noi_san_xuat'],
        'nguoi_tao' => $batch['nguoi_tao'],
        'timestamp' => $batch['ngay_tao']
    ];
    $blockchain->addBlock($batch['id'], $genesisData);
    echo "Xong!<br>";

    // 2. Lấy các quá trình của lô này
    $stmtProc = $conn->prepare("SELECT qt.*, nd.ho_ten as nguoi_ghi_nhan 
                                 FROM qua_trinh qt 
                                 JOIN nguoi_dung nd ON qt.nguoi_tao_id = nd.id
                                 WHERE qt.lo_san_pham_id = ? 
                                 ORDER BY qt.ngay_thuc_hien ASC");
    $stmtProc->execute([$batch['id']]);
    $processes = $stmtProc->fetchAll();

    $stages = [
        'gieo_trong' => 'Gieo trồng', 'cham_soc' => 'Chăm sóc',
        'thu_hoach' => 'Thu hoạch', 'dong_goi' => 'Đóng gói',
        'van_chuyen' => 'Vận chuyển', 'phan_phoi' => 'Phân phối'
    ];

    foreach ($processes as $proc) {
        echo "-> Thêm block giai đoạn: " . ($stages[$proc['giai_doan']] ?? $proc['giai_doan']) . "... ";
        $blockData = [
            'event' => 'Ghi nhận quá trình: ' . ($stages[$proc['giai_doan']] ?? $proc['giai_doan']),
            'giai_doan' => $proc['giai_doan'],
            'mo_ta' => $proc['mo_ta'],
            'dia_diem' => $proc['dia_diem'],
            'nguoi_thuc_hien' => $proc['nguoi_thuc_hien'],
            'ngay_thuc_hien' => $proc['ngay_thuc_hien'],
            'nguoi_ghi_nhan' => $proc['nguoi_ghi_nhan']
        ];
        $blockchain->addBlock($batch['id'], $blockData);
        echo "Xong!<br>";
    }
    echo "<hr>";
}

echo "<h3>Hoàn tất khởi tạo Blockchain!</h3>";
echo "<a href='../index.php'>Quay về trang chủ</a>";

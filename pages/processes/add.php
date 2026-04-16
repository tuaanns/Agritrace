<?php
/**
 * Ghi nhận quá trình sản xuất mới
 */
$pageTitle = 'Ghi nhận quá trình';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/blockchain.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$userId = $_SESSION['user_id'];
$errors = [];
$old = [];

// Lấy lô sản phẩm đã chọn (nếu có)
$preselectedLoId = intval($_GET['lo_id'] ?? 0);

// Lấy danh sách lô sản phẩm
if (getUserRole() === 'admin') {
    $stmt = $conn->query(
        "SELECT lsp.*, ns.ten_nong_san FROM lo_san_pham lsp 
         JOIN nong_san ns ON lsp.nong_san_id = ns.id ORDER BY lsp.ngay_tao DESC"
    );
} else {
    $stmt = $conn->prepare(
        "SELECT lsp.*, ns.ten_nong_san FROM lo_san_pham lsp 
         JOIN nong_san ns ON lsp.nong_san_id = ns.id 
         WHERE lsp.nguoi_tao_id = ? ORDER BY lsp.ngay_tao DESC"
    );
    $stmt->execute([$userId]);
}
$batches = $stmt->fetchAll();

// Danh sách giai đoạn
$stages = [
    'gieo_trong' => 'Gieo trồng',
    'cham_soc' => 'Chăm sóc',
    'thu_hoach' => 'Thu hoạch',
    'dong_goi' => 'Đóng gói',
    'van_chuyen' => 'Vận chuyển',
    'phan_phoi' => 'Phân phối'
];

// Trạng thái tương ứng vớigiai đoạn
$stageStatus = [
    'gieo_trong' => 'Đang sản xuất',
    'cham_soc' => 'Đang sản xuất',
    'thu_hoach' => 'Đã thu hoạch',
    'dong_goi' => 'Đã đóng gói',
    'van_chuyen' => 'Đang vận chuyển',
    'phan_phoi' => 'Đã phân phối'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old = $_POST;
    $loSanPhamId = intval($_POST['lo_san_pham_id'] ?? 0);
    $giaiDoan = trim($_POST['giai_doan'] ?? '');
    $moTa = trim($_POST['mo_ta'] ?? '');
    $diaDiem = trim($_POST['dia_diem'] ?? '');
    $nguoiThucHien = trim($_POST['nguoi_thuc_hien'] ?? '');
    $ngayThucHien = $_POST['ngay_thuc_hien'] ?? '';
    $ghiChu = trim($_POST['ghi_chu'] ?? '');

    // Validation
    if (!$loSanPhamId) $errors[] = 'Vui lòng chọn lô sản phẩm';
    if (empty($giaiDoan) || !isset($stages[$giaiDoan])) $errors[] = 'Vui lòng chọn giai đoạn hợp lệ';
    if (empty($moTa)) $errors[] = 'Mô tả không được để trống';
    if (empty($diaDiem)) $errors[] = 'Địa điểm không được để trống';
    if (empty($nguoiThucHien)) $errors[] = 'Người thực hiện không được để trống';
    if (empty($ngayThucHien)) $errors[] = 'Ngày thực hiện không được để trống';

    if (empty($errors)) {
        // Lưu quá trình
        $stmt = $conn->prepare(
            "INSERT INTO qua_trinh (lo_san_pham_id, giai_doan, mo_ta, dia_diem, nguoi_thuc_hien, ngay_thuc_hien, ghi_chu, nguoi_tao_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$loSanPhamId, $giaiDoan, $moTa, $diaDiem, $nguoiThucHien, $ngayThucHien, $ghiChu, $userId]);

        // Cập nhật trạng thái lô
        $newStatus = $stageStatus[$giaiDoan] ?? $batch['trang_thai'];
        $stmt = $conn->prepare("UPDATE lo_san_pham SET trang_thai = ? WHERE id = ?");
        $stmt->execute([$newStatus, $loSanPhamId]);

        // Thêm block vào blockchain
        $blockchain = new BlockchainSimulator();
        $blockData = [
            'event' => 'Ghi nhận quá trình: ' . $stages[$giaiDoan],
            'giai_doan' => $giaiDoan,
            'mo_ta' => $moTa,
            'dia_diem' => $diaDiem,
            'nguoi_thuc_hien' => $nguoiThucHien,
            'ngay_thuc_hien' => $ngayThucHien,
            'ghi_chu' => $ghiChu,
            'nguoi_ghi_nhan' => $_SESSION['ho_ten'],
            'timestamp' => date('Y-m-d H:i:s')
        ];
        $blockchain->addBlock($loSanPhamId, $blockData);

        setFlash('success', 'Ghi nhận quá trình "' . $stages[$giaiDoan] . '" thành công! Block mới đã được thêm vào blockchain.');
        redirect('/pages/batches/detail.php?id=' . $loSanPhamId);
    }
}

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="content-page">
    <div class="container" style="max-width: 750px;">
        <div class="page-header">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/processes/list.php">Quá trình</a></li>
                    <li class="breadcrumb-item active">Ghi nhận mới</li>
                </ol>
            </nav>
            <h2><i class="bi bi-plus-circle me-2"></i>Ghi nhận quá trình</h2>
            <p>Mỗi ghi nhận sẽ tạo một block mới trên blockchain</p>
        </div>

        <div class="data-card">
            <div class="data-card-body">
                <?php if (!empty($errors)): ?>
                <div class="alert alert-danger">
                    <ul class="mb-0 ps-3">
                        <?php foreach ($errors as $err): ?>
                        <li><?= e($err) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <?php endif; ?>

                <div class="alert alert-success d-flex align-items-start">
                    <i class="bi bi-link-45deg me-2 fs-5"></i>
                    <div>
                        <strong>Blockchain:</strong> Mỗi quá trình ghi nhận sẽ tự động tạo một block mới với hash SHA-256, 
                        đảm bảo dữ liệu không thể bị thay đổi.
                    </div>
                </div>

                <form method="POST" class="needs-validation" novalidate>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="lo_san_pham_id" class="form-label">Lô sản phẩm *</label>
                            <select class="form-select" id="lo_san_pham_id" name="lo_san_pham_id" required>
                                <option value="">-- Chọn lô sản phẩm --</option>
                                <?php foreach ($batches as $b): ?>
                                <option value="<?= $b['id'] ?>" <?= ($old['lo_san_pham_id'] ?? $preselectedLoId) == $b['id'] ? 'selected' : '' ?>>
                                    <?= e($b['ma_lo']) ?> - <?= e($b['ten_nong_san']) ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="invalid-feedback">Vui lòng chọn lô sản phẩm</div>
                        </div>
                        <div class="col-md-6">
                            <label for="giai_doan" class="form-label">Giai đoạn *</label>
                            <select class="form-select" id="giai_doan" name="giai_doan" required>
                                <option value="">-- Chọn giai đoạn --</option>
                                <?php foreach ($stages as $key => $label): ?>
                                <option value="<?= $key ?>" <?= ($old['giai_doan'] ?? '') === $key ? 'selected' : '' ?>>
                                    <?= $label ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="invalid-feedback">Vui lòng chọn giai đoạn</div>
                        </div>
                        <div class="col-12">
                            <label for="mo_ta" class="form-label">Mô tả chi tiết *</label>
                            <textarea class="form-control" id="mo_ta" name="mo_ta" rows="3" required
                                      placeholder="Mô tả chi tiết công việc đã thực hiện..."><?= e($old['mo_ta'] ?? '') ?></textarea>
                            <div class="invalid-feedback">Vui lòng nhập mô tả</div>
                        </div>
                        <div class="col-md-6">
                            <label for="dia_diem" class="form-label">Địa điểm *</label>
                            <input type="text" class="form-control" id="dia_diem" name="dia_diem" 
                                   value="<?= e($old['dia_diem'] ?? '') ?>" required placeholder="Nơi thực hiện">
                            <div class="invalid-feedback">Vui lòng nhập địa điểm</div>
                        </div>
                        <div class="col-md-6">
                            <label for="nguoi_thuc_hien" class="form-label">Người thực hiện *</label>
                            <input type="text" class="form-control" id="nguoi_thuc_hien" name="nguoi_thuc_hien" 
                                   value="<?= e($old['nguoi_thuc_hien'] ?? $_SESSION['ho_ten']) ?>" required>
                            <div class="invalid-feedback">Vui lòng nhập người thực hiện</div>
                        </div>
                        <div class="col-md-6">
                            <label for="ngay_thuc_hien" class="form-label">Ngày thực hiện *</label>
                            <input type="datetime-local" class="form-control" id="ngay_thuc_hien" name="ngay_thuc_hien" 
                                   value="<?= e($old['ngay_thuc_hien'] ?? date('Y-m-d\TH:i')) ?>" required>
                            <div class="invalid-feedback">Vui lòng chọn ngày thực hiện</div>
                        </div>
                        <div class="col-md-6">
                            <label for="ghi_chu" class="form-label">Ghi chú</label>
                            <input type="text" class="form-control" id="ghi_chu" name="ghi_chu" 
                                   value="<?= e($old['ghi_chu'] ?? '') ?>" placeholder="Ghi chú thêm (tùy chọn)">
                        </div>
                        <div class="col-12">
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-lg me-1"></i>Ghi nhận & Tạo Block
                                </button>
                                <a href="<?= BASE_URL ?>/pages/dashboard.php" class="btn btn-outline-secondary">Hủy</a>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>

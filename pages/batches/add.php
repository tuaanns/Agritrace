<?php
/**
 * Tạo lô sản phẩm mới
 */
$pageTitle = 'Tạo lô sản phẩm';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/blockchain.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$userId = $_SESSION['user_id'];
$errors = [];
$old = [];

// Lấy danh sách nông sản
if (getUserRole() === 'admin') {
    $stmt = $conn->query("SELECT * FROM nong_san ORDER BY ten_nong_san");
} else {
    $stmt = $conn->prepare("SELECT * FROM nong_san WHERE nguoi_tao_id = ? ORDER BY ten_nong_san");
    $stmt->execute([$userId]);
}
$products = $stmt->fetchAll();

// Tạo mã lô tự động
$today = date('Ymd');
$stmt = $conn->prepare("SELECT COUNT(*) as cnt FROM lo_san_pham WHERE ma_lo LIKE ?");
$stmt->execute(["LO-$today%"]);
$count = $stmt->fetch()['cnt'] + 1;
$autoMaLo = "LO-$today-" . str_pad($count, 3, '0', STR_PAD_LEFT);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old = $_POST;
    $nongSanId = intval($_POST['nong_san_id'] ?? 0);
    $noiSanXuat = trim($_POST['noi_san_xuat'] ?? '');
    $ngayGieoTrong = $_POST['ngay_gieo_trong'] ?? '';
    $ngayThuHoach = $_POST['ngay_thu_hoach'] ?? '';
    $soLuong = floatval($_POST['so_luong'] ?? 0);
    $donVi = trim($_POST['don_vi'] ?? 'kg');

    // Validation
    if (!$nongSanId) $errors[] = 'Vui lòng chọn nông sản';
    if (empty($noiSanXuat)) $errors[] = 'Nơi sản xuất không được để trống';
    if (empty($ngayGieoTrong)) $errors[] = 'Ngày gieo trồng không được để trống';
    if (!empty($ngayThuHoach) && $ngayThuHoach < $ngayGieoTrong) {
        $errors[] = 'Ngày thu hoạch phải sau ngày gieo trồng';
    }

    if (empty($errors)) {
        $maLo = $autoMaLo;
        // Tạo mã truy xuất duy nhất
        $stmt = $conn->prepare("SELECT ten_nong_san FROM nong_san WHERE id = ?");
        $stmt->execute([$nongSanId]);
        $product = $stmt->fetch();
        
        // Tạo mã truy xuất từ tên nông sản + ngày + random
        $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', 
            iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $product['ten_nong_san'])), 0, 4));
        if (empty($prefix)) $prefix = 'NS';
        $maTruyXuat = "TX-$prefix-$today-" . str_pad($count, 3, '0', STR_PAD_LEFT);

        $stmt = $conn->prepare(
            "INSERT INTO lo_san_pham (ma_lo, ma_truy_xuat, nong_san_id, noi_san_xuat, ngay_gieo_trong, ngay_thu_hoach, so_luong, don_vi, nguoi_tao_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $maLo, $maTruyXuat, $nongSanId, $noiSanXuat,
            $ngayGieoTrong, $ngayThuHoach ?: null, $soLuong ?: null, $donVi, $userId
        ]);
        $loId = $conn->lastInsertId();

        // Tạo block đầu tiên (Genesis block) trên blockchain
        $blockchain = new BlockchainSimulator();
        $blockData = [
            'event' => 'Tạo lô sản phẩm',
            'ma_lo' => $maLo,
            'ma_truy_xuat' => $maTruyXuat,
            'nong_san' => $product['ten_nong_san'],
            'noi_san_xuat' => $noiSanXuat,
            'ngay_gieo_trong' => $ngayGieoTrong,
            'nguoi_tao' => $_SESSION['ho_ten'],
            'timestamp' => date('Y-m-d H:i:s')
        ];
        $blockchain->addBlock($loId, $blockData);

        setFlash('success', "Tạo lô sản phẩm $maLo thành công! Mã truy xuất: $maTruyXuat");
        redirect('/pages/batches/detail.php?id=' . $loId);
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
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/batches/list.php">Lô sản phẩm</a></li>
                    <li class="breadcrumb-item active">Tạo mới</li>
                </ol>
            </nav>
            <h2><i class="bi bi-plus-circle me-2"></i>Tạo lô sản phẩm mới</h2>
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

                <!-- Mã lô tự động -->
                <div class="alert alert-info d-flex align-items-center">
                    <i class="bi bi-info-circle me-2 fs-5"></i>
                    <div>Mã lô tự động: <strong><?= e($autoMaLo) ?></strong></div>
                </div>

                <form method="POST" class="needs-validation" novalidate>
                    <div class="row g-3">
                        <div class="col-12">
                            <label for="nong_san_id" class="form-label">Nông sản *</label>
                            <select class="form-select" id="nong_san_id" name="nong_san_id" required>
                                <option value="">-- Chọn nông sản --</option>
                                <?php foreach ($products as $p): ?>
                                <option value="<?= $p['id'] ?>" <?= ($old['nong_san_id'] ?? '') == $p['id'] ? 'selected' : '' ?>>
                                    <?= e($p['ten_nong_san']) ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="invalid-feedback">Vui lòng chọn nông sản</div>
                        </div>
                        <div class="col-12">
                            <label for="noi_san_xuat" class="form-label">Nơi sản xuất *</label>
                            <input type="text" class="form-control" id="noi_san_xuat" name="noi_san_xuat" 
                                   value="<?= e($old['noi_san_xuat'] ?? '') ?>" required
                                   placeholder="Ví dụ: Buôn Ma Thuột, Đắk Lắk">
                            <div class="invalid-feedback">Vui lòng nhập nơi sản xuất</div>
                        </div>
                        <div class="col-md-6">
                            <label for="ngay_gieo_trong" class="form-label">Ngày gieo trồng *</label>
                            <input type="date" class="form-control" id="ngay_gieo_trong" name="ngay_gieo_trong" 
                                   value="<?= e($old['ngay_gieo_trong'] ?? '') ?>" required>
                            <div class="invalid-feedback">Vui lòng chọn ngày gieo trồng</div>
                        </div>
                        <div class="col-md-6">
                            <label for="ngay_thu_hoach" class="form-label">Ngày thu hoạch</label>
                            <input type="date" class="form-control" id="ngay_thu_hoach" name="ngay_thu_hoach" 
                                   value="<?= e($old['ngay_thu_hoach'] ?? '') ?>">
                        </div>
                        <div class="col-md-6">
                            <label for="so_luong" class="form-label">Số lượng</label>
                            <input type="number" class="form-control" id="so_luong" name="so_luong" 
                                   value="<?= e($old['so_luong'] ?? '') ?>" step="0.01" min="0">
                        </div>
                        <div class="col-md-6">
                            <label for="don_vi" class="form-label">Đơn vị</label>
                            <select class="form-select" id="don_vi" name="don_vi">
                                <option value="kg" <?= ($old['don_vi'] ?? 'kg') === 'kg' ? 'selected' : '' ?>>Kilogram (kg)</option>
                                <option value="tấn" <?= ($old['don_vi'] ?? '') === 'tấn' ? 'selected' : '' ?>>Tấn</option>
                                <option value="lít" <?= ($old['don_vi'] ?? '') === 'lít' ? 'selected' : '' ?>>Lít</option>
                                <option value="cái" <?= ($old['don_vi'] ?? '') === 'cái' ? 'selected' : '' ?>>Cái</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-lg me-1"></i>Tạo lô sản phẩm
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

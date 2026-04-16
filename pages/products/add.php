<?php
/**
 * Thêm nông sản mới
 */
$pageTitle = 'Thêm nông sản';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$errors = [];
$old = [];

// Lấy danh mục
$stmt = $conn->query("SELECT * FROM danh_muc ORDER BY ten_danh_muc");
$categories = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old = $_POST;
    $tenNongSan = trim($_POST['ten_nong_san'] ?? '');
    $danhMucId = intval($_POST['danh_muc_id'] ?? 0);
    $moTa = trim($_POST['mo_ta'] ?? '');

    // Validation
    if (empty($tenNongSan)) $errors[] = 'Tên nông sản không được để trống';
    if (strlen($tenNongSan) > 150) $errors[] = 'Tên nông sản tối đa 150 ký tự';

    if (empty($errors)) {
        $stmt = $conn->prepare(
            "INSERT INTO nong_san (ten_nong_san, danh_muc_id, mo_ta, hinh_anh, nguoi_tao_id) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$tenNongSan, $danhMucId ?: null, $moTa, $_POST['hinh_anh'] ?? null, $_SESSION['user_id']]);
        setFlash('success', 'Thêm nông sản thành công!');
        redirect('/pages/products/list.php');
    }
}

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="content-page">
    <div class="container" style="max-width: 700px;">
        <div class="page-header">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/products/list.php">Nông sản</a></li>
                    <li class="breadcrumb-item active">Thêm mới</li>
                </ol>
            </nav>
            <h2><i class="bi bi-plus-circle me-2"></i>Thêm nông sản</h2>
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

                <form method="POST" class="needs-validation" novalidate>
                    <div class="mb-3">
                        <label for="ten_nong_san" class="form-label">Tên nông sản *</label>
                        <input type="text" class="form-control" id="ten_nong_san" name="ten_nong_san" 
                               value="<?= e($old['ten_nong_san'] ?? '') ?>" required maxlength="150"
                               placeholder="Ví dụ: Cà phê Robusta, Rau cải xanh...">
                        <div class="invalid-feedback">Vui lòng nhập tên nông sản</div>
                    </div>
                    <div class="mb-3">
                        <label for="danh_muc_id" class="form-label">Danh mục</label>
                        <select class="form-select" id="danh_muc_id" name="danh_muc_id">
                            <option value="0">-- Chọn danh mục --</option>
                            <?php foreach ($categories as $cat): ?>
                            <option value="<?= $cat['id'] ?>" <?= ($old['danh_muc_id'] ?? '') == $cat['id'] ? 'selected' : '' ?>>
                                <?= e($cat['ten_danh_muc']) ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="hinh_anh" class="form-label">Đường dẫn hình ảnh</label>
                        <input type="text" class="form-control" id="hinh_anh" name="hinh_anh" 
                               value="<?= e($old['hinh_anh'] ?? '') ?>"
                               placeholder="VD: https://example.com/image.jpg">
                    </div>
                    <div class="mb-4">
                        <label for="mo_ta" class="form-label">Mô tả</label>
                        <textarea class="form-control" id="mo_ta" name="mo_ta" rows="4"
                                  placeholder="Mô tả chi tiết về nông sản..."><?= e($old['mo_ta'] ?? '') ?></textarea>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-check-lg me-1"></i>Thêm nông sản
                        </button>
                        <a href="<?= BASE_URL ?>/pages/dashboard.php" class="btn btn-outline-secondary">Hủy</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>

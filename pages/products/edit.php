<?php
/**
 * Sửa nông sản
 */
$pageTitle = 'Sửa nông sản';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$id = intval($_GET['id'] ?? 0);

if (!$id) { redirect('/pages/products/list.php'); }

// Lấy nông sản
$stmt = $conn->prepare("SELECT * FROM nong_san WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    setFlash('error', 'Không tìm thấy nông sản!');
    redirect('/pages/products/list.php');
}

// Kiểm tra quyền (chỉ người tạo hoặc admin mới sửa được)
if (getUserRole() !== 'admin' && $product['nguoi_tao_id'] != $_SESSION['user_id']) {
    setFlash('error', 'Bạn không có quyền sửa nông sản này!');
    redirect('/pages/products/list.php');
}

// Lấy danh mục
$stmt = $conn->query("SELECT * FROM danh_muc ORDER BY ten_danh_muc");
$categories = $stmt->fetchAll();

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tenNongSan = trim($_POST['ten_nong_san'] ?? '');
    $danhMucId = intval($_POST['danh_muc_id'] ?? 0);
    $moTa = trim($_POST['mo_ta'] ?? '');

    if (empty($tenNongSan)) $errors[] = 'Tên nông sản không được để trống';

    if (empty($errors)) {
        $stmt = $conn->prepare(
            "UPDATE nong_san SET ten_nong_san = ?, danh_muc_id = ?, mo_ta = ?, hinh_anh = ? WHERE id = ?"
        );
        $stmt->execute([$tenNongSan, $danhMucId ?: null, $moTa, $_POST['hinh_anh'] ?? null, $id]);
        setFlash('success', 'Cập nhật nông sản thành công!');
        redirect('/pages/products/list.php');
    }
    // Cập nhật product object cho form
    $product['ten_nong_san'] = $tenNongSan;
    $product['danh_muc_id'] = $danhMucId;
    $product['hinh_anh'] = $_POST['hinh_anh'] ?? null;
    $product['mo_ta'] = $moTa;
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
                    <li class="breadcrumb-item active">Sửa</li>
                </ol>
            </nav>
            <h2><i class="bi bi-pencil-square me-2"></i>Sửa nông sản</h2>
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
                               value="<?= e($product['ten_nong_san']) ?>" required maxlength="150">
                    </div>
                    <div class="mb-3">
                        <label for="danh_muc_id" class="form-label">Danh mục</label>
                        <select class="form-select" id="danh_muc_id" name="danh_muc_id">
                            <option value="0">-- Chọn danh mục --</option>
                            <?php foreach ($categories as $cat): ?>
                            <option value="<?= $cat['id'] ?>" <?= $product['danh_muc_id'] == $cat['id'] ? 'selected' : '' ?>>
                                <?= e($cat['ten_danh_muc']) ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="hinh_anh" class="form-label">Đường dẫn hình ảnh</label>
                        <input type="text" class="form-control" id="hinh_anh" name="hinh_anh" 
                               value="<?= e($product['hinh_anh'] ?? '') ?>"
                               placeholder="VD: https://example.com/image.jpg">
                    </div>
                    <div class="mb-4">
                        <label for="mo_ta" class="form-label">Mô tả</label>
                        <textarea class="form-control" id="mo_ta" name="mo_ta" rows="4"><?= e($product['mo_ta']) ?></textarea>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-check-lg me-1"></i>Cập nhật
                        </button>
                        <a href="<?= BASE_URL ?>/pages/dashboard.php" class="btn btn-outline-secondary">Hủy</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>

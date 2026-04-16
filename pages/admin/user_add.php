<?php
/**
 * Thêm người dùng mới (Admin)
 */
$pageTitle = 'Thêm người dùng';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin']);

$conn = getConnection();
$errors = [];
$old = [];

// Lấy danh sách vai trò
$stmt = $conn->query("SELECT * FROM vai_tro ORDER BY id");
$roles = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old = $_POST;
    $username = trim($_POST['ten_dang_nhap'] ?? '');
    $password = $_POST['mat_khau'] ?? '';
    $fullname = trim($_POST['ho_ten'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['so_dien_thoai'] ?? '');
    $address = trim($_POST['dia_chi'] ?? '');
    $roleId = intval($_POST['vai_tro_id'] ?? 0);

    // Validation
    if (empty($username)) $errors[] = 'Tên đăng nhập không được để trống';
    if (strlen($password) < 6) $errors[] = 'Mật khẩu phải từ 6 ký tự';
    if (empty($fullname)) $errors[] = 'Họ tên không được để trống';
    if (!$roleId) $errors[] = 'Vui lòng chọn vai trò';

    // Check unique username
    $stmt = $conn->prepare("SELECT id FROM nguoi_dung WHERE ten_dang_nhap = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        $errors[] = 'Tên đăng nhập đã tồn tại';
    }

    if (empty($errors)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare(
            "INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai, dia_chi, vai_tro_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$username, $hashedPassword, $fullname, $email, $phone, $address, $roleId]);
        setFlash('success', 'Thêm người dùng thành công!');
        redirect('/pages/admin/users.php');
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
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/admin/users.php">Người dùng</a></li>
                    <li class="breadcrumb-item active">Thêm mới</li>
                </ol>
            </nav>
            <h2><i class="bi bi-person-plus me-2"></i>Thêm người dùng mới</h2>
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
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="ten_dang_nhap" class="form-label">Tên đăng nhập *</label>
                            <input type="text" class="form-control" id="ten_dang_nhap" name="ten_dang_nhap" 
                                   value="<?= e($old['ten_dang_nhap'] ?? '') ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label for="mat_khau" class="form-label">Mật khẩu *</label>
                            <input type="password" class="form-control" id="mat_khau" name="mat_khau" required minlength="6">
                        </div>
                        <div class="col-12">
                            <label for="ho_ten" class="form-label">Họ tên *</label>
                            <input type="text" class="form-control" id="ho_ten" name="ho_ten" 
                                   value="<?= e($old['ho_ten'] ?? '') ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" 
                                   value="<?= e($old['email'] ?? '') ?>">
                        </div>
                        <div class="col-md-6">
                            <label for="so_dien_thoai" class="form-label">Số điện thoại</label>
                            <input type="text" class="form-control" id="so_dien_thoai" name="so_dien_thoai" 
                                   value="<?= e($old['so_dien_thoai'] ?? '') ?>">
                        </div>
                        <div class="col-12">
                            <label for="vai_tro_id" class="form-label">Vai trò *</label>
                            <select class="form-select" id="vai_tro_id" name="vai_tro_id" required>
                                <option value="">-- Chọn vai trò --</option>
                                <?php foreach ($roles as $r): ?>
                                <option value="<?= $r['id'] ?>" <?= ($old['vai_tro_id'] ?? '') == $r['id'] ? 'selected' : '' ?>>
                                    <?= e($r['mo_ta']) ?> (<?= e($r['ten_vai_tro']) ?>)
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-12">
                            <label for="dia_chi" class="form-label">Địa chỉ</label>
                            <textarea class="form-control" id="dia_chi" name="dia_chi" rows="2"><?= e($old['dia_chi'] ?? '') ?></textarea>
                        </div>
                        <div class="col-12 mt-4">
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-lg me-1"></i>Thêm người dùng
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

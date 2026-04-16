<?php
/**
 * Trang đăng ký
 */
$pageTitle = 'Đăng ký';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

if (isLoggedIn()) {
    redirect('/pages/dashboard.php');
}

$errors = [];
$old = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old = $_POST;
    
    // Validation
    $tenDangNhap = trim($_POST['ten_dang_nhap'] ?? '');
    $hoTen = trim($_POST['ho_ten'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $soDienThoai = trim($_POST['so_dien_thoai'] ?? '');
    $matKhau = $_POST['mat_khau'] ?? '';
    $xacNhanMatKhau = $_POST['xac_nhan_mat_khau'] ?? '';
    $vaiTroId = intval($_POST['vai_tro_id'] ?? 3);

    if (empty($tenDangNhap)) $errors[] = 'Tên đăng nhập không được để trống';
    if (strlen($tenDangNhap) < 3) $errors[] = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $tenDangNhap)) $errors[] = 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới';
    if (empty($hoTen)) $errors[] = 'Họ tên không được để trống';
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email không hợp lệ';
    if (strlen($matKhau) < 6) $errors[] = 'Mật khẩu phải có ít nhất 6 ký tự';
    if ($matKhau !== $xacNhanMatKhau) $errors[] = 'Xác nhận mật khẩu không khớp';
    if (!in_array($vaiTroId, [2, 3])) $errors[] = 'Vai trò không hợp lệ';

    if (empty($errors)) {
        $auth = new Auth();
        $result = $auth->register([
            'ten_dang_nhap' => $tenDangNhap,
            'mat_khau' => $matKhau,
            'ho_ten' => $hoTen,
            'email' => $email,
            'so_dien_thoai' => $soDienThoai,
            'vai_tro_id' => $vaiTroId
        ]);

        if ($result['success']) {
            setFlash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
            redirect('/pages/login.php');
        } else {
            $errors[] = $result['message'];
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="auth-page">
    <div class="auth-card" style="max-width: 520px;">
        <div class="auth-header">
            <div class="auth-icon">
                <i class="bi bi-person-plus"></i>
            </div>
            <h3>Đăng ký tài khoản</h3>
            <p>Tham gia hệ thống AgriTrace</p>
        </div>

        <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
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
                           value="<?= e($old['ten_dang_nhap'] ?? '') ?>" required minlength="3" pattern="[a-zA-Z0-9_]+">
                    <div class="invalid-feedback">Chỉ chứa chữ, số và _, tối thiểu 3 ký tự</div>
                </div>
                <div class="col-md-6">
                    <label for="ho_ten" class="form-label">Họ và tên *</label>
                    <input type="text" class="form-control" id="ho_ten" name="ho_ten" 
                           value="<?= e($old['ho_ten'] ?? '') ?>" required>
                    <div class="invalid-feedback">Vui lòng nhập họ tên</div>
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
                        <option value="3" <?= ($old['vai_tro_id'] ?? '') == 3 ? 'selected' : '' ?>>Người tiêu dùng</option>
                        <option value="2" <?= ($old['vai_tro_id'] ?? '') == 2 ? 'selected' : '' ?>>Nhà sản xuất</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="mat_khau" class="form-label">Mật khẩu *</label>
                    <input type="password" class="form-control" id="mat_khau" name="mat_khau" required minlength="6">
                    <div class="invalid-feedback">Tối thiểu 6 ký tự</div>
                </div>
                <div class="col-md-6">
                    <label for="xac_nhan_mat_khau" class="form-label">Xác nhận mật khẩu *</label>
                    <input type="password" class="form-control" id="xac_nhan_mat_khau" name="xac_nhan_mat_khau" required>
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary w-100 py-2">
                        <i class="bi bi-person-plus me-2"></i>Đăng ký
                    </button>
                </div>
            </div>
        </form>

        <div class="text-center mt-3">
            <p class="text-muted small">
                Đã có tài khoản? <a href="<?= BASE_URL ?>/pages/login.php">Đăng nhập</a>
            </p>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

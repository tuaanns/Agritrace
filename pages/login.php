<?php
/**
 * Trang đăng nhập
 */
$pageTitle = 'Đăng nhập';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

// Nếu đã đăng nhập, chuyển đến dashboard
if (isLoggedIn()) {
    redirect('/pages/dashboard.php');
}

$error = '';

// Xử lý đăng nhập
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tenDangNhap = trim($_POST['ten_dang_nhap'] ?? '');
    $matKhau = trim($_POST['mat_khau'] ?? '');

    // Validation
    if (empty($tenDangNhap) || empty($matKhau)) {
        $error = 'Vui lòng nhập đầy đủ thông tin!';
    } else {
        $auth = new Auth();
        if ($auth->login($tenDangNhap, $matKhau)) {
            setFlash('success', 'Đăng nhập thành công! Chào mừng ' . $_SESSION['ho_ten']);
            redirect('/pages/dashboard.php');
        } else {
            $error = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="auth-page">
    <div class="auth-card">
        <div class="auth-header">
            <div class="auth-icon">
                <i class="bi bi-box-arrow-in-right"></i>
            </div>
            <h3>Đăng nhập</h3>
            <p>Chào mừng trở lại AgriTrace</p>
        </div>

        <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i><?= e($error) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        <?php endif; ?>

        <form method="POST" class="needs-validation" novalidate>
            <div class="mb-3">
                <label for="ten_dang_nhap" class="form-label">
                    <i class="bi bi-person me-1"></i>Tên đăng nhập
                </label>
                <input type="text" class="form-control" id="ten_dang_nhap" name="ten_dang_nhap" 
                       value="<?= e($tenDangNhap ?? '') ?>" placeholder="Nhập tên đăng nhập" required>
                <div class="invalid-feedback">Vui lòng nhập tên đăng nhập</div>
            </div>
            <div class="mb-4">
                <label for="mat_khau" class="form-label">
                    <i class="bi bi-lock me-1"></i>Mật khẩu
                </label>
                <input type="password" class="form-control" id="mat_khau" name="mat_khau" 
                       placeholder="Nhập mật khẩu" required>
                <div class="invalid-feedback">Vui lòng nhập mật khẩu</div>
            </div>
            <button type="submit" class="btn btn-primary w-100 py-2">
                <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập
            </button>
        </form>

        <div class="text-center mt-3">
            <p class="text-muted small">
                Chưa có tài khoản? <a href="<?= BASE_URL ?>/pages/register.php">Đăng ký ngay</a>
            </p>
        </div>


    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

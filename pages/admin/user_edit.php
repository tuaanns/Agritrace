<?php
/**
 * Chỉnh sửa người dùng (Admin)
 */
$pageTitle = 'Chỉnh sửa người dùng';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin']);

$conn = getConnection();
$id = intval($_GET['id'] ?? 0);

if (!$id) { redirect('/pages/admin/users.php'); }

// Lấy thông tin người dùng
$stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

if (!$user) {
    setFlash('error', 'Không tìm thấy người dùng!');
    redirect('/pages/admin/users.php');
}

$errors = [];

// Lấy danh sách vai trò
$stmt = $conn->query("SELECT * FROM vai_tro ORDER BY id");
$roles = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ho_ten = trim($_POST['ho_ten'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $so_dien_thoai = trim($_POST['so_dien_thoai'] ?? '');
    $dia_chi = trim($_POST['dia_chi'] ?? '');
    $vai_tro_id = intval($_POST['vai_tro_id'] ?? 0);
    $mat_khau_moi = $_POST['mat_khau_moi'] ?? '';

    // Validation
    if (empty($ho_ten)) $errors[] = 'Họ tên không được để trống';
    if (!$vai_tro_id) $errors[] = 'Vui lòng chọn vai trò';

    if (empty($errors)) {
        if (!empty($mat_khau_moi)) {
            if (strlen($mat_khau_moi) < 6) {
                $errors[] = 'Mật khẩu mới phải từ 6 ký tự';
            } else {
                $hashedPassword = password_hash($mat_khau_moi, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("UPDATE nguoi_dung SET mat_khau = ? WHERE id = ?");
                $stmt->execute([$hashedPassword, $id]);
            }
        }

        if (empty($errors)) {
            $stmt = $conn->prepare(
                "UPDATE nguoi_dung SET ho_ten = ?, email = ?, so_dien_thoai = ?, dia_chi = ?, vai_tro_id = ? WHERE id = ?"
            );
            $stmt->execute([$ho_ten, $email, $so_dien_thoai, $dia_chi, $vai_tro_id, $id]);
            setFlash('success', 'Cập nhật người dùng thành công!');
            redirect('/pages/admin/users.php');
        }
    }
    // Update local user object for form
    $user['ho_ten'] = $ho_ten;
    $user['email'] = $email;
    $user['so_dien_thoai'] = $so_dien_thoai;
    $user['dia_chi'] = $dia_chi;
    $user['vai_tro_id'] = $vai_tro_id;
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
                    <li class="breadcrumb-item active">Sửa</li>
                </ol>
            </nav>
            <h2><i class="bi bi-pencil-square me-2"></i>Chỉnh sửa người dùng</h2>
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
                            <label class="form-label">Tên đăng nhập</label>
                            <input type="text" class="form-control" value="<?= e($user['ten_dang_nhap']) ?>" disabled>
                        </div>
                        <div class="col-md-6">
                            <label for="mat_khau_moi" class="form-label">Mật khẩu mới (để trống nếu không đổi)</label>
                            <input type="password" class="form-control" id="mat_khau_moi" name="mat_khau_moi" minlength="6">
                        </div>
                        <div class="col-12">
                            <label for="ho_ten" class="form-label">Họ tên *</label>
                            <input type="text" class="form-control" id="ho_ten" name="ho_ten" 
                                   value="<?= e($user['ho_ten']) ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" 
                                   value="<?= e($user['email'] ?? '') ?>">
                        </div>
                        <div class="col-md-6">
                            <label for="so_dien_thoai" class="form-label">Số điện thoại</label>
                            <input type="text" class="form-control" id="so_dien_thoai" name="so_dien_thoai" 
                                   value="<?= e($user['so_dien_thoai'] ?? '') ?>">
                        </div>
                        <div class="col-12">
                            <label for="vai_tro_id" class="form-label">Vai trò *</label>
                            <select class="form-select" id="vai_tro_id" name="vai_tro_id" required>
                                <?php foreach ($roles as $r): ?>
                                <option value="<?= $r['id'] ?>" <?= $user['vai_tro_id'] == $r['id'] ? 'selected' : '' ?>>
                                    <?= e($r['mo_ta']) ?> (<?= e($r['ten_vai_tro']) ?>)
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-12">
                            <label for="dia_chi" class="form-label">Địa chỉ</label>
                            <textarea class="form-control" id="dia_chi" name="dia_chi" rows="2"><?= e($user['dia_chi'] ?? '') ?></textarea>
                        </div>
                        <div class="col-12 mt-4">
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-lg me-1"></i>Lưu thay đổi
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

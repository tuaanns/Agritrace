<?php
/**
 * Quản lý người dùng (Admin)
 */
$pageTitle = 'Quản lý người dùng';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin']);

$conn = getConnection();

// Xử lý thay đổi trạng thái
if (isset($_GET['toggle_status'])) {
    $toggleId = intval($_GET['toggle_status']);
    if ($toggleId != $_SESSION['user_id']) {
        $stmt = $conn->prepare("UPDATE nguoi_dung SET trang_thai = IF(trang_thai = 1, 0, 1) WHERE id = ?");
        $stmt->execute([$toggleId]);
        setFlash('success', 'Cập nhật trạng thái người dùng thành công!');
    } else {
        setFlash('error', 'Không thể vô hiệu hóa chính mình!');
    }
    redirect('/pages/admin/users.php');
}

// Xử lý xóa người dùng
if (isset($_GET['delete'])) {
    $deleteId = intval($_GET['delete']);
    if ($deleteId != $_SESSION['user_id']) {
        try {
            $stmt = $conn->prepare("DELETE FROM nguoi_dung WHERE id = ?");
            $stmt->execute([$deleteId]);
            setFlash('success', 'Xóa người dùng thành công!');
        } catch (PDOException $e) {
            setFlash('error', 'Không thể xóa người dùng này vì có dữ liệu liên quan! Hãy dùng tính năng vô hiệu hóa.');
        }
    } else {
        setFlash('error', 'Không thể tự xóa chính mình!');
    }
    redirect('/pages/admin/users.php');
}

// Lấy danh sách người dùng
$stmt = $conn->query(
    "SELECT nd.*, vt.ten_vai_tro, vt.mo_ta as mo_ta_vai_tro
     FROM nguoi_dung nd
     JOIN vai_tro vt ON nd.vai_tro_id = vt.id
     ORDER BY nd.vai_tro_id, nd.ngay_tao DESC"
);
$users = $stmt->fetchAll();

// Thống kê
$stmt = $conn->query("SELECT vt.ten_vai_tro, COUNT(nd.id) as total 
                       FROM vai_tro vt LEFT JOIN nguoi_dung nd ON vt.id = nd.vai_tro_id 
                       GROUP BY vt.id, vt.ten_vai_tro");
$roleStats = $stmt->fetchAll();

$roleLabels = [
    'admin' => ['label' => 'Quản trị viên', 'color' => 'danger', 'icon' => 'bi-shield-lock'],
    'nha_san_xuat' => ['label' => 'Nhà sản xuất', 'color' => 'success', 'icon' => 'bi-tree'],
    'nguoi_tieu_dung' => ['label' => 'Người tiêu dùng', 'color' => 'info', 'icon' => 'bi-person']
];

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="content-page">
    <div class="container">
        <div class="page-header">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                    <li class="breadcrumb-item active">Người dùng</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-between align-items-end">
                <div>
                    <h2><i class="bi bi-people me-2"></i>Quản lý người dùng</h2>
                    <p>Quản lý tài khoản và phân quyền</p>
                </div>
                <a href="<?= BASE_URL ?>/pages/admin/user_add.php" class="btn btn-primary mb-2">
                    <i class="bi bi-person-plus me-1"></i>Thêm người dùng
                </a>
            </div>
        </div>

        <!-- Role Stats -->
        <div class="row g-4 mb-4">
            <?php foreach ($roleStats as $rs): 
                $info = $roleLabels[$rs['ten_vai_tro']] ?? ['label' => $rs['ten_vai_tro'], 'color' => 'secondary', 'icon' => 'bi-person'];
            ?>
            <div class="col-md-4">
                <div class="stat-card" style="border-left: 4px solid var(--<?= $info['color'] === 'danger' ? 'danger' : ($info['color'] === 'success' ? 'primary' : 'info') ?>);">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-label"><?= $info['label'] ?></div>
                            <div class="stat-value"><?= $rs['total'] ?></div>
                        </div>
                        <div class="stat-icon" style="background: rgba(var(--bs-<?= $info['color'] ?>-rgb), 0.1);">
                            <i class="bi <?= $info['icon'] ?> text-<?= $info['color'] ?>"></i>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- Users Table -->
        <div class="data-card">
            <div class="data-card-header">
                <h5>Tất cả người dùng (<?= count($users) ?>)</h5>
            </div>
            <div class="data-card-body p-0">
                <div class="table-responsive">
                    <table class="table-modern">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Người dùng</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $i => $u): 
                                $info = $roleLabels[$u['ten_vai_tro']] ?? ['label' => $u['ten_vai_tro'], 'color' => 'secondary'];
                            ?>
                            <tr>
                                <td><?= $i + 1 ?></td>
                                <td>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem;">
                                            <?= strtoupper(mb_substr($u['ho_ten'], 0, 1)) ?>
                                        </div>
                                        <strong><?= e($u['ho_ten']) ?></strong>
                                    </div>
                                </td>
                                <td><code><?= e($u['ten_dang_nhap']) ?></code></td>
                                <td class="small text-muted"><?= e($u['email'] ?? '-') ?></td>
                                <td class="small"><?= e($u['so_dien_thoai'] ?? '-') ?></td>
                                <td>
                                    <span class="badge bg-<?= $info['color'] ?>">
                                        <?= $info['label'] ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge <?= $u['trang_thai'] ? 'active' : 'inactive' ?>">
                                        <i class="bi bi-circle-fill" style="font-size: 0.4rem;"></i>
                                        <?= $u['trang_thai'] ? 'Hoạt động' : 'Vô hiệu' ?>
                                    </span>
                                </td>
                                <td class="small text-muted"><?= date('d/m/Y', strtotime($u['ngay_tao'])) ?></td>
                                <td>
                                    <div class="d-flex gap-1">
                                        <a href="<?= BASE_URL ?>/pages/admin/user_edit.php?id=<?= $u['id'] ?>" 
                                           class="btn btn-sm btn-outline-primary" title="Sửa">
                                            <i class="bi bi-pencil"></i>
                                        </a>
                                        <?php if ($u['id'] != $_SESSION['user_id']): ?>
                                        <a href="<?= BASE_URL ?>/pages/admin/users.php?toggle_status=<?= $u['id'] ?>" 
                                           class="btn btn-sm btn-outline-<?= $u['trang_thai'] ? 'warning' : 'success' ?>"
                                           onclick="return confirm('<?= $u['trang_thai'] ? 'Vô hiệu hóa' : 'Kích hoạt' ?> tài khoản <?= e($u['ho_ten']) ?>?')"
                                           title="<?= $u['trang_thai'] ? 'Vô hiệu hóa' : 'Kích hoạt' ?>">
                                            <i class="bi bi-<?= $u['trang_thai'] ? 'lock' : 'unlock' ?>"></i>
                                        </a>
                                        <a href="<?= BASE_URL ?>/pages/admin/users.php?delete=<?= $u['id'] ?>" 
                                           class="btn btn-sm btn-outline-danger"
                                           onclick="return confirm('Bạn có chắc chắn muốn XÓA vĩnh viễn tài khoản <?= e($u['ho_ten']) ?>?')"
                                           title="Xóa">
                                            <i class="bi bi-trash"></i>
                                        </a>
                                        <?php else: ?>
                                        <span class="badge bg-light text-dark border">Bạn</span>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>

<?php
/**
 * Danh sách nông sản
 */
$pageTitle = 'Quản lý nông sản';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$userId = $_SESSION['user_id'];
$vaiTro = getUserRole();

// Tìm kiếm
$search = trim($_GET['search'] ?? '');
$danhMucId = intval($_GET['danh_muc_id'] ?? 0);

// Query
$sql = "SELECT ns.*, dm.ten_danh_muc, nd.ho_ten as nguoi_tao,
        (SELECT COUNT(*) FROM lo_san_pham WHERE nong_san_id = ns.id) as so_lo
        FROM nong_san ns
        LEFT JOIN danh_muc dm ON ns.danh_muc_id = dm.id
        JOIN nguoi_dung nd ON ns.nguoi_tao_id = nd.id
        WHERE 1=1";
$params = [];

if ($vaiTro === 'nha_san_xuat') {
    $sql .= " AND ns.nguoi_tao_id = ?";
    $params[] = $userId;
}
if (!empty($search)) {
    $sql .= " AND (ns.ten_nong_san LIKE ? OR ns.mo_ta LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($danhMucId > 0) {
    $sql .= " AND ns.danh_muc_id = ?";
    $params[] = $danhMucId;
}
$sql .= " ORDER BY ns.ngay_tao DESC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Danh mục
$stmt = $conn->query("SELECT * FROM danh_muc ORDER BY ten_danh_muc");
$categories = $stmt->fetchAll();

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="content-page">
    <div class="container">
        <!-- Page Header -->
        <div class="page-header">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                    <li class="breadcrumb-item active">Nông sản</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h2><i class="bi bi-leaf me-2"></i>Quản lý nông sản</h2>
                    <p>Quản lý danh sách nông sản trong hệ thống</p>
                </div>
                <a href="<?= BASE_URL ?>/pages/products/add.php" class="btn btn-accent">
                    <i class="bi bi-plus-lg me-1"></i>Thêm nông sản
                </a>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="data-card mb-4">
            <div class="data-card-body">
                <form method="GET" class="row g-3 align-items-end">
                    <div class="col-md-5">
                        <label class="form-label">Tìm kiếm</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" name="search" 
                                   value="<?= e($search) ?>" placeholder="Tên nông sản...">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Danh mục</label>
                        <select class="form-select" name="danh_muc_id">
                            <option value="0">Tất cả danh mục</option>
                            <?php foreach ($categories as $cat): ?>
                            <option value="<?= $cat['id'] ?>" <?= $danhMucId == $cat['id'] ? 'selected' : '' ?>>
                                <?= e($cat['ten_danh_muc']) ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-funnel me-1"></i>Lọc
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Products Table -->
        <div class="data-card">
            <div class="data-card-header">
                <h5>Danh sách nông sản (<?= count($products) ?>)</h5>
            </div>
            <div class="data-card-body p-0">
                <?php if (empty($products)): ?>
                <div class="empty-state">
                    <i class="bi bi-leaf d-block"></i>
                    <h5>Chưa có nông sản nào</h5>
                    <p class="text-muted">Bấm "Thêm nông sản" để bắt đầu</p>
                </div>
                <?php else: ?>
                <div class="table-responsive">
                    <table class="table-modern">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên nông sản</th>
                                <th>Danh mục</th>
                                <th>Số lô SP</th>
                                <th>Người tạo</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $i => $p): ?>
                            <tr>
                                <td><?= $i + 1 ?></td>
                                <td>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="product-icon" style="width:36px;height:36px;font-size:.9rem;border-radius:8px;">
                                            <i class="bi bi-leaf"></i>
                                        </div>
                                        <div>
                                            <div class="fw-600"><?= e($p['ten_nong_san']) ?></div>
                                            <small class="text-muted"><?= e(mb_substr($p['mo_ta'] ?? '', 0, 50)) ?></small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-success bg-opacity-10 text-success">
                                        <?= e($p['ten_danh_muc'] ?? 'Chưa phân loại') ?>
                                    </span>
                                </td>
                                <td><span class="fw-600"><?= $p['so_lo'] ?></span></td>
                                <td class="text-muted small"><?= e($p['nguoi_tao']) ?></td>
                                <td class="text-muted small"><?= date('d/m/Y', strtotime($p['ngay_tao'])) ?></td>
                                <td>
                                    <div class="d-flex gap-1">
                                        <a href="<?= BASE_URL ?>/pages/products/edit.php?id=<?= $p['id'] ?>" 
                                           class="btn btn-sm btn-warning" title="Sửa">
                                            <i class="bi bi-pencil"></i>
                                        </a>
                                        <a href="<?= BASE_URL ?>/pages/products/delete.php?id=<?= $p['id'] ?>" 
                                           class="btn btn-sm btn-danger" 
                                           data-confirm-delete="Bạn có chắc muốn xóa nông sản '<?= e($p['ten_nong_san']) ?>'?" 
                                           title="Xóa">
                                            <i class="bi bi-trash"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>

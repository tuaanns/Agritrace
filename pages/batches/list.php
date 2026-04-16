<?php
/**
 * Danh sách lô sản phẩm
 */
$pageTitle = 'Quản lý lô sản phẩm';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$userId = $_SESSION['user_id'];
$vaiTro = getUserRole();

$search = trim($_GET['search'] ?? '');

$sql = "SELECT lsp.*, ns.ten_nong_san, nd.ho_ten as nguoi_tao,
        (SELECT COUNT(*) FROM qua_trinh WHERE lo_san_pham_id = lsp.id) as so_qua_trinh,
        (SELECT COUNT(*) FROM blockchain WHERE lo_san_pham_id = lsp.id) as so_block
        FROM lo_san_pham lsp
        JOIN nong_san ns ON lsp.nong_san_id = ns.id
        JOIN nguoi_dung nd ON lsp.nguoi_tao_id = nd.id
        WHERE 1=1";
$params = [];

if ($vaiTro === 'nha_san_xuat') {
    $sql .= " AND lsp.nguoi_tao_id = ?";
    $params[] = $userId;
}
if (!empty($search)) {
    $sql .= " AND (lsp.ma_lo LIKE ? OR lsp.ma_truy_xuat LIKE ? OR ns.ten_nong_san LIKE ? OR lsp.noi_san_xuat LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$sql .= " ORDER BY lsp.ngay_tao DESC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$batches = $stmt->fetchAll();

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="content-page">
    <div class="container">
        <div class="page-header">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                    <li class="breadcrumb-item active">Lô sản phẩm</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h2><i class="bi bi-boxes me-2"></i>Quản lý lô sản phẩm</h2>
                    <p>Quản lý các lô sản phẩm và mã truy xuất</p>
                </div>
                <a href="<?= BASE_URL ?>/pages/batches/add.php" class="btn btn-accent">
                    <i class="bi bi-plus-lg me-1"></i>Tạo lô mới
                </a>
            </div>
        </div>

        <!-- Search -->
        <div class="data-card mb-4">
            <div class="data-card-body">
                <form method="GET" class="row g-3 align-items-end">
                    <div class="col-md-9">
                        <label class="form-label">Tìm kiếm</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" name="search" 
                                   value="<?= e($search) ?>" placeholder="Mã lô, mã truy xuất, tên nông sản, nơi sản xuất...">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-search me-1"></i>Tìm
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Batches Table -->
        <div class="data-card">
            <div class="data-card-header">
                <h5>Danh sách lô sản phẩm (<?= count($batches) ?>)</h5>
            </div>
            <div class="data-card-body p-0">
                <?php if (empty($batches)): ?>
                <div class="empty-state">
                    <i class="bi bi-boxes d-block"></i>
                    <h5>Chưa có lô sản phẩm nào</h5>
                </div>
                <?php else: ?>
                <div class="table-responsive">
                    <table class="table-modern">
                        <thead>
                            <tr>
                                <th>Mã lô</th>
                                <th>Nông sản</th>
                                <th>Nơi sản xuất</th>
                                <th>Ngày thu hoạch</th>
                                <th>Số lượng</th>
                                <th>Quy trình</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($batches as $b): ?>
                            <tr>
                                <td>
                                    <a href="<?= BASE_URL ?>/pages/batches/detail.php?id=<?= $b['id'] ?>" class="fw-600">
                                        <?= e($b['ma_lo']) ?>
                                    </a>
                                </td>
                                <td><?= e($b['ten_nong_san']) ?></td>
                                <td><small class="text-muted"><?= e($b['noi_san_xuat']) ?></small></td>
                                <td class="small"><?= $b['ngay_thu_hoach'] ? date('d/m/Y', strtotime($b['ngay_thu_hoach'])) : '-' ?></td>
                                <td><?= $b['so_luong'] ? number_format($b['so_luong']) . ' ' . e($b['don_vi']) : '-' ?></td>
                                <td><span class="badge bg-info-subtle text-info"><?= $b['so_qua_trinh'] ?></span></td>
                                <td>
                                    <span class="status-badge <?= $b['trang_thai'] === 'Đã phân phối' ? 'completed' : 'active' ?>">
                                        <?= e($b['trang_thai']) ?>
                                    </span>
                                </td>
                                <td>
                                    <a href="<?= BASE_URL ?>/pages/batches/detail.php?id=<?= $b['id'] ?>" 
                                       class="btn btn-sm btn-outline-primary" title="Chi tiết">
                                        <i class="bi bi-eye"></i>
                                    </a>
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

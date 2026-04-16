<?php
/**
 * Dashboard - Bảng điều khiển hiện đại
 */
$pageTitle = 'Bảng điều khiển';
require_once __DIR__ . '/../config/database.php';
requireLogin();

$conn = getConnection();
$userId = $_SESSION['user_id'];
$vaiTro = getUserRole();
$hoTen = $_SESSION['ho_ten'];

// Thống kê tổng quan
$stats = [];
if ($vaiTro === 'admin') {
    $stats['nong_san'] = $conn->query("SELECT COUNT(*) FROM nong_san")->fetchColumn();
    $stats['lo_san_pham'] = $conn->query("SELECT COUNT(*) FROM lo_san_pham")->fetchColumn();
    $stats['qua_trinh'] = $conn->query("SELECT COUNT(*) FROM qua_trinh")->fetchColumn();
    $stats['xac_thuc'] = $conn->query("SELECT COUNT(*) FROM blockchain")->fetchColumn();
} else {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM nong_san WHERE nguoi_tao_id = ?");
    $stmt->execute([$userId]);
    $stats['nong_san'] = $stmt->fetchColumn();
    
    $stmt = $conn->prepare("SELECT COUNT(*) FROM lo_san_pham WHERE nguoi_tao_id = ?");
    $stmt->execute([$userId]);
    $stats['lo_san_pham'] = $stmt->fetchColumn();
    
    $stmt = $conn->prepare("SELECT COUNT(*) FROM qua_trinh WHERE nguoi_tao_id = ?");
    $stmt->execute([$userId]);
    $stats['qua_trinh'] = $stmt->fetchColumn();
    
    $stats['xac_thuc'] = $conn->query("SELECT COUNT(*) FROM blockchain")->fetchColumn();
}

// Lấy danh sách lô sản phẩm gần đây
$stmt = $conn->prepare(
    "SELECT lsp.*, ns.ten_nong_san 
     FROM lo_san_pham lsp
     JOIN nong_san ns ON lsp.nong_san_id = ns.id
     " . ($vaiTro === 'admin' ? "" : "WHERE lsp.nguoi_tao_id = ?") . "
     ORDER BY lsp.ngay_tao DESC LIMIT 5"
);
if ($vaiTro === 'admin') $stmt->execute(); else $stmt->execute([$userId]);
$recentBatches = $stmt->fetchAll();

// Hoạt động gần đây
$stmt = $conn->query(
    "SELECT qt.*, lsp.ma_lo, ns.ten_nong_san
     FROM qua_trinh qt
     JOIN lo_san_pham lsp ON qt.lo_san_pham_id = lsp.id
     JOIN nong_san ns ON lsp.nong_san_id = ns.id
     ORDER BY qt.ngay_tao DESC LIMIT 6"
);
$recentActivities = $stmt->fetchAll();

$stageIcons = [
    'gieo_trong' => 'bi-flower1',
    'cham_soc' => 'bi-droplet-half',
    'thu_hoach' => 'bi-basket2',
    'dong_goi' => 'bi-box-seam',
    'van_chuyen' => 'bi-truck',
    'phan_phoi' => 'bi-shop'
];

require_once __DIR__ . '/../includes/header.php';
?>

<div class="dashboard-page py-4">
    <div class="container">
        <!-- Modern Welcome Banner -->
        <div class="welcome-banner mb-5 p-4 rounded-4 shadow-lg text-white" style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h2 class="fw-800 mb-1">Chào mừng trở lại, <?= e($hoTen) ?>!</h2>
                    <p class="text-white-50 mb-0">Hệ thống đang hoạt động ổn định. Hôm nay bạn muốn quản lý gì?</p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    <div class="badge bg-primary-light text-dark px-3 py-2 rounded-pill fw-700">
                        <i class="bi bi-shield-check me-1"></i> <?= $vaiTro === 'admin' ? 'Quản trị viên' : 'Nhà sản xuất' ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Stats Cards -->
        <div class="row g-4 mb-5">
            <div class="col-lg-3 col-md-6">
                <div class="stat-card green">
                    <div class="stat-icon"><i class="bi bi-leaf"></i></div>
                    <div class="stat-value"><?= $stats['nong_san'] ?></div>
                    <div class="stat-label">Nông sản</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="stat-card blue">
                    <div class="stat-icon"><i class="bi bi-boxes"></i></div>
                    <div class="stat-value"><?= $stats['lo_san_pham'] ?></div>
                    <div class="stat-label">Lô sản phẩm</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="stat-card orange">
                    <div class="stat-icon"><i class="bi bi-diagram-3"></i></div>
                    <div class="stat-value"><?= $stats['qua_trinh'] ?></div>
                    <div class="stat-label">Quy trình</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="stat-card purple">
                    <div class="stat-icon"><i class="bi bi-patch-check"></i></div>
                    <div class="stat-value"><?= $stats['xac_thuc'] ?></div>
                    <div class="stat-label">Dữ liệu xác thực</div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <!-- Recent Batches Main Table -->
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-0">
                        <h5 class="fw-800 mb-0">Lô sản phẩm gần đây</h5>
                        <a href="<?= BASE_URL ?>/pages/batches/list.php" class="btn btn-sm btn-light rounded-pill px-3">Xem tất cả</a>
                    </div>
                    <div class="card-body p-3">
                        <div class="table-responsive">
                            <table class="table-modern">
                                <thead>
                                    <tr>
                                        <th>Mã lô</th>
                                        <th>Sản phẩm</th>
                                        <th>Cơ sở SX</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentBatches as $batch): ?>
                                    <tr>
                                        <td class="fw-700 text-primary"><?= e($batch['ma_lo']) ?></td>
                                        <td><?= e($batch['ten_nong_san']) ?></td>
                                        <td><span class="text-muted small"><?= e($batch['noi_san_xuat']) ?></span></td>
                                        <td>
                                            <span class="badge rounded-pill <?= $batch['trang_thai'] === 'Đã phân phối' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info' ?> px-3">
                                                <?= e($batch['trang_thai']) ?>
                                            </span>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions Grid -->
                <div class="mt-4">
                    <h5 class="fw-800 mb-3">Thao tác nhanh</h5>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <a href="<?= BASE_URL ?>/pages/products/add.php" class="d-block p-4 rounded-4 bg-white shadow-sm text-center border-0 text-decoration-none transition-up">
                                <div class="icon-box bg-success-subtle text-success mx-auto mb-3" style="width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-plus-circle fs-4"></i>
                                </div>
                                <div class="fw-700 text-dark">Thêm nông sản</div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="<?= BASE_URL ?>/pages/batches/add.php" class="d-block p-4 rounded-4 bg-white shadow-sm text-center border-0 text-decoration-none transition-up">
                                <div class="icon-box bg-primary-subtle text-primary mx-auto mb-3" style="width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-box-seam fs-4"></i>
                                </div>
                                <div class="fw-700 text-dark">Tạo lô hàng mới</div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="<?= BASE_URL ?>/pages/processes/add.php" class="d-block p-4 rounded-4 bg-white shadow-sm text-center border-0 text-decoration-none transition-up">
                                <div class="icon-box bg-warning-subtle text-warning mx-auto mb-3" style="width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-node-plus fs-4"></i>
                                </div>
                                <div class="fw-700 text-dark">Ghi nhận tiến độ</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Timeline Sidebar -->
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm rounded-4 h-100">
                    <div class="card-header bg-white py-3 border-0">
                        <h5 class="fw-800 mb-0">Hoạt động mới nhất</h5>
                    </div>
                    <div class="card-body">
                        <div class="timeline-small">
                            <?php foreach ($recentActivities as $act): ?>
                            <div class="activity-item d-flex gap-3 mb-4 last-child-mb-0">
                                <div class="activity-icon-wrap" style="position: relative;">
                                    <div class="activity-icon bg-light text-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; z-index: 2; position: relative;">
                                        <i class="bi <?= $stageIcons[$act['giai_doan']] ?? 'bi-dot' ?>"></i>
                                    </div>
                                    <div class="activity-line" style="position: absolute; left: 20px; top: 40px; width: 2px; height: calc(100% + 1.5rem); background: #f1f5f9; z-index: 1;"></div>
                                </div>
                                <div>
                                    <p class="mb-0 fw-700 text-dark small"><?= e(str_replace('_', ' ', ucfirst($act['giai_doan']))) ?></p>
                                    <p class="mb-0 text-muted extra-small"><?= e($act['ten_nong_san']) ?> - <?= e($act['ma_lo']) ?></p>
                                    <span class="text-primary-light" style="font-size: 0.7rem; font-weight: 600;">
                                        <?= date('H:i, d/m', strtotime($act['ngay_thuc_hien'])) ?>
                                    </span>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.transition-up { transition: all 0.3s ease; }
.transition-up:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg) !important; }
.extra-small { font-size: 0.75rem; }
.last-child-mb-0:last-child { margin-bottom: 0 !important; }
.last-child-mb-0:last-child .activity-line { display: none; }
</style>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

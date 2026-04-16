<?php
/**
 * Danh sách quá trình sản xuất
 */
$pageTitle = 'Quản lý quá trình';
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$userId = $_SESSION['user_id'];
$vaiTro = getUserRole();

$sql = "SELECT qt.*, lsp.ma_lo, ns.ten_nong_san, nd.ho_ten as nguoi_ghi_nhan
        FROM qua_trinh qt
        JOIN lo_san_pham lsp ON qt.lo_san_pham_id = lsp.id
        JOIN nong_san ns ON lsp.nong_san_id = ns.id
        JOIN nguoi_dung nd ON qt.nguoi_tao_id = nd.id";
$params = [];

if ($vaiTro === 'nha_san_xuat') {
    $sql .= " WHERE qt.nguoi_tao_id = ?";
    $params[] = $userId;
}
$sql .= " ORDER BY qt.ngay_thuc_hien DESC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$processes = $stmt->fetchAll();

$stageLabels = [
    'gieo_trong' => 'Gieo trồng', 'cham_soc' => 'Chăm sóc',
    'thu_hoach' => 'Thu hoạch', 'dong_goi' => 'Đóng gói',
    'van_chuyen' => 'Vận chuyển', 'phan_phoi' => 'Phân phối'
];

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="content-page">
    <div class="container">
        <div class="page-header">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                    <li class="breadcrumb-item active">Quá trình</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h2><i class="bi bi-diagram-3 me-2"></i>Quản lý quá trình</h2>
                    <p>Ghi nhận các giai đoạn sản xuất</p>
                </div>
                <a href="<?= BASE_URL ?>/pages/processes/add.php" class="btn btn-accent">
                    <i class="bi bi-plus-lg me-1"></i>Ghi nhận mới
                </a>
            </div>
        </div>

        <div class="data-card">
            <div class="data-card-header">
                <h5>Tất cả quá trình (<?= count($processes) ?>)</h5>
            </div>
            <div class="data-card-body p-0">
                <?php if (empty($processes)): ?>
                <div class="empty-state">
                    <i class="bi bi-diagram-3 d-block"></i>
                    <h5>Chưa có quá trình nào</h5>
                </div>
                <?php else: ?>
                <div class="table-responsive">
                    <table class="table-modern">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã lô</th>
                                <th>Nông sản</th>
                                <th>Giai đoạn</th>
                                <th>Mô tả</th>
                                <th>Địa điểm</th>
                                <th>Ngày thực hiện</th>
                                <th>Người thực hiện</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($processes as $i => $p): ?>
                            <tr>
                                <td><?= $i + 1 ?></td>
                                <td>
                                    <a href="<?= BASE_URL ?>/pages/batches/detail.php?id=<?= $p['lo_san_pham_id'] ?>" class="fw-600">
                                        <?= e($p['ma_lo']) ?>
                                    </a>
                                </td>
                                <td><?= e($p['ten_nong_san']) ?></td>
                                <td>
                                    <span class="stage-label stage-<?= $p['giai_doan'] ?>">
                                        <?= $stageLabels[$p['giai_doan']] ?? $p['giai_doan'] ?>
                                    </span>
                                </td>
                                <td><small><?= e(mb_substr($p['mo_ta'], 0, 60)) ?>...</small></td>
                                <td><small class="text-muted"><?= e($p['dia_diem']) ?></small></td>
                                <td class="small"><?= date('d/m/Y H:i', strtotime($p['ngay_thuc_hien'])) ?></td>
                                <td class="small"><?= e($p['nguoi_thuc_hien']) ?></td>
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

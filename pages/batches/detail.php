<?php
/**
 * Chi tiết lô sản phẩm - Giao diện Premium
 */
$pageTitle = 'Chi tiết lô sản phẩm';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/blockchain.php';
requireLogin();

$conn = getConnection();
$id = intval($_GET['id'] ?? 0);
if (!$id) { redirect('/pages/batches/list.php'); }

// Lấy thông tin lô
$stmt = $conn->prepare(
    "SELECT lsp.*, ns.ten_nong_san, ns.mo_ta as mo_ta_nong_san, dm.ten_danh_muc, nd.ho_ten as nguoi_tao
     FROM lo_san_pham lsp
     JOIN nong_san ns ON lsp.nong_san_id = ns.id
     LEFT JOIN danh_muc dm ON ns.danh_muc_id = dm.id
     JOIN nguoi_dung nd ON lsp.nguoi_tao_id = nd.id
     WHERE lsp.id = ?"
);
$stmt->execute([$id]);
$batch = $stmt->fetch();

if (!$batch) {
    setFlash('error', 'Không tìm thấy lô sản phẩm!');
    redirect('/pages/batches/list.php');
}

// Lấy quá trình
$stmt = $conn->prepare(
    "SELECT qt.*, nd.ho_ten as nguoi_ghi_nhan
     FROM qua_trinh qt
     JOIN nguoi_dung nd ON qt.nguoi_tao_id = nd.id
     WHERE qt.lo_san_pham_id = ?
     ORDER BY qt.ngay_thuc_hien ASC"
);
$stmt->execute([$id]);
$processes = $stmt->fetchAll();

// Blockchain verification (Simulated)
$blockchain = new BlockchainSimulator();
$verification = $blockchain->verifyChain($id);
$chain = $blockchain->getChain($id);

$stageLabels = [
    'gieo_trong' => 'Gieo trồng', 'cham_soc' => 'Chăm sóc',
    'thu_hoach' => 'Thu hoạch', 'dong_goi' => 'Đóng gói',
    'van_chuyen' => 'Vận chuyển', 'phan_phoi' => 'Phân phối'
];
$stageIcons = [
    'gieo_trong' => 'bi-flower1', 'cham_soc' => 'bi-droplet-half',
    'thu_hoach' => 'bi-basket2', 'dong_goi' => 'bi-box-seam',
    'van_chuyen' => 'bi-truck', 'phan_phoi' => 'bi-shop'
];

$traceUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . BASE_URL . '/pages/trace.php?code=' . urlencode($batch['ma_truy_xuat']);

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="dashboard-page py-4">
    <div class="container">
        <!-- Modern Header -->
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-1">
                        <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/dashboard.php">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="<?= BASE_URL ?>/pages/batches/list.php">Lô sản phẩm</a></li>
                    </ol>
                </nav>
                <h2 class="fw-800 mb-0"><i class="bi bi-box-seam me-2 text-primary"></i>Lô hàng: <?= e($batch['ma_lo']) ?></h2>
            </div>
            <div class="d-flex gap-2">
                <button onclick="window.print()" class="btn btn-outline-secondary rounded-pill px-3">
                    <i class="bi bi-printer me-1"></i>In nhãn
                </button>
                <?php if (hasRole('admin') || hasRole('nha_san_xuat')): ?>
                <a href="<?= BASE_URL ?>/pages/processes/add.php?lo_id=<?= $id ?>" class="btn btn-primary rounded-pill px-4">
                    <i class="bi bi-plus-lg me-1"></i>Ghi nhận tiến độ
                </a>
                <?php endif; ?>
            </div>
        </div>

        <div class="row g-4">
            <!-- Main Content: Product Info & Timeline -->
            <div class="col-lg-8">
                <!-- Info Card -->
                <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                    <div class="card-body p-0">
                        <div class="p-4 bg-light border-bottom d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-primary text-white p-3 rounded-4 shadow-sm">
                                    <i class="bi bi-leaf fs-3"></i>
                                </div>
                                <div>
                                    <h4 class="fw-800 mb-0"><?= e($batch['ten_nong_san']) ?></h4>
                                    <span class="text-muted small"><?= e($batch['ten_danh_muc'] ?? 'Nông sản') ?></span>
                                </div>
                            </div>
                            <span class="badge rounded-pill <?= $batch['trang_thai'] === 'Đã phân phối' ? 'bg-success text-white' : 'bg-primary text-white' ?> px-3 py-2">
                                <?= e($batch['trang_thai']) ?>
                            </span>
                        </div>
                        <div class="p-4">
                            <div class="row g-4">
                                <div class="col-md-4">
                                    <label class="text-muted small fw-600 d-block mb-1">Mã truy xuất</label>
                                    <span class="fw-700 text-primary fs-5"><?= e($batch['ma_truy_xuat']) ?></span>
                                </div>
                                <div class="col-md-4">
                                    <label class="text-muted small fw-600 d-block mb-1">Nơi sản xuất</label>
                                    <span class="fw-700 text-dark"><?= e($batch['noi_san_xuat']) ?></span>
                                </div>
                                <div class="col-md-4">
                                    <label class="text-muted small fw-600 d-block mb-1">Số lượng lô</label>
                                    <span class="fw-700 text-dark"><?= number_format($batch['so_luong']) ?> <?= e($batch['don_vi']) ?></span>
                                </div>
                                <div class="col-md-4">
                                    <label class="text-muted small fw-600 d-block mb-1">Ngày gieo trồng</label>
                                    <span class="fw-700 text-dark"><?= $batch['ngay_gieo_trong'] ? date('d/m/Y', strtotime($batch['ngay_gieo_trong'])) : '---' ?></span>
                                </div>
                                <div class="col-md-4">
                                    <label class="text-muted small fw-600 d-block mb-1">Ngày thu hoạch</label>
                                    <span class="fw-700 text-dark"><?= $batch['ngay_thu_hoach'] ? date('d/m/Y', strtotime($batch['ngay_thu_hoach'])) : '---' ?></span>
                                </div>
                                <div class="col-md-4">
                                    <label class="text-muted small fw-600 d-block mb-1">Nhà sản xuất</label>
                                    <span class="fw-700 text-dark"><?= e($batch['nguoi_tao']) ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timeline Section -->
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-header bg-white py-3 border-0">
                        <h5 class="fw-800 mb-0">Quá trình sản xuất & Kiểm soát</h5>
                    </div>
                    <div class="card-body">
                        <?php if (empty($processes)): ?>
                        <div class="text-center py-5">
                            <i class="bi bi-slash-circle text-muted fs-1 mb-3 d-block"></i>
                            <p class="text-muted">Chưa có bản ghi quá trình nào được cập nhật.</p>
                        </div>
                        <?php else: ?>
                        <div class="timeline-modern">
                            <?php foreach ($processes as $proc): ?>
                            <div class="timeline-item d-flex gap-4 mb-4" style="position: relative;">
                                <div class="timeline-v-line" style="position: absolute; left: 19px; top: 40px; width: 2px; height: calc(100% + 1rem); background: #e2e8f0; z-index: 1;"></div>
                                <div class="timeline-marker bg-white border border-4 border-primary rounded-circle shadow-sm" style="width: 40px; height: 40px; flex-shrink: 0; z-index: 2; position: relative; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi <?= $stageIcons[$proc['giai_doan']] ?? 'bi-dot' ?> text-primary"></i>
                                </div>
                                <div class="timeline-content p-4 rounded-4 bg-light w-100 shadow-sm border-0 transition-up">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <div class="badge bg-primary-subtle text-primary border-0 rounded-pill px-3 py-1">
                                            <?= $stageLabels[$proc['giai_doan']] ?? $proc['giai_doan'] ?>
                                        </div>
                                        <small class="text-muted"><i class="bi bi-clock me-1"></i><?= date('H:i, d/m/Y', strtotime($proc['ngay_thuc_hien'])) ?></small>
                                    </div>
                                    <h6 class="fw-800 text-dark mb-2"><?= e($proc['mo_ta']) ?></h6>
                                    <div class="row g-2 mt-2">
                                        <div class="col-auto">
                                            <span class="badge bg-white text-muted border px-2 py-1 small">
                                                <i class="bi bi-geo-alt me-1"></i><?= e($proc['dia_diem']) ?>
                                            </span>
                                        </div>
                                        <div class="col-auto">
                                            <span class="badge bg-white text-muted border px-2 py-1 small">
                                                <i class="bi bi-person me-1"></i><?= e($proc['nguoi_ghi_nhan']) ?>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
                <!-- QR Code Card -->
                <div class="card border-0 shadow-sm rounded-4 mb-4 text-center">
                    <div class="card-header bg-white py-3 border-0">
                        <h5 class="fw-800 mb-0">Truy xuất QR Code</h5>
                    </div>
                    <div class="card-body">
                        <div class="qr-box p-3 bg-white border rounded-4 d-inline-block shadow-sm mb-3">
                            <div id="qrcode" data-qr="<?= e($traceUrl) ?>" data-qr-size="200"></div>
                        </div>
                        <p class="text-muted small mb-2">Mã QR định danh duy nhất cho lô hàng này</p>
                        <hr class="my-3 opacity-10">
                        <p class="fw-800 text-primary mb-3"><?= e($batch['ma_truy_xuat']) ?></p>
                        <a href="<?= BASE_URL ?>/pages/trace.php?code=<?= urlencode($batch['ma_truy_xuat']) ?>" class="btn btn-outline-primary w-100 rounded-pill">
                            <i class="bi bi-arrow-up-right-circle me-1"></i>Xem trang công khai
                        </a>
                    </div>
                </div>

                <!-- Transparency Summary -->
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-header bg-white py-3 border-0">
                        <h5 class="fw-800 mb-0">Độ minh bạch dữ liệu</h5>
                    </div>
                    <div class="card-body p-0">
                        <ul class="list-group list-group-flush border-0">
                            <li class="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-0 border-bottom">
                                <span class="text-muted fw-600">Giai đoạn ghi nhận</span>
                                <span class="fw-800"><?= count($processes) ?>/6</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-0 border-bottom">
                                <span class="text-muted fw-600">Bản ghi xác thực</span>
                                <span class="fw-800 transition-up px-3 py-1 bg-success-subtle rounded-pill text-success"><?= count($chain) ?></span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-0">
                                <span class="text-muted fw-600">Xác thực hệ thống</span>
                                <span class="badge rounded-pill <?= $verification['valid'] ? 'bg-success' : 'bg-warning text-dark' ?> px-3 py-2">
                                    <i class="bi bi-<?= $verification['valid'] ? 'check-circle' : 'exclamation-circle' ?> me-1"></i>
                                    <?= $verification['valid'] ? 'Đã xác thực' : 'Đang xử lý' ?>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.timeline-modern .timeline-item:last-child .timeline-v-line { display: none; }
.extra-small { font-size: 0.7rem; }
</style>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>

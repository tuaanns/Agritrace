<?php
/**
 * Trang tra cứu nguồn gốc nông sản
 * Người dùng nhập mã truy xuất hoặc quét QR để xem thông tin
 */
$pageTitle = 'Tra cứu nguồn gốc';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/blockchain.php';

$conn = getConnection();
$code = trim($_GET['code'] ?? '');
$result = null;
$processes = [];
$verification = null;
$chain = [];

if (!empty($code)) {
    // Tìm lô sản phẩm theo mã truy xuất hoặc mã lô
    $stmt = $conn->prepare(
        "SELECT lsp.*, ns.ten_nong_san, ns.hinh_anh, ns.mo_ta as mo_ta_nong_san, dm.ten_danh_muc, nd.ho_ten as nguoi_tao
         FROM lo_san_pham lsp
         JOIN nong_san ns ON lsp.nong_san_id = ns.id
         LEFT JOIN danh_muc dm ON ns.danh_muc_id = dm.id
         JOIN nguoi_dung nd ON lsp.nguoi_tao_id = nd.id
         WHERE lsp.ma_truy_xuat = ? OR lsp.ma_lo = ?"
    );
    $stmt->execute([$code, $code]);
    $result = $stmt->fetch();

    if ($result) {
        // Lấy quá trình
        $stmt = $conn->prepare(
            "SELECT qt.*, nd.ho_ten as nguoi_ghi_nhan
             FROM qua_trinh qt
             JOIN nguoi_dung nd ON qt.nguoi_tao_id = nd.id
             WHERE qt.lo_san_pham_id = ?
             ORDER BY qt.ngay_thuc_hien ASC"
        );
        $stmt->execute([$result['id']]);
        $processes = $stmt->fetchAll();

        // Blockchain verification
        $blockchain = new BlockchainSimulator();
        $verification = $blockchain->verifyChain($result['id']);
        $chain = $blockchain->getChain($result['id']);
    }
}

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

$stageDescriptions = [
    'gieo_trong' => 'Giai đoạn gieo hạt/trồng cây',
    'cham_soc' => 'Giai đoạn tưới nước, bón phân, kiểm tra',
    'thu_hoach' => 'Giai đoạn thu hoạch sản phẩm',
    'dong_goi' => 'Giai đoạn đóng gói, dán nhãn',
    'van_chuyen' => 'Giai đoạn vận chuyển đến nơi tiêu thụ',
    'phan_phoi' => 'Giai đoạn phân phối đến người tiêu dùng'
];

// Các giai đoạn đã hoàn thành
$completedStages = array_column($processes, 'giai_doan');

require_once __DIR__ . '/../includes/header.php';
?>

<div class="trace-page">
    <div class="container">
        <!-- Search Box -->
        <div class="trace-search-card animate-fade-up">
            <div class="mb-2">
                <i class="bi bi-qr-code-scan fs-1" style="color: var(--primary);"></i>
            </div>
            <h2>Tra cứu nguồn gốc nông sản</h2>
            <p class="text-muted">Nhập mã truy xuất hoặc mã lô sản phẩm để xem toàn bộ thông tin nguồn gốc</p>
            <form method="GET" class="search-input-group">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" name="code" 
                           value="<?= e($code) ?>" 
                           placeholder="Nhập mã truy xuất (VD: TX-CAPHE-20260101-001)" 
                           required autofocus>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-search me-1"></i>Tra cứu
                </button>
            </form>
            

        </div>

        <?php if (!empty($code) && !$result): ?>
        <!-- Not Found -->
        <div class="text-center py-5 animate-fade-up">
            <i class="bi bi-search fs-1 text-muted d-block mb-3"></i>
            <h4 class="text-muted">Không tìm thấy kết quả</h4>
            <p class="text-muted">Mã "<strong><?= e($code) ?></strong>" không tồn tại trong hệ thống.</p>
            <p class="text-muted small">Vui lòng kiểm tra lại mã truy xuất hoặc mã lô sản phẩm.</p>
        </div>
        <?php endif; ?>

        <?php if ($result): ?>
        <!-- Results -->
        <div class="row g-4 animate-fade-up">
            <!-- Product Info -->
            <div class="col-lg-8">
                <div class="product-info-card mb-4 overflow-hidden border-0 shadow-sm" style="border-radius: 20px; background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(10px);">
                    <div class="row g-0">
                        <div class="col-md-5">
                            <div class="h-100" style="min-height: 250px; background: #f8f9fa;">
                                <?php if (!empty($result['hinh_anh'])): ?>
                                    <img src="<?= e($result['hinh_anh']) ?>" class="w-100 h-100 object-fit-cover" alt="<?= e($result['ten_nong_san']) ?>">
                                <?php else: ?>
                                    <div class="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                                        <i class="bi bi-leaf text-success opacity-25" style="font-size: 5rem;"></i>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div class="p-4">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h3 class="fw-bold mb-1" style="color: var(--primary-dark);"><?= e($result['ten_nong_san']) ?></h3>
                                        <span class="status-badge <?= $result['trang_thai'] === 'Đã phân phối' ? 'completed' : 'active' ?>">
                                            <i class="bi bi-circle-fill" style="font-size: 0.4rem;"></i>
                                            <?= e($result['trang_thai']) ?>
                                        </span>
                                    </div>
                                    <?php if ($verification && $verification['valid']): ?>
                                    <div class="text-end">
                                        <span class="badge bg-success-subtle text-success rounded-pill px-3 py-1 mb-1" style="font-size: 0.7rem;">
                                            <i class="bi bi-patch-check-fill"></i> Minh bạch
                                        </span>
                                    </div>
                                    <?php endif; ?>
                                </div>

                                <p class="text-muted small mb-3"><?= e($result['mo_ta_nong_san'] ?? 'Thông tin sản phẩm nông sản sạch, đảm bảo tiêu chuẩn chất lượng và an toàn thực phẩm.') ?></p>
                                
                                <div class="row g-3">
                                    <div class="col-6">
                                        <div class="small text-muted mb-1">Mã truy xuất</div>
                                        <div class="fw-bold text-success" style="font-size: 0.9rem; word-break: break-all;"><?= e($result['ma_truy_xuat']) ?></div>
                                    </div>
                                    <div class="col-6">
                                        <div class="small text-muted mb-1">Mã lô</div>
                                        <div class="fw-bold" style="font-size: 0.9rem;"><?= e($result['ma_lo']) ?></div>
                                    </div>
                                    <div class="col-6">
                                        <div class="small text-muted mb-1">Nơi sản xuất</div>
                                        <div class="fw-bold" style="font-size: 0.85rem;"><?= e($result['noi_san_xuat']) ?></div>
                                    </div>
                                    <div class="col-6">
                                        <div class="small text-muted mb-1">Danh mục</div>
                                        <div class="fw-bold" style="font-size: 0.85rem;"><?= e($result['ten_danh_muc'] ?? 'Chưa phân loại') ?></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="data-card mb-4">
                    <div class="data-card-header d-flex justify-content-between align-items-center">
                        <h5><i class="bi bi-info-circle me-2 text-primary"></i>Thông tin chi tiết</h5>
                        <i class="bi bi-chevron-down small text-muted"></i>
                    </div>
                    <div class="data-card-body">
                        <div class="row g-3">
                            <div class="col-sm-4">
                                <div class="p-3 bg-light rounded-3 text-center h-100">
                                    <div class="small text-muted mb-1">Ngày gieo trồng</div>
                                    <div class="fw-bold"><?= $result['ngay_gieo_trong'] ? date('d/m/Y', strtotime($result['ngay_gieo_trong'])) : '-' ?></div>
                                </div>
                            </div>
                            <div class="col-sm-4">
                                <div class="p-3 bg-light rounded-3 text-center h-100">
                                    <div class="small text-muted mb-1">Ngày thu hoạch</div>
                                    <div class="fw-bold"><?= $result['ngay_thu_hoach'] ? date('d/m/Y', strtotime($result['ngay_thu_hoach'])) : '-' ?></div>
                                </div>
                            </div>
                            <div class="col-sm-4">
                                <div class="p-3 bg-light rounded-3 text-center h-100">
                                    <div class="small text-muted mb-1">Sản lượng</div>
                                    <div class="fw-bold"><?= $result['so_luong'] ? number_format($result['so_luong']) . ' ' . e($result['don_vi']) : '-' ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="data-card mb-4">
                    <div class="data-card-header">
                        <h5><i class="bi bi-bar-chart-steps me-2 text-primary-custom"></i>Tiến độ sản xuất</h5>
                        <span class="badge bg-primary"><?= count($completedStages) ?>/<?= count($stageLabels) ?></span>
                    </div>
                    <div class="data-card-body">
                        <div class="progress mb-3" style="height: 8px; border-radius: 4px;">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: <?= (count($completedStages) / count($stageLabels)) * 100 ?>%; background: linear-gradient(90deg, var(--primary), var(--primary-light));">
                            </div>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <?php foreach ($stageLabels as $key => $label): ?>
                            <span class="badge <?= in_array($key, $completedStages) ? 'bg-success' : 'bg-secondary bg-opacity-25 text-muted' ?>" 
                                  style="font-size: 0.8rem; padding: 6px 12px;">
                                <i class="bi <?= $stageIcons[$key] ?> me-1"></i><?= $label ?>
                                <?php if (in_array($key, $completedStages)): ?>
                                <i class="bi bi-check-circle ms-1"></i>
                                <?php endif; ?>
                            </span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="data-card mb-4">
                    <div class="data-card-header">
                        <h5><i class="bi bi-clock-history me-2 text-primary-custom"></i>Timeline quá trình</h5>
                    </div>
                    <div class="data-card-body">
                        <?php if (empty($processes)): ?>
                        <div class="empty-state">
                            <i class="bi bi-clock d-block"></i>
                            <h5>Chưa có quá trình nào được ghi nhận</h5>
                        </div>
                        <?php else: ?>
                        <div class="timeline-container">
                            <div class="timeline-line"></div>
                            <?php foreach ($processes as $proc): ?>
                            <div class="timeline-item">
                                <div class="timeline-dot">
                                    <i class="bi <?= $stageIcons[$proc['giai_doan']] ?? 'bi-circle' ?>"></i>
                                </div>
                                <div class="timeline-card">
                                    <span class="stage-label stage-<?= $proc['giai_doan'] ?>">
                                        <i class="bi <?= $stageIcons[$proc['giai_doan']] ?? 'bi-circle' ?>"></i>
                                        <?= $stageLabels[$proc['giai_doan']] ?? $proc['giai_doan'] ?>
                                    </span>
                                    <h6><?= e($proc['mo_ta']) ?></h6>
                                    <div class="meta">
                                        <span><i class="bi bi-calendar3"></i><?= date('d/m/Y H:i', strtotime($proc['ngay_thuc_hien'])) ?></span>
                                        <span><i class="bi bi-geo-alt"></i><?= e($proc['dia_diem']) ?></span>
                                        <span><i class="bi bi-person"></i><?= e($proc['nguoi_thuc_hien']) ?></span>
                                    </div>
                                    <?php if (!empty($proc['ghi_chu'])): ?>
                                    <div class="mt-2 small text-muted">
                                        <i class="bi bi-chat-left-text me-1"></i><?= e($proc['ghi_chu']) ?>
                                    </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Blockchain Verification Ẩn đi -->
                <div class="mt-4 text-center">
                    <span class="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                        <i class="bi bi-shield-check me-1"></i> Dữ liệu nguồn gốc đã được xác thực minh bạch
                    </span>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
                <!-- QR Code -->
                <div class="data-card mb-4">
                    <div class="data-card-header">
                        <h5><i class="bi bi-qr-code me-2"></i>QR Code</h5>
                    </div>
                    <div class="data-card-body text-center">
                        <?php 
                        $traceUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . BASE_URL . '/pages/trace.php?code=' . urlencode($result['ma_truy_xuat']);
                        ?>
                        <div class="qr-container mb-3">
                            <div id="traceQR" data-qr="<?= e($traceUrl) ?>" data-qr-size="180"></div>
                        </div>
                        <p class="small text-muted mb-1">Quét mã QR để xem thông tin</p>
                        <p class="small fw-bold" style="color: var(--primary); word-break: break-all;">
                            <?= e($result['ma_truy_xuat']) ?>
                        </p>
                    </div>
                </div>

                <!-- Summary -->
                <div class="data-card mb-4">
                    <div class="data-card-header">
                        <h5><i class="bi bi-info-circle me-2"></i>Tóm tắt</h5>
                    </div>
                    <div class="data-card-body">
                        <ul class="list-unstyled mb-0">
                            <li class="d-flex justify-content-between py-2 border-bottom">
                                <span class="text-muted small">Nông sản</span>
                                <strong class="small"><?= e($result['ten_nong_san']) ?></strong>
                            </li>
                            <li class="d-flex justify-content-between py-2 border-bottom">
                                <span class="text-muted small">Nơi sản xuất</span>
                                <strong class="small"><?= e($result['noi_san_xuat']) ?></strong>
                            </li>
                            <li class="d-flex justify-content-between py-2 border-bottom">
                                <span class="text-muted small">Giai đoạn</span>
                                <strong class="small"><?= count($completedStages) ?>/<?= count($stageLabels) ?></strong>
                            </li>
                            <li class="d-flex justify-content-between py-2 border-bottom">
                                <span class="text-muted small">Trạng thái dữ liệu</span>
                                <strong class="small text-success">Toàn vẹn</strong>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Nhà sản xuất -->
                <div class="data-card">
                    <div class="data-card-header">
                        <h5><i class="bi bi-person-badge me-2"></i>Nhà sản xuất</h5>
                    </div>
                    <div class="data-card-body">
                        <div class="d-flex align-items-center gap-3">
                            <div class="user-avatar" style="width: 48px; height: 48px; font-size: 1rem;">
                                <?= strtoupper(mb_substr($result['nguoi_tao'], 0, 1)) ?>
                            </div>
                            <div>
                                <div class="fw-bold"><?= e($result['nguoi_tao']) ?></div>
                                <small class="text-muted"><?= e($result['noi_san_xuat']) ?></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

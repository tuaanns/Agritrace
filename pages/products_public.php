<?php
/**
 * Danh sách nông sản công khai (Dành cho người tiêu dùng)
 */
$pageTitle = 'Danh sách sản phẩm';
require_once __DIR__ . '/../config/database.php';

$conn = getConnection();

// Lấy danh sách các lô sản phẩm mới nhất
$stmt = $conn->query(
    "SELECT lsp.*, ns.ten_nong_san, ns.hinh_anh, ns.mo_ta as mo_ta_nong_san, dm.ten_danh_muc, nd.ho_ten as nha_san_xuat
     FROM lo_san_pham lsp
     JOIN nong_san ns ON lsp.nong_san_id = ns.id
     LEFT JOIN danh_muc dm ON ns.danh_muc_id = dm.id
     JOIN nguoi_dung nd ON lsp.nguoi_tao_id = nd.id
     ORDER BY lsp.ngay_tao DESC"
);
$products = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>
<style>
.product-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    border: 1px solid rgba(0,0,0,0.08) !important;
    background: #fff !important;
    border-radius: 24px !important;
}
.product-card:hover {
    transform: translateY(-12px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
}
.product-img-wrapper {
    position: relative;
    height: 220px;
    overflow: hidden;
    border-radius: 24px 24px 0 0;
}
.product-img-wrapper img {
    transition: transform 0.7s ease;
}
.product-card:hover .product-img-wrapper img {
    transform: scale(1.1);
}
.category-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    color: #065f46;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 0.75rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    z-index: 2;
}
.trace-code-pill {
    background: #ecfdf5;
    border: 1px dashed #10b981;
    border-radius: 16px;
    padding: 12px;
}
</style>

<div class="content-page">
    <div class="container">
        <div class="page-header animate-fade-up text-center mb-5">
            <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-2">Hệ thống minh bạch</span>
            <h1 class="fw-bold display-6 mb-2">Sản phẩm Nông nghiệp</h1>
            <p class="text-muted mx-auto" style="max-width: 600px;">Khám phá danh mục nông sản sạch và tra cứu toàn bộ hành trình từ nông trại đến tay bạn.</p>
        </div>

        <div class="row g-4 justify-content-center">
            <?php if (empty($products)): ?>
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <h5 class="text-muted mt-3">Hiện chưa có sản phẩm nào được niêm yết</h5>
            </div>
            <?php else: ?>
                <?php foreach ($products as $p): ?>
                <div class="col-lg-4 col-md-6 mb-4 animate-fade-up">
                    <div class="data-card h-100 product-card border-0 overflow-hidden">
                        <div class="data-card-body p-0">
                            <!-- Hình ảnh Nông sản -->
                            <div class="product-img-wrapper">
                                <div class="category-badge">
                                    <i class="bi bi-tag-fill me-1"></i><?= e($p['ten_danh_muc'] ?? 'Nông sản') ?>
                                </div>
                                <?php if (!empty($p['hinh_anh'])): ?>
                                    <img src="<?= e($p['hinh_anh']) ?>" class="w-100 h-100 object-fit-cover" alt="<?= e($p['ten_nong_san']) ?>">
                                <?php else: ?>
                                    <div class="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                                        <i class="bi bi-leaf text-success opacity-10" style="font-size: 5rem;"></i>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <!-- Nội dung -->
                            <div class="p-4">
                                <div class="mb-3">
                                    <h4 class="fw-bold text-dark mb-1"><?= e($p['ten_nong_san']) ?></h4>
                                    <div class="d-flex align-items-center gap-2 text-muted small">
                                        <span><i class="bi bi-geo-alt me-1"></i><?= e($p['noi_san_xuat']) ?></span>
                                        <span class="text-secondary opacity-50">•</span>
                                        <span><i class="bi bi-person me-1"></i><?= e($p['nha_san_xuat']) ?></span>
                                    </div>
                                </div>

                                <div class="trace-code-pill mb-4">
                                    <small class="text-success fw-bold d-block mb-1 text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">Mã truy xuất nguồn gốc</small>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <code class="fs-6 fw-bold" style="color: #065f46;"><?= e($p['ma_truy_xuat']) ?></code>
                                        <i class="bi bi-patch-check-fill text-success"></i>
                                    </div>
                                </div>

                                <a href="<?= BASE_URL ?>/pages/trace.php?code=<?= urlencode($p['ma_truy_xuat']) ?>" 
                                   class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                    <span>Tra cứu hành trình</span>
                                    <i class="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<style>
.shadow-hover {
    transition: all 0.3s ease;
}
.shadow-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
}
</style>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

<?php
/**
 * Trang chủ - AgriTrace
 * Hệ thống truy xuất nguồn gốc nông sản
 */
$pageTitle = 'Trang chủ';
require_once __DIR__ . '/config/database.php';

// Lấy thống kê
$conn = getConnection();
$stats = [];

$stmt = $conn->query("SELECT COUNT(*) as total FROM nong_san");
$stats['nong_san'] = $stmt->fetch()['total'];

$stmt = $conn->query("SELECT COUNT(*) as total FROM lo_san_pham");
$stats['lo_san_pham'] = $stmt->fetch()['total'];

$stmt = $conn->query("SELECT COUNT(*) as total FROM qua_trinh");
$stats['qua_trinh'] = $stmt->fetch()['total'];

$stmt = $conn->query("SELECT COUNT(*) as total FROM blockchain");
$stats['blockchain'] = $stmt->fetch()['total'];

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <div class="hero-content">
                    <div class="hero-badge">
                        <i class="bi bi-shield-check"></i>
                        Xác minh minh bạch
                    </div>
                    <h1 class="hero-title">
                        Truy xuất nguồn gốc<br>
                        <span class="highlight">Nông sản an toàn</span>
                    </h1>
                    <p class="hero-description">
                        Hệ thống quản lý và truy xuất nguồn gốc nông sản hiện đại, 
                        đảm bảo minh bạch dữ liệu từ trang trại đến bàn ăn.
                    </p>
                    <div class="hero-buttons">
                        <a href="<?= BASE_URL ?>/pages/trace.php" class="btn btn-primary btn-lg px-4">
                            <i class="bi bi-search me-2"></i>Tra cứu ngay
                        </a>
                        <?php if (!isLoggedIn()): ?>
                        <a href="<?= BASE_URL ?>/pages/register.php" class="btn btn-outline-light btn-lg px-4">
                            <i class="bi bi-person-plus me-2"></i>Đăng ký
                        </a>
                        <?php endif; ?>
                    </div>
                    <div class="hero-stats">
                        <div class="hero-stat">
                            <div class="hero-stat-value"><?= $stats['nong_san'] ?>+</div>
                            <div class="hero-stat-label">Nông sản</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-value"><?= $stats['lo_san_pham'] ?>+</div>
                            <div class="hero-stat-label">Lô sản phẩm</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-value"><?= $stats['blockchain'] ?>+</div>
                            <div class="hero-stat-label">Dữ liệu xác thực</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 d-none d-lg-block">
                <div class="hero-image">
                    <div class="hero-card">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="product-icon">
                                <i class="bi bi-tree"></i>
                            </div>
                            <div>
                                <h6 class="mb-0">Chuỗi dữ liệu truy xuất</h6>
                                <small class="text-muted" style="color: rgba(255,255,255,0.5) !important;">Xác minh thông tin thời gian thực</small>
                            </div>
                        </div>
                        <div class="blockchain-visual">
                            <div class="block-node">🌱</div>

                            <div class="block-node">💧</div>

                            <div class="block-node">🌾</div>

                            <div class="block-node">📦</div>
                        </div>
                        <div class="mt-3 d-flex align-items-center gap-2">
                            <span class="verify-status valid">
                                <i class="bi bi-patch-check-fill"></i> Xác minh thành công
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features-section" id="features">
    <div class="container">
        <h2 class="section-title">Tính năng nổi bật</h2>
        <p class="section-subtitle">Hệ thống quản lý thông tin minh bạch, chính xác và đáng tin cậy</p>
        <div class="row g-4">
            <div class="col-lg-4 col-md-6">
                <div class="feature-card observe-scroll">
                    <div class="feature-icon green">
                        <i class="bi bi-qr-code-scan"></i>
                    </div>
                    <h5>Quét QR Code</h5>
                    <p>Tra cứu nguồn gốc chỉ bằng việc quét mã QR trên sản phẩm hoặc nhập mã truy xuất.</p>
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="feature-card observe-scroll">
                    <div class="feature-icon blue">
                        <i class="bi bi-shield-lock"></i>
                    </div>
                    <h5>Bảo mật đa tầng</h5>
                    <p>Dữ liệu được mã hóa và lưu trữ an toàn, đảm bảo tính toàn vẹn của thông tin.</p>
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="feature-card observe-scroll">
                    <div class="feature-icon orange">
                        <i class="bi bi-diagram-3"></i>
                    </div>
                    <h5>Timeline đầy đủ</h5>
                    <p>Theo dõi toàn bộ quá trình từ gieo trồng, chăm sóc, thu hoạch đến phân phối.</p>
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="feature-card observe-scroll">
                    <div class="feature-icon purple">
                        <i class="bi bi-speedometer2"></i>
                    </div>
                    <h5>Dashboard trực quan</h5>
                    <p>Bảng điều khiển hiển thị thống kê, biểu đồ và quản lý dữ liệu dễ dàng.</p>
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="feature-card observe-scroll">
                    <div class="feature-icon red">
                        <i class="bi bi-people"></i>
                    </div>
                    <h5>Phân quyền người dùng</h5>
                    <p>Hệ thống phân quyền rõ ràng: Admin, Nhà sản xuất, Người tiêu dùng.</p>
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="feature-card observe-scroll">
                    <div class="feature-icon teal">
                        <i class="bi bi-patch-check"></i>
                    </div>
                    <h5>Xác minh dữ liệu</h5>
                    <p>Hệ thống tự động kiểm tra và xác thực tính chính xác của mọi thông tin truy xuất.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section style="padding: 4rem 0; background: linear-gradient(135deg, var(--primary-darker), #064e3b);">
    <div class="container text-center">
        <h2 class="text-white mb-3" style="font-weight: 800; font-size: 2rem;">Bắt đầu tra cứu ngay</h2>
        <p class="text-white-50 mb-4" style="max-width: 500px; margin: 0 auto;">
            Nhập mã truy xuất để kiểm tra nguồn gốc sản phẩm nông sản
        </p>
        <form action="<?= BASE_URL ?>/pages/trace.php" method="GET" class="d-flex justify-content-center gap-2" style="max-width: 500px; margin: 0 auto;">
            <input type="text" name="code" class="form-control form-control-lg" placeholder="Nhập mã truy xuất..." style="border-radius: 12px;">
            <button type="submit" class="btn btn-accent btn-lg px-4" style="border-radius: 12px;">
                <i class="bi bi-search"></i>
            </button>
        </form>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

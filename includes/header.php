<?php
/**
 * Header chung cho toàn bộ hệ thống
 */
require_once __DIR__ . '/../config/database.php';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
$flash = getFlash();
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Hệ thống quản lý và truy xuất nguồn gốc nông sản minh bạch - Đảm bảo an toàn thực phẩm">
    <title><?= e($pageTitle ?? 'Truy xuất nguồn gốc nông sản') ?> | AgriTrace</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- QRCode.js -->
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <!-- Custom CSS -->
    <link href="<?= BASE_URL ?>/assets/css/style.css?v=4.0" rel="stylesheet">
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNavbar">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="<?= BASE_URL ?>/">
            <i class="bi bi-tree-fill me-2 brand-icon"></i>
            <span class="brand-text">AgriTrace</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item">
                    <a class="nav-link <?= $currentPage === 'index' ? 'active' : '' ?>" href="<?= BASE_URL ?>/">
                        <i class="bi bi-house-fill me-1"></i>Trang chủ
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $currentPage === 'products_public' ? 'active' : '' ?>" href="<?= BASE_URL ?>/pages/products_public.php">
                        <i class="bi bi-basket me-1"></i>Sản phẩm
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $currentPage === 'trace' ? 'active' : '' ?>" href="<?= BASE_URL ?>/pages/trace.php">
                        <i class="bi bi-search me-1"></i>Tra cứu
                    </a>
                </li>
                <?php if (isLoggedIn()): ?>
                    <li class="nav-item">
                        <a class="nav-link <?= $currentPage === 'dashboard' ? 'active' : '' ?>" href="<?= BASE_URL ?>/pages/dashboard.php">
                            <i class="bi bi-speedometer2 me-1"></i>Dashboard
                        </a>
                    </li>
                    <?php if (hasRole('admin') || hasRole('nha_san_xuat')): ?>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                            <i class="bi bi-box-seam me-1"></i>Quản lý
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item" href="<?= BASE_URL ?>/pages/products/list.php">
                                <i class="bi bi-leaf me-2"></i>Nông sản
                            </a></li>
                            <li><a class="dropdown-item" href="<?= BASE_URL ?>/pages/batches/list.php">
                                <i class="bi bi-boxes me-2"></i>Lô sản phẩm
                            </a></li>
                            <li><a class="dropdown-item" href="<?= BASE_URL ?>/pages/processes/list.php">
                                <i class="bi bi-diagram-3 me-2"></i>Quá trình
                            </a></li>
                        </ul>
                    </li>
                    <?php endif; ?>
                    <?php if (hasRole('admin')): ?>
                    <li class="nav-item">
                        <a class="nav-link <?= $currentPage === 'users' ? 'active' : '' ?>" href="<?= BASE_URL ?>/pages/admin/users.php">
                            <i class="bi bi-people me-1"></i>Người dùng
                        </a>
                    </li>
                    <?php endif; ?>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle user-dropdown" href="#" role="button" data-bs-toggle="dropdown">
                            <div class="user-avatar">
                                <?= strtoupper(substr($_SESSION['ho_ten'], 0, 1)) ?>
                            </div>
                            <span class="d-none d-lg-inline"><?= e($_SESSION['ho_ten']) ?></span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                            <li><span class="dropdown-item-text text-muted small">
                                <i class="bi bi-person-badge me-1"></i><?= e($_SESSION['vai_tro']) ?>
                            </span></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="<?= BASE_URL ?>/logout.php">
                                <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                            </a></li>
                        </ul>
                    </li>
                <?php else: ?>
                    <li class="nav-item">
                        <a class="nav-link" href="<?= BASE_URL ?>/pages/login.php">
                            <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-accent btn-sm ms-2 px-3" href="<?= BASE_URL ?>/pages/register.php">
                            Đăng ký
                        </a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>

<!-- Flash Messages -->
<?php if ($flash): ?>
<div class="container mt-5 pt-4">
    <div class="alert alert-<?= $flash['type'] === 'error' ? 'danger' : $flash['type'] ?> alert-dismissible fade show shadow-sm" role="alert">
        <i class="bi bi-<?= $flash['type'] === 'success' ? 'check-circle' : ($flash['type'] === 'error' ? 'exclamation-triangle' : 'info-circle') ?> me-2"></i>
        <?= e($flash['message']) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
</div>
<?php endif; ?>

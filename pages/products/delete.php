<?php
/**
 * Xóa nông sản
 */
require_once __DIR__ . '/../../config/database.php';
requireRole(['admin', 'nha_san_xuat']);

$conn = getConnection();
$id = intval($_GET['id'] ?? 0);

if (!$id) { redirect('/pages/products/list.php'); }

// Kiểm tra nông sản tồn tại
$stmt = $conn->prepare("SELECT * FROM nong_san WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    setFlash('error', 'Không tìm thấy nông sản!');
    redirect('/pages/products/list.php');
}

// Kiểm tra quyền
if (getUserRole() !== 'admin' && $product['nguoi_tao_id'] != $_SESSION['user_id']) {
    setFlash('error', 'Bạn không có quyền xóa nông sản này!');
    redirect('/pages/products/list.php');
}

// Kiểm tra có lô sản phẩm nào đang sử dụng không
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM lo_san_pham WHERE nong_san_id = ?");
$stmt->execute([$id]);
$count = $stmt->fetch()['total'];

if ($count > 0) {
    setFlash('error', "Không thể xóa vì còn $count lô sản phẩm đang sử dụng nông sản này!");
    redirect('/pages/products/list.php');
}

// Xóa
$stmt = $conn->prepare("DELETE FROM nong_san WHERE id = ?");
$stmt->execute([$id]);

setFlash('success', 'Xóa nông sản thành công!');
redirect('/pages/products/list.php');

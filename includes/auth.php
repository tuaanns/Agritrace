<?php
/**
 * Module xác thực người dùng
 */

require_once __DIR__ . '/../config/database.php';

class Auth {
    private $conn;

    public function __construct() {
        $this->conn = getConnection();
    }

    /**
     * Đăng nhập
     */
    public function login($tenDangNhap, $matKhau) {
        $stmt = $this->conn->prepare(
            "SELECT nd.*, vt.ten_vai_tro 
             FROM nguoi_dung nd 
             JOIN vai_tro vt ON nd.vai_tro_id = vt.id 
             WHERE nd.ten_dang_nhap = ? AND nd.trang_thai = 1"
        );
        $stmt->execute([$tenDangNhap]);
        $user = $stmt->fetch();

        if ($user && password_verify($matKhau, $user['mat_khau'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['ho_ten'] = $user['ho_ten'];
            $_SESSION['ten_dang_nhap'] = $user['ten_dang_nhap'];
            $_SESSION['vai_tro'] = $user['ten_vai_tro'];
            $_SESSION['vai_tro_id'] = $user['vai_tro_id'];
            return true;
        }
        return false;
    }

    /**
     * Đăng ký
     */
    public function register($data) {
        // Kiểm tra tên đăng nhập đã tồn tại chưa
        $stmt = $this->conn->prepare("SELECT id FROM nguoi_dung WHERE ten_dang_nhap = ?");
        $stmt->execute([$data['ten_dang_nhap']]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Tên đăng nhập đã tồn tại'];
        }

        // Kiểm tra email
        if (!empty($data['email'])) {
            $stmt = $this->conn->prepare("SELECT id FROM nguoi_dung WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'Email đã được sử dụng'];
            }
        }

        // Hash mật khẩu
        $hashedPassword = password_hash($data['mat_khau'], PASSWORD_DEFAULT);

        // Mặc định vai trò người tiêu dùng (id=3)
        $vaiTroId = $data['vai_tro_id'] ?? 3;

        $stmt = $this->conn->prepare(
            "INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai, dia_chi, vai_tro_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['ten_dang_nhap'], $hashedPassword, $data['ho_ten'],
            $data['email'] ?? null, $data['so_dien_thoai'] ?? null,
            $data['dia_chi'] ?? null, $vaiTroId
        ]);

        return ['success' => true, 'message' => 'Đăng ký thành công'];
    }

    /**
     * Đăng xuất
     */
    public function logout() {
        session_destroy();
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public function getCurrentUser() {
        if (!isLoggedIn()) return null;
        $stmt = $this->conn->prepare(
            "SELECT nd.*, vt.ten_vai_tro 
             FROM nguoi_dung nd 
             JOIN vai_tro vt ON nd.vai_tro_id = vt.id 
             WHERE nd.id = ?"
        );
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    }
}

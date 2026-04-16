-- ============================================
-- DATABASE: AgriTrace - Hệ thống Truy xuất Nông sản Blockchain
-- Phiên bản: 2.0 (Đồng bộ MongoDB)
-- ============================================

CREATE DATABASE IF NOT EXISTS quanlynongsan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quanlynongsan;

-- ============================================
-- 1. Bảng Người dùng (Users)
-- ============================================
CREATE TABLE nguoi_dung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    so_dien_thoai VARCHAR(20),
    dia_chi TEXT,
    wallet_address VARCHAR(42) UNIQUE COMMENT 'Địa chỉ ví MetaMask',
    avatar VARCHAR(255) DEFAULT '',
    vai_tro ENUM('admin', 'nha_san_xuat', 'nguoi_tieu_dung') DEFAULT 'nguoi_tieu_dung',
    trang_thai TINYINT DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 2. Bảng Nông sản (Products)
-- ============================================
CREATE TABLE nong_san (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_nong_san VARCHAR(150) NOT NULL,
    danh_muc VARCHAR(100) NOT NULL,
    gia_ban VARCHAR(50) DEFAULT 'Liên hệ',
    mo_ta TEXT,
    hinh_anh VARCHAR(255),
    nguoi_tao_id INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 3. Bảng Lô sản phẩm (Batches)
-- ============================================
CREATE TABLE lo_san_pham (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_lo VARCHAR(50) NOT NULL UNIQUE,
    ma_truy_xuat VARCHAR(100) NOT NULL UNIQUE,
    nong_san_id INT NOT NULL,
    noi_san_xuat VARCHAR(255) NOT NULL,
    ngay_gieo_trong DATE,
    ngay_thu_hoach DATE,
    so_luong DECIMAL(10,2),
    don_vi VARCHAR(20) DEFAULT 'kg',
    trang_thai VARCHAR(50) DEFAULT 'Đang sản xuất',
    
    -- Dữ liệu Blockchain
    blockchain_hash VARCHAR(66),
    previous_hash VARCHAR(66),
    blockchain_timestamp DATETIME,
    blockchain_verified TINYINT DEFAULT 0,
    
    nguoi_tao_id INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nong_san_id) REFERENCES nong_san(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 4. Nhật ký sản xuất (Batch Processes)
-- ============================================
CREATE TABLE nhat_ky_san_xuat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lo_san_pham_id INT NOT NULL,
    giai_doan ENUM('gieo_trong', 'cham_soc', 'thu_hoach', 'dong_goi', 'van_chuyen', 'phan_phoi') NOT NULL,
    tieu_de VARCHAR(150) NOT NULL,
    mo_ta TEXT,
    dia_diem VARCHAR(255),
    nguoi_thuc_hien VARCHAR(100),
    hinh_anh VARCHAR(255),
    ngay_thuc_hien DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lo_san_pham_id) REFERENCES lo_san_pham(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ============================================

-- Người dùng (Mật khẩu mặc định: 123456)
INSERT INTO nguoi_dung (username, password, ho_ten, email, wallet_address, vai_tro) VALUES
('admin', '$2y$10$YKBKEzUoGOfl4CePe9Y5I.VU0q1LHydqCVbBJqxmJq8FHzR0TS5Vi', 'Quản trị viên Hệ thống', 'admin@agritrace.vn', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'admin'),
('nongdan', '$2y$10$YKBKEzUoGOfl4CePe9Y5I.VU0q1LHydqCVbBJqxmJq8FHzR0TS5Vi', 'Nông dân Việt', 'farmer@agritrace.vn', '0x1234567890123456789012345678901234567890', 'nha_san_xuat');

-- Nông sản
INSERT INTO nong_san (ten_nong_san, danh_muc, gia_ban, mo_ta, hinh_anh) VALUES
('Sầu riêng Ri6', 'Trái cây', '150.000đ/kg', 'Sầu riêng Ri6 loại 1, cơm vàng hạt lép từ Tiền Giang', 'https://images.unsplash.com/photo-1595124253361-9f9390ea9399'),
('Cà phê Arabica', 'Hạt', '350.000đ/kg', 'Cà phê Arabica Cầu Đất, chế biến ướt cao cấp', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e');

-- Lô sản phẩm
INSERT INTO lo_san_pham (ma_lo, ma_truy_xuat, nong_san_id, noi_san_xuat, ngay_gieo_trong, ngay_thu_hoach, so_luong, don_vi, trang_thai, blockchain_verified) VALUES
('LOT-2024-001', 'TX-SAURIENG-001', 1, 'Cai Lậy, Tiền Giang', '2023-12-01', '2024-05-15', 500, 'kg', 'Đã thu hoạch', 1);

-- Nhật ký cho lô 1
INSERT INTO nhat_ky_san_xuat (lo_san_pham_id, giai_doan, tieu_de, mo_ta, dia_diem, nguoi_thuc_hien) VALUES
(1, 'gieo_trong', 'Gieo vườn mới', 'Sử dụng giống Ri6 cao sản ghép gốc dâu', 'Vườn 1 - Cai Lậy', 'Nguyễn Văn A'),
(1, 'cham_soc', 'Bón phân hữu cơ', 'Sử dụng phân bón sinh học định kỳ 2 tháng/lần', 'Vườn 1 - Cai Lậy', 'Nguyễn Văn A'),
(1, 'thu_hoach', 'Thu hoạch đợt 1', 'Thu hoạch quả đạt độ chín 85%, cân nặng trung bình 3-4kg', 'Vườn 1 - Cai Lậy', 'Đội thu hoạch 01');

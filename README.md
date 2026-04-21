# 🌿 AgriTrace - Hệ Thống Truy Xuất Nguồn Gốc Nông Sản Web3

AgriTrace là nền tảng quản lý và truy xuất nguồn gốc nông sản hiện đại, kết hợp sức mạnh của công nghệ Blockchain Cronos để đảm bảo tính minh bạch và chống giả mạo thông tin.

---

## 🚀 Hướng Dẫn Vận Hành Hệ Thống

### 1. Khởi động Backend
```bash
cd backend
npm start
```

### 2. Khởi động Frontend (Để quét QR bằng điện thoại)
```bash
cd frontend
npm run dev -- --host
```
*Truy cập địa chỉ `Network` được hiển thị trong terminal (Ví dụ: `http://10.10.11.157:5173`).*

### 3. Cấu hình IP Server
Vào trang **Quản lý lô hàng** -> Nhập địa chỉ IP máy tính vào ô **IP Server** (Ví dụ: `http://10.10.11.157:5173`) để kích hoạt mã QR cho điện thoại quét.

---

## 🛠 Triển Khai Smart Contract

Hệ thống hỗ trợ 2 cách triển khai:

### Cách 1: Sử dụng Hardhat (Khuyên dùng)
1. Cấu hình Private Key trong file `hardhat.config.js`.
2. Chạy lệnh:
```bash
npx hardhat run scripts/deploy.js --network cronosTestnet
```

### Cách 2: Sử dụng Remix IDE
1. Tải file `blockchain/Traceability.sol` lên [Remix IDE](https://remix.ethereum.org/).
2. Compile và Deploy với môi trường **Injected Provider - MetaMask**.

*Lưu ý: Sau khi deploy, hãy cập nhật địa chỉ Contract vào `frontend/src/services/contracts.js`.*

---

## 📱 Tính Năng Nổi Bật
- **Mã QR Động**: Tự động tạo và tải mã QR cho từng lô hàng.
- **Trình Quét Live**: Quét mã QR trực tiếp bằng webcam/camera phone ngay trên web.
- **Xác thực Blockchain**: Đối soát hành trình nông sản trực tiếp với dữ liệu trên mạng Cronos.
- **Bảo mật Web3**: Chỉ Admin mới có quyền ghi nhật ký lên Blockchain (Access Control).
- **Minh bạch tuyệt đối**: Link trực tiếp đến Blockchain Explorer để kiểm tra Transaction gốc.

---
© 2026 AgriTrace Team - Nâng tầm nông sản Việt bằng công nghệ số.

**Contract Address hiện tại:** `0x23Ebe49cE168Fff0857c165010927BcE50032534`
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

## 🛠 Triển Khai Smart Contract (Remix IDE)

1. **Mở file**: Truy cập [Remix IDE](https://remix.ethereum.org/) và tải file `blockchain/Traceability.sol` lên.
2. **Biên dịch**: Tại tab **Solidity Compiler**, nhấn **Compile Traceability.sol**.
3. **Triển khai**: 
   - Tab **Deploy & Run Transactions** -> Chọn Environment là **Injected Provider - MetaMask**.
   - Nhấn **Deploy** và xác nhận trên ví.
4. **Cập nhật dự án**: Copy địa chỉ contract mới và dán vào biến `CONTRACT_ADDRESS` trong file `frontend/src/services/contracts.js`.

---

## 📱 Tính Năng Nổi Bật
- **Mã QR Động**: Tự động tạo và tải mã QR cho từng lô hàng.
- **Trình Quét Live**: Quét mã QR trực tiếp bằng webcam/camera phone ngay trên web.
- **Xác thực Blockchain**: Đối soát hành trình nông sản trực tiếp với dữ liệu trên mạng Cronos.

---
© 2026 AgriTrace Team - Nâng tầm nông sản Việt bằng công nghệ số.
npm run dev -- --host chạy server
0xF89e5e93EC8678F39137943987C7416f5fAE6A17 địa chỉ contract
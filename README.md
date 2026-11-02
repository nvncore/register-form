# Dự án Form Đăng Ký (React + TypeScript + Vite)

Ứng dụng form đăng ký thành viên hiện đại, hỗ trợ kiểm tra dữ liệu theo thời gian thực (real-time validation) và giao diện phong cách Glassmorphism.

## ✨ Tính năng chính

- **Các trường thông tin:**
  - Họ và tên (Full name)
  - Địa chỉ Email (Email format validation)
  - Số điện thoại (Định dạng số điện thoại Việt Nam)
  - Mật khẩu & Xác nhận mật khẩu (Toggle xem/ẩn mật khẩu)
  - Thước đo độ mạnh mật khẩu (Password Strength Meter) theo thời gian thực
  - Checkbox xác nhận điều khoản và chính sách
- **Xác thực dữ liệu (Form Validation):**
  - Báo lỗi tức thì khi blur hoặc submit
  - Kiểm tra mật khẩu khớp và độ dài an toàn
- **Giao diện người dùng:**
  - Thiết kế Dark Mode Glassmorphism hiện đại, responsive trên mọi kích thước màn hình
  - Trạng thái loading khi gửi form và màn hình hiển thị thông tin thành công
- **Xác thực hai lớp TOTP (2FA - RFC 6238):**
  - Tạo khóa bí mật (Secret Key) chuẩn Base32 và tạo mã QR quét trực tiếp bằng Google Authenticator, Microsoft Authenticator, Authy
  - Hiển thị mã 6 chữ số theo thời gian thực tự động làm mới mỗi 30 giây kèm thanh đếm ngược trực quan
  - Xác minh mã TOTP với 6 ô nhập tự động chuyển ô, hỗ trợ phím xóa và dán mã (paste)
  - Kiểm tra tính hợp lệ với khoảng dung sai (drift window) ±30 giây chuẩn RFC

## 🚀 Khởi chạy dự án

### Cài đặt thư viện:
```bash
npm install
```

### Chạy môi trường phát triển (Dev server):
```bash
npm run dev
```
Truy cập: `http://localhost:3000`

### Build cho production:
```bash
npm run build
```

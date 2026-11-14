# GrandJob Mobile

Ứng dụng ứng viên riêng cho Android/iOS, xây dựng bằng Expo SDK 58. Mã nguồn, dependencies và build nằm trong `mobile/`; không phụ thuộc vào build Web của Next.js.

## Chạy ứng dụng

1. Cài Node.js và dependencies: `cd mobile` rồi `npm install`.
2. Sao chép `.env.example` thành `.env` và đặt `EXPO_PUBLIC_API_URL` bằng origin của backend, không thêm `/api`.
3. Chạy `npm start`, sau đó mở bằng Expo Go hoặc development build.

Ví dụ địa chỉ backend đang chạy cục bộ:

- Android Emulator: `http://10.0.2.2:4010`
- iOS Simulator: `http://localhost:4010`
- Điện thoại thật: `http://<IP-LAN-của-máy-chạy-backend>:4010` (hai thiết bị cùng mạng)
- Production: origin HTTPS của backend đã triển khai

Không dùng `localhost` trên điện thoại thật: địa chỉ đó trỏ về chính điện thoại. Khởi động lại Expo sau khi đổi `.env`.

## Tính năng ứng viên

- Đăng nhập/đăng ký ứng viên và khôi phục mật khẩu bằng OTP.
- Tìm việc theo từ khóa, ngành nghề, khu vực và khoảng lương; xem mô tả và ứng tuyển bằng CV đã lưu.
- Xem thông báo phản hồi ứng tuyển và đánh dấu đã đọc.
- Xem/tạo/cập nhật CV trực tuyến; cập nhật hồ sơ và đổi mật khẩu.
- Gửi phản ánh ẩn danh hoặc có thông tin liên hệ.

Việc xóa CV chưa được triển khai vì backend hiện không có API xóa CV.

## Kiểm tra và build

- `npm run typecheck`
- `npm run lint`
- `npx expo export --platform android`
- `npx eas-cli@latest build --platform android` hoặc `--platform ios` để tạo bản cài đặt bằng EAS.

## Tách biệt với Web

Ứng dụng Web vẫn nằm ở thư mục gốc và dùng `npm run build` / `npm run start`. Để chỉ triển khai Web, cấu hình hosting trỏ tới thư mục gốc và không chạy các lệnh trong `mobile/`. API Web hiện nằm cùng Next.js, vì vậy môi trường Web phải hỗ trợ Node.js và kết nối được tới MongoDB, SMTP cùng các biến môi trường backend.

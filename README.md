# Đề tài
Smart Dormitory Management System: Hệ thống quản lý ký túc xá thông minh

---

## Bài toán thực tế
Hiện nay nhiều ký túc xá hoặc nhà trọ sinh viên vẫn quản lý bằng Excel hoặc giấy tờ:

* Không biết phòng nào còn trống.
* Thanh toán thủ công.
* Khó theo dõi điện nước.
* Báo hỏng qua Zalo/Facebook nên dễ bị quên.
* Không có thống kê doanh thu.
* Không có quy trình gia hạn/trả phòng và hoàn cọc rõ ràng.

---

## Đối tượng sử dụng

### Sinh viên
* Tìm kiếm & xem phòng có chô trống (theo tòa nhà, loại phòng, giá giường).
* Đăng ký giường trống.
* Gia hạn hợp đồng.
* Xem hóa đơn.
* Thanh toán (online/offline).
* Báo hỏng.
* Nhận thông báo.
* Chat với quản lý.

### Quản lý
* Quản lý tòa nhà.
* Quản lý phòng, loại phòng, giường từng phòng.
* Quản lý sinh viên.
* Duyệt đăng ký / gia hạn / trả phòng.
* Tạo hóa đơn.
* Xử lý yêu cầu báo hỏng.
* Theo dõi doanh thu.

### Admin
* Quản lý tài khoản.
* Quản lý quyền.
* Quản lý toàn hệ thống.
* Xem nhật ký thao tác (audit log).

---

## Các module

### 1. Authentication
* Đăng ký
* Đăng nhập
* JWT
* Refresh Token
* Quên mật khẩu
* Email OTP

### 2. Room Management
* CRUD phòng
* Quản lý loại phòng (Room Type): sức chứa, giá cơ bản
* Upload nhiều ảnh phòng
* Tìm kiếm & lọc phòng (theo tòa nhà, loại phòng, khoảng giá, trạng thái)
* Trạng thái:
  * Available
  * Occupied
  * Maintenance
  * Reserved

### 3. Student Management
* Hồ sơ
* CCCD
* Trường
* MSSV
* Avatar
* Phòng đang sử dụng

### 4. Contract Management
Một sinh viên
↓
Một hợp đồng
↓
Một phòng (theo chỗ/giường trong phòng, vì phòng có thể ở ghép nhiều người)

Có:
* Ngày bắt đầu
* Ngày kết thúc
* Tiền cọc
* Trạng thái hợp đồng: Pending → Active → Expiring → Renewed / Terminated
* Hợp đồng PDF (tự sinh và gửi qua email khi ký)
* Hoàn cọc khi kết thúc hợp đồng

### 5. Billing
Tự sinh hóa đơn dựa trên chỉ số điện nước hàng tháng (Utility Reading: số cũ, số mới)

Ví dụ
Tiền phòng
+
Điện (tính theo chỉ số)
+
Nước (tính theo chỉ số)
+
Internet
↓
Tổng tiền

* Hạn thanh toán (due date)
* Phí trễ hạn (nếu quá hạn)
* Thanh toán online (VNPay) và thanh toán thủ công (Cash)

### 6. Maintenance Request
Sinh viên báo:
Máy lạnh hỏng
Đèn hỏng
Khóa cửa hỏng

Có thể upload ảnh.

Quản lý đổi trạng thái

* Pending
* Processing
* Done

### 7. Dashboard
Biểu đồ

* Phòng trống
* Tỷ lệ lấp đầy
* Doanh thu tháng
* Hóa đơn chưa thanh toán
* Xuất báo cáo (Excel/PDF)

---

## Thông báo
Ví dụ
Ngày mai đến hạn thanh toán.

Kênh thông báo: trong ứng dụng (in-app) và Email.
Tự động nhắc hạn thanh toán / hợp đồng sắp hết hạn (chạy theo lịch - scheduler).

## Chat
Sinh viên
↓
Chat với quản lý (1-1, realtime qua WebSocket).

## Email
Ký hợp đồng
↓
Tự gửi email PDF.

---

## Database
Ví dụ

* Users
* Roles
* Students
* Buildings
* RoomTypes
* Rooms
* RoomImages
* Contracts
* UtilityReadings
* Invoices
* InvoiceDetails
* Payments
* MaintenanceRequests
* Notifications
* ChatMessages
* RefreshTokens
* OtpCodes
* AuditLogs


---

## Công nghệ

### Backend
* Java 21
* Spring Boot 3
* Spring Security
* Spring Data JPA
* JWT
* Validation
* Lombok
* MapStruct (tùy chọn)
* Spring WebSocket (STOMP) - cho Chat & Notification realtime
* Flyway - quản lý migration database
* Springdoc OpenAPI (Swagger) - tài liệu API

### Database
* PostgreSQL

### Frontend
* React + JavaScript
* Tailwind CSS
* React Router
* Axios
* Recharts (Dashboard)
* @stomp/stompjs (kết nối WebSocket cho Chat/Notification)

### Thanh toán
* VNPay (sepay)

### Storage
* Cloudinary

---


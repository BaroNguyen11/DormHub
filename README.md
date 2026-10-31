# DormHub — Frontend

Frontend cho hệ thống quản lý ký túc xá DormHub, xây dựng bằng React, Vite và React Router. Project giữ giao diện hiện có, tổ chức lại các layout dùng chung, bổ sung xử lý CSRF/refresh cookie cho API client và giới hạn phạm vi người dùng còn **Guest, Student, Manager**.

Đây là project frontend. Backend Spring Boot và PostgreSQL được chạy riêng.

## 1. Công nghệ

- React 19 + Vite 8
- React Router 7
- JavaScript + JSX
- Tailwind CSS 4, Lucide React, Recharts, Motion
- Fetch API dùng chung tại `src/api/apiClient.js`
- Xác thực bằng HttpOnly Cookie; không lưu access token vào `localStorage` hoặc `sessionStorage`

Yêu cầu môi trường: Node.js **20.19+ hoặc 22.12+** và npm.

## 2. Cài đặt và chạy

```bash
npm install
```

Tạo file `.env` từ mẫu:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
npm run dev
```

**macOS / Linux**

```bash
cp .env.example .env
npm run dev
```

Mở URL Vite hiển thị trong terminal, thường là `http://localhost:5173`.

Các lệnh hữu ích:

```bash
npm run dev      # Chạy môi trường phát triển
npm run build    # Build production vào dist/
npm run preview  # Xem thử bản build
npm run lint     # Kiểm tra ESLint
```

Nếu PowerShell chặn `npm.ps1`, chạy `npm.cmd run dev` hoặc `npm.cmd run build`.

## 3. Cấu hình kết nối backend

File `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_ENABLE_DEMO=false
```

- `VITE_API_BASE_URL`: URL gốc của API Spring Boot.
- Không đặt mật khẩu, JWT secret, SMTP password hoặc bất kỳ thông tin bí mật nào trong biến `VITE_*`; các biến này được đưa vào bundle trình duyệt.
- Frontend gọi API bằng `credentials: 'include'`, vì vậy backend cần cho phép CORS từ `http://localhost:5173` và `allowCredentials(true)`.
- Khi chạy local, nên dùng cùng hostname `localhost` cho cả frontend và backend. Không trộn `localhost` với `127.0.0.1` khi kiểm tra cookie.

### Cơ chế CSRF và phiên đăng nhập

`src/api/apiClient.js` thực hiện các bước sau:

1. Với request thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`), lấy CSRF token từ cookie `XSRF-TOKEN`; nếu chưa có thì gọi `GET /api/v1/auth/csrf`.
2. Gửi token trong header `X-XSRF-TOKEN`.
3. Gửi cookie bằng `credentials: 'include'`; JavaScript không đọc trực tiếp `access_token` hoặc `refresh_token` vì chúng là HttpOnly.
4. Nếu API bảo vệ trả `401`, thử `POST /api/v1/auth/refresh` một lần rồi gửi lại request. Các request refresh đồng thời dùng chung một lần refresh để tránh xoay cùng refresh token nhiều lần.
5. Nếu refresh thất bại, request gốc vẫn trả lỗi để UI xử lý; frontend không tự giả lập thành công.

**Lưu ý cần hoàn thiện ở backend trước khi dùng như hệ thống thật:** theo phần backend hiện có, logout mới xóa cookie `access_token`. Cần bổ sung việc thu hồi refresh token đang dùng và hết hạn cookie `refresh_token` trong `POST /api/v1/auth/logout`. Nếu không, refresh token cũ có thể vẫn còn hiệu lực sau khi giao diện đăng xuất.

## 4. Tài khoản xem thử

Trong môi trường `npm run dev`, trang `/login` có nút điền tài khoản demo để xem giao diện mà không cần backend:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Student | `student@demo.dormhub` | `DormHub@123` |
| Manager | `manager@demo.dormhub` | `DormHub@123` |

Dữ liệu demo chỉ là dữ liệu giả lưu trong `sessionStorage` để xem thử giao diện; không được gửi tới backend và không tạo thanh toán thật. Đây **không phải** cơ chế xác thực production. Chế độ demo chỉ được bật trong development, trừ khi chủ động đặt `VITE_ENABLE_DEMO=true` khi build.

Tài khoản Student thật do nhà trường cấp. Không có chức năng tự đăng ký sinh viên công khai. Nếu đã được cấp tài khoản nhưng chưa kích hoạt, mở `/verify-email` để xác thực email bằng OTP.

## 5. Cấu trúc thư mục

```text
src/
├── api/
│   └── apiClient.js          # Fetch, CSRF, cookie credentials, refresh retry
├── assets/                   # Ảnh và tài nguyên giao diện
├── components/
│   ├── ui/                   # Component UI dùng chung
│   ├── AuthScreen.jsx        # Login, kích hoạt email, quên/đặt lại mật khẩu
│   ├── Screen.jsx            # Màn hình dùng cấu hình cho danh sách/form/detail
│   └── Workspace.jsx         # Khung giao diện và navigation
├── constants/
│   ├── roles.js              # Vai trò và trang mặc định theo vai trò
│   ├── screenConfig.js       # Route, endpoint và cấu hình các màn hình
│   └── status.js             # Nhãn trạng thái dùng chung
├── context/
│   ├── AuthContext.jsx       # User, role, loading, login, logout
│   └── authContext.js        # Khởi tạo React Context
├── hooks/
│   ├── useAuth.js            # Đọc AuthContext
│   ├── useDebounce.js        # Trì hoãn tìm kiếm để giảm request
│   └── usePagination.js      # Quản lý trang dữ liệu
├── layouts/
│   ├── AuthLayout.jsx
│   ├── GuestLayout.jsx
│   ├── ManagerLayout.jsx
│   └── StudentLayout.jsx
├── pages/
│   ├── Auth/
│   ├── Guest/
│   ├── Manager/
│   └── Student/
├── routes/
│   ├── AppRoutes.jsx         # Khai báo route
│   ├── AuthRoute.jsx         # Chuyển người đã đăng nhập khỏi trang auth
│   ├── ProtectRoute.jsx      # Bảo vệ route theo vai trò
│   └── pageMap.js            # Ánh xạ route sang page component
├── services/
│   ├── auth.service.js       # API xác thực
│   ├── resource.service.js   # API CRUD dùng chung
│   └── demo.service.js       # Dữ liệu giả chỉ dùng để xem thử
├── utils/
│   ├── errorHandler.js
│   └── format.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

### Quy ước khi bổ sung code

- Component giao diện không tự ghép URL backend rải rác; dùng `auth.service.js`, `resource.service.js` hoặc `api()`.
- Route cần đăng nhập phải nằm trong nhóm được bảo vệ của `AppRoutes.jsx`; backend vẫn phải tự kiểm tra quyền.
- Endpoint, HTTP method và tên field phải khớp với controller/DTO của backend. Không tự đổi `POST` thành `PATCH` hoặc đoán tên field khi chưa xác nhận.
- Không lưu JWT vào Web Storage. Access/refresh token phải do backend đặt bằng HttpOnly Cookie.
- Không hiển thị thông báo thành công nếu request thất bại.

## 6. API xác thực đã đối chiếu với backend

Tất cả đường dẫn dưới đây được nối với `VITE_API_BASE_URL`, mặc định là `http://localhost:8080/api/v1`.

| Method | Endpoint | Request body / mục đích |
|---|---|---|
| `GET` | `/auth/csrf` | Lấy CSRF token; backend trả token trong `data.token` và đặt cookie `XSRF-TOKEN` |
| `POST` | `/auth/login` | `{ "email": "...", "password": "..." }`; backend đặt `access_token` và `refresh_token` cookie, trả thông tin user |
| `GET` | `/auth/me` | Lấy thông tin user từ phiên đăng nhập hiện tại |
| `POST` | `/auth/verify-email` | `{ "email": "...", "otp": "123456" }` |
| `POST` | `/auth/resend-otp` | `{ "email": "..." }` |
| `POST` | `/auth/forgot-password` | `{ "email": "..." }` |
| `POST` | `/auth/reset-password` | `{ "email": "...", "otp": "123456", "newPassword": "..." }` |
| `POST` | `/auth/refresh` | Gửi refresh cookie; backend xoay refresh token và đặt lại cookie, response chứa thông tin user |
| `POST` | `/auth/logout` | Gửi cookie phiên hiện tại; backend cần thu hồi refresh token và xóa cả hai cookie |

Backend hiện vô hiệu hóa `POST /auth/register`. Các đường dẫn cũ `/register` và `/verify-otp` chỉ chuyển hướng sang `/verify-email`; không còn luồng tạo tài khoản công khai.

## 7. API nghiệp vụ cần đối chiếu trước khi nối từng module

Các page và `screenConfig.js` hiện đang mong đợi những nhóm endpoint dưới đây. Phần này là **hợp đồng frontend đang sử dụng**, không khẳng định tất cả endpoint/DTO đã có sẵn trong backend. Thành viên phụ trách phải kiểm tra controller, service, DTO hoặc Swagger của backend trước khi hoàn tất module.

| Module | Endpoint frontend đang mong đợi |
|---|---|
| Guest | `GET /rooms`, `GET /rooms/{id}` |
| Student profile | `GET/PATCH /students/me` |
| Student applications | `GET /applications/me`, `POST /applications`, `GET /applications/{id}`, `PATCH /applications/{id}/cancel` |
| Room assignment / contract | `GET /room-assignments/me`, `GET /contracts/me`, `GET /contracts/{id}` |
| Invoices / payments | `GET /invoices/me`, `GET /invoices/{id}`, `POST /payments` |
| Maintenance / notifications | `GET /maintenance-requests/me`, `POST /maintenance-requests`, `GET /notifications/me`, `PATCH /notifications/{id}/read` |
| Manager operations | `/buildings`, `/rooms`, `/students`, `/applications`, `/contracts`, `/invoices`, `/room-monthly-charges`, `/payments`, `/maintenance-requests`, `/residence-terms`, `/notifications` |
| Chat | `/conversations`, `/conversations/{id}/messages`; xác nhận với backend trước khi coi là chức năng realtime |

Một số method hoặc đường dẫn dạng `/me` có thể khác trong backend. Nếu khác, hãy sửa cấu hình/service của frontend theo hợp đồng backend thực tế thay vì sửa backend chỉ để khớp với giả định của UI.

## 8. Phân chia công việc cho nhóm 4 thành viên

Mỗi thành viên chịu trách nhiệm một module, tự kiểm tra API của module mình, sau đó phối hợp tích hợp trên nhánh chung. Phần authentication và API client nên có một người quản lý chính để tránh sửa cùng lúc.

### Thành viên 1 — Bạn: Nền tảng, authentication và tích hợp chung

**File chính:**

- `src/api/apiClient.js`
- `src/services/auth.service.js`
- `src/context/AuthContext.jsx`
- `src/routes/AppRoutes.jsx`, `AuthRoute.jsx`, `ProtectRoute.jsx`
- `src/components/AuthScreen.jsx`
- `src/layouts/`

**Việc cần làm:**

1. Chạy project và giữ cấu trúc chung ổn định.
2. Kiểm tra login, `/auth/me`, kích hoạt email, gửi lại OTP, quên mật khẩu, đặt lại mật khẩu, refresh và logout.
3. Kiểm tra cookie HttpOnly, CSRF header, CORS và hành vi khi refresh thất bại.
4. Duyệt các thay đổi chạm vào API client, route chung hoặc AuthContext.
5. Kiểm tra build/lint và hỗ trợ ghép các module của thành viên khác.

**Tiêu chí hoàn thành:** không có JWT trong Web Storage; đăng nhập và lấy user từ backend thành công; route Student/Manager được bảo vệ; lỗi API được hiển thị đúng.

### Thành viên 2 — Guest và tra cứu phòng

**File chính:**

- `src/pages/Guest/Home/Home.jsx`
- `src/pages/Guest/Rooms/RoomList.jsx`
- `src/pages/Guest/Rooms/RoomDetail.jsx`
- `src/pages/Guest/NotFound.jsx`
- Phần `guest` trong `src/constants/screenConfig.js`

**Việc cần làm:**

1. Kiểm tra trang chủ và danh sách phòng trên desktop/mobile.
2. Nối danh sách và chi tiết phòng với API thật.
3. Đối chiếu field trả về (tên tòa, sức chứa, số chỗ trống, giá, trạng thái) và xử lý danh sách rỗng/lỗi tải.
4. Kiểm tra CTA đăng nhập/kích hoạt tài khoản; không thêm đăng ký sinh viên công khai.
5. Gửi lại cho thành viên 1 danh sách endpoint và DTO đã xác nhận.

**Tiêu chí hoàn thành:** không còn dữ liệu demo trong chế độ API thật; danh sách/chi tiết phòng hiển thị đúng dữ liệu backend và có trạng thái loading/error/empty.

### Thành viên 3 — Các chức năng Student

**File chính:**

- `src/pages/Student/`
- Các route `group: 'student'` trong `src/constants/screenConfig.js`
- Các service cần thiết trong `src/services/`

**Việc cần làm:**

1. Dashboard và hồ sơ sinh viên.
2. Đơn đăng ký nội trú, trạng thái xét duyệt và thông tin chỗ ở.
3. Hợp đồng, hóa đơn và kết quả thanh toán.
4. Gửi yêu cầu bảo trì và theo dõi trạng thái.
5. Thông báo và chat với quản lý.
6. Đối chiếu từng API/DTO, nhất là cập nhật hồ sơ, tạo đơn, thanh toán và các endpoint `/me`.

**Tiêu chí hoàn thành:** Student chỉ xem/sửa dữ liệu được backend cho phép; mọi thao tác ghi dữ liệu có loading/error/success rõ ràng; trạng thái thanh toán lấy từ backend, không suy luận từ query string.

### Thành viên 4 — Các chức năng Manager

**File chính:**

- `src/pages/Manager/`
- Các route `group: 'manager'` trong `src/constants/screenConfig.js`
- Các service cần thiết trong `src/services/`

**Việc cần làm:**

1. Dashboard quản lý và thống kê.
2. Quản lý tòa nhà, phòng và danh sách sinh viên cư trú.
3. Xét duyệt đơn, từ chối có lý do và phân phòng.
4. Hợp đồng, hóa đơn, chi phí điện/nước/dịch vụ và theo dõi thanh toán.
5. Xử lý yêu cầu bảo trì, tạo đợt đăng ký và gửi thông báo.
6. Kiểm tra API chat; chỉ tích hợp WebSocket nếu backend có giao thức tương ứng.

**Tiêu chí hoàn thành:** thao tác quản lý dùng API thật; phân quyền được backend xác nhận; các hành động nguy hiểm có xác nhận; các trường tiền/trạng thái khớp DTO backend.

### Quy trình phối hợp

1. Mỗi thành viên tạo branch riêng, ví dụ `feature/guest-rooms`, `feature/student-module`, `feature/manager-module`, `feature/auth-integration`.
2. Trước khi code API, ghi rõ method, URL, request DTO và response DTO đã kiểm tra trong backend.
3. Không tự ý sửa `apiClient.js`, `AuthContext.jsx` hoặc cơ chế CSRF/refresh nếu không phối hợp với thành viên 1.
4. Không commit `.env`, mật khẩu, token, `node_modules/` hoặc `dist/`.
5. Trước khi merge, chạy `npm run lint` và `npm run build`; kiểm tra lại route, loading, empty state, lỗi API và phân quyền.
6. Khi một endpoint backend chưa có, ghi rõ trạng thái “chưa có ở backend” trong báo cáo; không giả thành công bằng dữ liệu mẫu.

## 9. Checklist kiểm thử trước khi nộp

- [ ] `npm run build` hoàn thành.
- [ ] `npm run lint` không có lỗi.
- [ ] Guest xem được trang chủ, danh sách phòng và chi tiết phòng.
- [ ] Tài khoản Student không truy cập được route Manager; tài khoản Manager không truy cập được route Student.
- [ ] Login, `/auth/me`, refresh và logout đã được thử với backend đang chạy.
- [ ] Request thay đổi dữ liệu có header `X-XSRF-TOKEN`.
- [ ] Lỗi 401/403/404/500 được hiển thị phù hợp, không báo thành công giả.
- [ ] Không còn route, menu, trang hoặc tài khoản demo thuộc phạm vi ngoài Guest/Student/Manager.
- [ ] Các API nghiệp vụ được xác nhận với controller/DTO backend trước khi demo cuối.

// =====================================================================
// screenConfig.js — Bản đồ resource theo endpoint BACKEND THẬT (Spring Boot)
// Giữ nguyên thiết kế UI/sidebar ban đầu; chỉ đổi `resource` / `columns` /
// `actions` sao cho khớp controller DormHubBackend.
//
// Bảng tham chiếu endpoint chính:
//   Sinh viên:
//     GET  /api/v1/student/rooms-available          (List<RoomResponse>)
//     GET  /api/v1/student/room-assignments          (Page<RoomAssignmentResponse>)
//     GET  /api/v1/student/room-assignments/{id}
//     GET  /api/v1/student/contracts                 (Page<ContractResponse>)
//     GET  /api/v1/student/contracts/{id}
//     GET  /api/v1/student/invoices                  (InvoicePageResponse)
//     GET  /api/v1/student/invoices/{invoiceId}
//     POST /api/v1/student/invoices/{invoiceId}/payments
//     GET  /api/v1/student/payments/{paymentId}
//     POST /api/v1/student/dorm-applications
//     GET  /api/v1/student/dorm-applications         (Page)
//     GET  /api/v1/student/dorm-applications/{id}
//     PATCH /api/v1/student/dorm-applications/{id}/cancel
//     POST /api/v1/student/maintenance
//     GET  /api/v1/student/maintenance               (Page)
//     GET  /api/v1/student/maintenance/{id}
//     GET  /api/v1/student/profile
//     PATCH /api/v1/student/profile
//   Chung:
//     GET  /api/v1/notifications                     (Page<NotificationResponse>)
//     GET  /api/v1/notifications/unread-count
//     PATCH /api/v1/notifications/{id}/read
//     PATCH /api/v1/notifications/read-all
//   Manager:
//     GET  /api/v1/manager/buildings (+ POST/PUT/DELETE)
//     GET  /api/v1/manager/rooms (+ POST/PUT/PATCH/DELETE)
//     GET  /api/v1/manager/students
//     GET  /api/v1/manager/dorm-applications         (Page)
//     PATCH /api/v1/manager/dorm-applications/{id}/review
//     GET  /api/v1/manager/room-assignments
//     GET  /api/v1/manager/maintenance (+ PATCH status)
//     POST /api/v1/manager/contracts/{id}/check-in
//     POST /api/v1/manager/contracts/{id}/check-out
//     GET  /api/v1/contracts                         (manager xem tất cả)
//     GET  /api/v1/invoices  (+ POST)               (manager)
//     POST /api/v1/room-monthly-charges              (manager nhập chi phí)
// =====================================================================

export const screens = {
  "/": { title: "Trang chủ", group: "guest", type: "home" },

  // Guest xem phòng công khai
  "/rooms": {
    title: "Tìm phòng",
    group: "guest",
    type: "list",
    resource: "/rooms/available",
    columns: [
      "roomNumber",
      "buildingName",
      "capacity",
      "currentOccupancy",
      "pricePerMonth",
      "status",
    ],
    search: false,
    detail: "/rooms",
    publicActions: [
      {
        label: "Đăng ký",
        action: "requireLogin",
        redirect: "/login",
      },
    ],
  },
  "/rooms/:id": {
    title: "Chi tiết phòng",
    group: "guest",
    type: "detail",
    resource: "/rooms",
    publicActions: [
      {
        label: "Đăng ký phòng này",
        redirect: "/login",
      },
    ],
  },

  // Sinh viên chưa có phòng: tìm phòng trống (lọc theo giới tính)
  "/student/rooms": {
    title: "Tìm phòng",
    group: "student",
    type: "list",
    resource: "/student/rooms-available",
    columns: [
      "roomNumber",
      "buildingName",
      "capacity",
      "currentOccupancy",
      "pricePerMonth",
      "status",
    ],
    search: false, // backend rooms-available không hỗ trợ search param
    detail: "/student/rooms",
  },
  "/student/rooms/:id": {
    title: "Chi tiết phòng",
    group: "student",
    type: "detail",
    resource: "/student/rooms-available",
    actions: [
      {
        label: "Đăng ký phòng này",
        type: "redirect",
        path: "/student/applications/new",
        useRoomId: true,
      },
    ],
  },
  "/student": {
    title: "Tổng quan cá nhân",
    group: "student",
    type: "custom",
    component: "MyRoomDashboard",
  },
  "/student/applications": {
    title: "Đơn đăng ký KTX",
    group: "student",
    type: "list",
    resource: "/student/dorm-applications",
    columns: [
      "id",
      "requestedRoomNumber",
      "requestedBuildingName",
      "status",
      "createdAt",
    ],
    detail: "/student/applications",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  },
  "/student/applications/new": {
    title: "Đăng ký nội trú",
    group: "student",
    type: "application",
  },
  "/student/applications/:id": {
    title: "Chi tiết đơn đăng ký",
    group: "student",
    type: "detail",
    resource: "/student/dorm-applications",
    actions: [
      {
        // Đơn đã duyệt -> bước tiếp theo là thanh toán hóa đơn đặt cọc
        // (backend đã trả sẵn depositInvoiceId / depositAmount trong DormApplicationResponse).
        label: "Thanh toán cọc để nhận phòng",
        type: "redirect",
        path: (data) => `/student/invoices/${data.depositInvoiceId}`,
        visibleWhen: (data) => data.status === "APPROVED" && data.depositInvoiceId && data.depositInvoiceStatus === "UNPAID",
      },
      {
        label: "Xem lịch nhận phòng & hợp đồng",
        type: "redirect",
        path: "/student/residence",
        visibleWhen: (data) => data.status === "APPROVED" && data.depositInvoiceStatus === "PAID",
      },
      {
        // Backend chỉ cho hủy đơn PENDING (DORM_APPLICATION_NOT_PENDING).
        label: "Hủy đơn",
        suffix: "/cancel",
        method: "PATCH",
        confirm: true,
        visibleWhen: { status: "PENDING" },
      },
    ],
  },
  "/student/residence": {
    title: "Chỗ ở của tôi",
    group: "student",
    type: "detail",
    resource: "/student/room-assignments",
    // single: true -> DetailScreen gọi thẳng /student/room-assignments (không nối /:id).
    // Backend trả về Page<RoomAssignmentResponse>; DetailScreen sẽ tự lấy phần tử đầu.
    single: true,
  },
  "/student/room-contract": {
    title: "Hợp đồng & Chỗ ở",
    group: "student",
    type: "detail",
    resource: "/student/room-assignments",
    single: true,
  },
  "/student/contracts": {
    title: "Hợp đồng",
    group: "student",
    type: "list",
    resource: "/student/contracts",
    columns: [
      "contractId",
      "startDate",
      "endDate",
      "monthlyRent",
      "status",
    ],
    detail: "/student/contracts",
    statusOptions: ["DRAFT", "PENDING", "ACTIVE", "EXPIRED", "TERMINATED", "CANCELLED"],
  },
  "/student/contracts/:id": {
    title: "Chi tiết hợp đồng",
    group: "student",
    type: "detail",
    resource: "/student/contracts",
    actions: [
      {
        label: "Yêu cầu gia hạn",
        type: "redirect",
        path: (data) => `/student/contracts/${data.contractId}/renewal`,
        visibleWhen: (data) => data.status === "ACTIVE",
      },
    ],
  },
  "/student/contracts/:contractId/renewal": {
    title: "Yêu cầu gia hạn hợp đồng",
    group: "student",
    type: "form",
    resource: (params) => `/student/contracts/${params.contractId}/renewal-requests`,
    fields: ["requestedEndDate", "reason"],
  },
  "/student/renewal-requests": {
    title: "Yêu cầu gia hạn",
    group: "student",
    type: "list",
    resource: "/student/renewal-requests",
    columns: ["renewalRequestId", "contractId", "requestedEndDate", "status", "requestedAt"],
    detail: "/student/renewal-requests",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  },
  "/student/renewal-requests/:id": {
    title: "Chi tiết yêu cầu gia hạn",
    group: "student",
    type: "detail",
    resource: "/student/renewal-requests",
    actions: [
      {
        label: "Hủy yêu cầu",
        suffix: "/cancel",
        method: "PATCH",
        confirm: true,
        visibleWhen: (data) => data.status === "PENDING",
      },
    ],
  },
  "/student/invoices": {
    title: "Hóa đơn",
    group: "student",
    type: "list",
    resource: "/student/invoices",
    columns: [
      "invoiceId",
      "invoiceType",
      "billingMonth",
      "totalAmount",
      "dueDate",
      "status",
    ],
    detail: "/student/invoices",
    statusOptions: ["UNPAID", "PAID", "CANCELLED"],
  },
  "/student/invoices/:id": {
    title: "Chi tiết hóa đơn",
    group: "student",
    type: "detail",
    resource: "/student/invoices",
    actions: [
      {
        label: "Thanh toán",
        suffix: "/payments",
        method: "POST",
        payment: true,
        visibleWhen: { status: "UNPAID" },
      },
    ],
  },
  "/student/payment-result": {
    title: "Kết quả thanh toán",
    group: "student",
    // FIX: phải khớp case "payment-result" trong Screen/index.jsx —
    // trước đây ghi "paymentResult" nên rơi vào default (Unknown screen type).
    type: "payment-result",
  },
  "/student/payments": {
    title: "Lịch sử thanh toán",
    group: "student",
    type: "payment-history",
  },
  "/student/payments/:id": {
    title: "Chi tiết lần thanh toán",
    group: "student",
    type: "payment-history-detail",
  },
  "/manager/notifications/history": {
    title: "Lịch sử thông báo",
    group: "manager",
    type: "manager-notification-history",
  },
  "/manager/notifications/history/:id": {
    title: "Chi tiết thông báo đã gửi",
    group: "manager",
    type: "manager-notification-detail",
  },
  "/student/maintenance": {
    title: "Báo hỏng",
    group: "student",
    type: "list",
    resource: "/student/maintenance",
    columns: ["id", "title", "type", "priority", "status", "createdAt"],
    detail: "/student/maintenance",
    statusOptions: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"],
  },
  "/student/maintenance/new": {
    title: "Tạo yêu cầu sửa chữa",
    group: "student",
    type: "form",
    resource: "/student/maintenance",
    fields: ["title", "description", "priority", "type", "imageUrl"],
  },
  "/student/maintenance/:id": {
    title: "Chi tiết yêu cầu",
    group: "student",
    type: "detail",
    resource: "/student/maintenance",
  },
  "/student/notifications": {
    title: "Thông báo",
    group: "student",
    type: "list",
    resource: "/notifications",
    columns: ["title", "body", "createdAt", "isRead"],
    actions: [
      { label: "Đánh dấu đã đọc", suffix: "/read", method: "PATCH" },
    ],
  },
  "/student/profile": {
    title: "Hồ sơ sinh viên",
    group: "student",
    type: "profile",
    resource: "/student/profile",
  },

  // ===== MANAGER =====
  "/manager": {
    title: "Tổng quan vận hành",
    group: "manager",
    type: "dashboard",
    resource: "/manager/dashboard/summary",
  },
  "/manager/applications": {
    title: "Quản lý đơn đăng ký",
    group: "manager",
    type: "list",
    resource: "/manager/dorm-applications",
    columns: [
      "id",
      "studentName",
      "requestedRoomNumber",
      "status",
      "createdAt",
    ],
    detail: "/manager/applications",
    search: true,
    defaultStatus: "PENDING",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  },
  "/manager/applications/:id": {
    title: "Duyệt và phân phòng",
    group: "manager",
    type: "detail",
    resource: "/manager/dorm-applications",
    actions: [
      {
        label: "Duyệt đơn",
        suffix: "/review",
        method: "PATCH",
        body: { status: "APPROVED" },
        confirm: true,
      },
      {
        label: "Từ chối",
        suffix: "/review",
        method: "PATCH",
        body: { status: "REJECTED" },
        reason: true,
      },
    ],
  },
  "/manager/buildings": {
    title: "Tòa nhà",
    group: "manager",
    type: "list",
    resource: "/manager/buildings",
    columns: ["id", "name", "address", "status"],
    detail: "/manager/buildings",
    create: "/manager/buildings/new",
  },
  "/manager/buildings/new": {
    title: "Thêm tòa nhà",
    group: "manager",
    type: "form",
    resource: "/manager/buildings",
    fields: ["name", "address", "status"],
    defaultValues: { status: "ACTIVE" },
    fieldConfig: { status: { options: [{ value: "ACTIVE", label: "Đang hoạt động" }, { value: "INACTIVE", label: "Ngừng hoạt động" }] } },
  },
  "/manager/buildings/:id": {
    title: "Chi tiết tòa nhà",
    group: "manager",
    type: "detail",
    resource: "/manager/buildings",
    edit: "/manager/buildings",
  },
  "/manager/buildings/:id/edit": {
    title: "Sửa tòa nhà",
    group: "manager",
    type: "form",
    resource: "/manager/buildings",
    fields: ["name", "address", "status"],
    edit: true,
    updateMethod: "PUT",
  },
  "/manager/rooms": {
    title: "Quản lý phòng",
    group: "manager",
    type: "list",
    resource: "/manager/rooms",
    columns: [
      "id",
      "roomNumber",
      "buildingName",
      "capacity",
      "currentOccupancy",
      "pricePerMonth",
      "status",
    ],
    detail: "/manager/rooms",
    search: true,
    create: "/manager/rooms/new",
    statusOptions: ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"],
  },
  "/manager/rooms/new": {
    title: "Thêm phòng",
    group: "manager",
    type: "form",
    resource: "/manager/rooms",
    fields: [
      "buildingId",
      "roomNumber",
      "floor",
      "capacity",
      "pricePerMonth",
      "gender",
      "status",
    ],
    defaultValues: { floor: "1", capacity: "4", gender: "MALE", status: "AVAILABLE" },
    fieldConfig: {
      status: { options: [{ value: "AVAILABLE", label: "Còn trống" }, { value: "OCCUPIED", label: "Đang có người" }, { value: "MAINTENANCE", label: "Đang bảo trì" }, { value: "RESERVED", label: "Đã đặt" }] },
    },
  },
  "/manager/rooms/:id": {
    title: "Chi tiết phòng",
    group: "manager",
    type: "detail",
    resource: "/manager/rooms",
    edit: "/manager/rooms",
  },
  "/manager/rooms/:id/edit": {
    title: "Sửa phòng",
    group: "manager",
    type: "form",
    resource: "/manager/rooms",
    fields: [
      "roomNumber",
      "floor",
      "capacity",
      "pricePerMonth",
      "gender",
      "status",
    ],
    edit: true,
    updateMethod: "PUT",
  },
  "/manager/residents": {
    title: "Sinh viên cư trú",
    group: "manager",
    type: "list",
    resource: "/manager/students",
    columns: ["studentId", "fullName", "studentCode", "email", "phone", "accountStatus", "status"],
    detail: "/manager/residents",
    search: true,
    idField: "studentId",
    accountAction: true,
  },
  "/manager/residents/:id": {
    title: "Chi tiết sinh viên",
    group: "manager",
    type: "detail",
    resource: "/manager/students",
    actions: [
      {
        label: "Khóa tài khoản",
        suffix: "/status",
        method: "PATCH",
        body: { status: "LOCKED" },
        confirm: true,
        visibleWhen: (data) => data.status === "ACTIVE",
      },
      {
        label: "Mở khóa tài khoản",
        suffix: "/status",
        method: "PATCH",
        body: { status: "ACTIVE" },
        confirm: true,
        visibleWhen: (data) => data.status === "LOCKED",
      },
    ],
  },
  "/manager/contracts": {
    title: "Quản lý hợp đồng",
    group: "manager",
    type: "list",
    resource: "/contracts",
    columns: [
      "contractId",
      "studentName",
      "roomNumber",
      "startDate",
      "endDate",
      "status",
    ],
    detail: "/manager/contracts",
    statusOptions: ["DRAFT", "PENDING", "ACTIVE", "EXPIRED", "TERMINATED", "CANCELLED"],
  },
  "/manager/contracts/:id": {
    title: "Chi tiết hợp đồng",
    group: "manager",
    type: "detail",
    resource: "/contracts",
    actions: [
      {
        label: "Check-in",
        endpoint: (data) => `/manager/contracts/${data.contractId}/check-in`,
        method: "POST",
        confirm: true,
        visibleWhen: (data) => data.status === "ACTIVE" && data.assignmentStatus === "ASSIGNED"
          && Boolean(data.startDate),
      },
    ],
  },
  "/manager/invoices": {
    title: "Quản lý hóa đơn",
    group: "manager",
    type: "list",
    resource: "/invoices",
    columns: [
      "invoiceId",
      "studentName",
      "roomNumber",
      "totalAmount",
      "dueDate",
      "status",
    ],
    detail: "/manager/invoices",
    create: "/manager/invoices/new",
    statusOptions: ["UNPAID", "PAID", "CANCELLED"],
  },
  "/manager/invoices/new": {
    title: "Tạo hóa đơn",
    group: "manager",
    type: "form",
    resource: "/invoices",
    fields: ["contractId", "billingMonth"],
    fieldConfig: {
      billingMonth: {
        type: "month",
        required: true,
        placeholder: "YYYY-MM",
      },
    },
  },
  "/manager/invoices/:id": {
    title: "Chi tiết hóa đơn",
    group: "manager",
    type: "detail",
    resource: "/invoices",
  },

  "/manager/sepay": {
    title: "Giao dịch SePay",
    group: "manager",
    type: "list",
    // Chẩn đoán "đã chuyển khoản nhưng hóa đơn chưa PAID": mỗi giao dịch webhook
    // kèm status + reviewReason nêu rõ lý do không khớp (amount/code/tài khoản...).
    resource: "/manager/sepay-transactions",
    columns: [
      "id",
      "sepayTransactionId",
      "transferAmount",
      "gateway",
      "code",
      "status",
      "reviewReason",
      "receivedAt",
    ],
    detail: "/manager/sepay",
  },
  "/manager/sepay/:id": {
    title: "Chi tiết giao dịch SePay",
    group: "manager",
    type: "detail",
    resource: "/manager/sepay-transactions",
    actions: [
      {
        // Giao dịch UNMATCHED (vd chuyển khoản TRƯỚC khi bấm Thanh toán) có thể
        // được ghép lại với phiên thanh toán sau khi phiên đã tồn tại.
        label: "Đối soát lại",
        suffix: "/retry",
        method: "POST",
        confirm: true,
        visibleWhen: { status: "UNMATCHED" },
      },
      {
        label: "Ghi chú rà soát",
        suffix: "/review",
        method: "POST",
        promptField: "note",
        promptLabel: "Kết quả kiểm tra và bằng chứng",
        promptRequired: true,
        promptMultiline: true,
        promptMaxLength: 200,
        visibleWhen: { status: "REVIEW_REQUIRED" },
      },
    ],
  },
  "/manager/maintenance": {
    title: "Xử lý báo hỏng",
    group: "manager",
    type: "list",
    resource: "/manager/maintenance",
    columns: ["id", "title", "type", "priority", "status", "createdAt", "studentName"],
    detail: "/manager/maintenance",
    statusOptions: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"],
  },
  "/manager/maintenance/:id": {
    title: "Chi tiết báo hỏng",
    group: "manager",
    type: "detail",
    resource: "/manager/maintenance",
    actions: [
      {
        label: "Đang xử lý",
        suffix: "/status",
        method: "PATCH",
        body: { status: "IN_PROGRESS" },
        confirm: true,
        visibleWhen: (data) => ["PENDING", "WAITING"].includes(String(data?.status || "").toUpperCase()),
      },
      {
        label: "Hoàn thành",
        suffix: "/status",
        method: "PATCH",
        body: { status: "COMPLETED" },
        confirm: true,
        visibleWhen: (data) => ["IN_PROGRESS", "PROCESSING"].includes(String(data?.status || "").toUpperCase()),
      },
      {
        label: "Từ chối",
        suffix: "/status",
        method: "PATCH",
        promptField: "rejectionReason",
        promptLabel: "Lý do từ chối (bắt buộc, tối đa 500 ký tự)",
        promptRequired: true,
        promptMaxLength: 500,
        bodyBuilder: (data, promptValue) => ({ 
          status: "REJECTED", 
          rejectionReason: promptValue 
        }),
        visibleWhen: (data) => ["PENDING", "WAITING", "IN_PROGRESS", "PROCESSING"].includes(String(data?.status || "").toUpperCase()),
      },
    ],
  },
  "/send-to-students": {
    title: "Gửi thông báo",
    group: "manager",
    type: "form",
    resource: "/notifications/send-to-students",
    fields: ["title", "body", "buildingId"],
    notificationForm: true,
    defaultValues: { buildingId: null },
  },
  "/manager/students/new": {
    title: "Tạo tài khoản sinh viên",
    group: "manager",
    type: "form",
    resource: "/auth/register",
    fields: ["username", "email", "password", "fullName", "phoneNumber", "studentCode", "gender"],
    fieldConfig: { gender: { options: [{ label: "Nam", value: "MALE" }, { label: "Nữ", value: "FEMALE" }] } },
    fixedFields: { role: "STUDENT" },
    successMessage: "Tài khoản đã được tạo. Sinh viên có thể chủ động yêu cầu OTP để kích hoạt.",
  },

  // ===== MANAGER RENEWAL REQUESTS =====
  "/manager/renewal-requests": {
    title: "Quản lý gia hạn",
    group: "manager",
    type: "list",
    resource: "/manager/renewal-requests",
    columns: ["renewalRequestId", "studentName", "roomNumber", "requestedEndDate", "status", "requestedAt"],
    detail: "/manager/renewal-requests",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  },
  "/manager/renewal-requests/:id": {
    title: "Duyệt gia hạn",
    group: "manager",
    type: "detail",
    resource: "/manager/renewal-requests",
    actions: [
      {
        label: "Phê duyệt",
        suffix: "/review",
        method: "PATCH",
        body: { status: "APPROVED" },
        confirm: true,
        visibleWhen: (data) => data.status === "PENDING",
      },
      {
        label: "Từ chối",
        suffix: "/review",
        method: "PATCH",
        promptField: "reviewNote",
        promptLabel: "Lý do từ chối",
        promptRequired: true,
        bodyBuilder: (data, promptValue) => ({ status: "REJECTED", reviewNote: promptValue }),
        visibleWhen: (data) => data.status === "PENDING",
      },
    ],
  },

  // ===== CHANGE PASSWORD (Đổi mật khẩu) =====
  "/change-password": {
    title: "Đổi mật khẩu",
    group: "both",
    type: "form",
    resource: "/auth/change-password",
    fields: ["oldPassword", "newPassword", "confirmPassword"],
    successMessage: "Mật khẩu đã được đổi thành công",
  },

  // ===== CHECKOUT REQUESTS (Trả phòng) =====
  "/student/checkout-requests": {
    title: "Yêu cầu trả phòng",
    group: "student",
    type: "list",
    resource: "/student/checkout-requests",
    columns: ["checkoutRequestId", "checkoutDate", "status", "requestDate"],
    detail: "/student/checkout-requests",
    create: "/student/checkout-requests/new",
    createLabel: "Tạo yêu cầu trả phòng",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"],
  },
  "/student/checkout-requests/new": {
    title: "Tạo yêu cầu trả phòng",
    group: "student",
    type: "form",
    resource: "/student/checkout-requests",
    // FIX: thêm checkoutDate — backend yêu cầu ngày trả phòng dự kiến
    // (ResidencePage cũng gửi checkoutDate khi tạo từ modal).
    fields: ["checkoutDate", "reason"],
  },
  "/student/checkout-requests/:id": {
    title: "Chi tiết yêu cầu trả phòng",
    group: "student",
    type: "detail",
    resource: "/student/checkout-requests",
    actions: [
      {
        label: "Hủy yêu cầu",
        suffix: "/cancel",
        method: "PATCH",
        confirm: true,
        visibleWhen: (data) => data.status === "PENDING",
      },
    ],
  },
  "/manager/checkout-requests": {
    title: "Quản lý trả phòng",
    group: "manager",
    type: "list",
    resource: "/manager/checkout-requests",
    columns: ["checkoutRequestId", "studentName", "roomNumber", "checkoutDate", "status", "requestDate"],
    detail: "/manager/checkout-requests",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"],
  },
  "/manager/checkout-requests/:id": {
    title: "Chi tiết yêu cầu trả phòng",
    group: "manager",
    type: "detail",
    resource: "/manager/checkout-requests",
    actions: [
      {
        label: "Phê duyệt",
        suffix: "/review",
        method: "PATCH",
        body: { status: "APPROVED" },
        confirm: true,
        visibleWhen: (data) => data.status === "PENDING",
      },
      {
        label: "Từ chối",
        suffix: "/review",
        method: "PATCH",
        promptField: "note",
        promptLabel: "Lý do từ chối",
        promptRequired: true,
        bodyBuilder: (data, promptValue) => ({ status: "REJECTED", note: promptValue }),
        visibleWhen: (data) => data.status === "PENDING",
      },
      {
        label: "Hoàn thành (Hoàn cọc)",
        suffix: "/complete",
        method: "POST",
        body: { depositDisposition: "REFUNDED" },
        confirm: true,
        visibleWhen: (data) => data.status === "APPROVED",
      },
      {
        label: "Hoàn thành (Tịch thu cọc)",
        suffix: "/complete",
        method: "POST",
        body: { depositDisposition: "FORFEITED" },
        confirm: true,
        visibleWhen: (data) => data.status === "APPROVED",
      },
    ],
  },

  // ===== ROOM TRANSFER REQUESTS (Chuyển phòng) =====
  "/student/room-transfer-requests": {
    title: "Yêu cầu chuyển phòng",
    group: "student",
    type: "list",
    resource: "/student/room-transfer-requests",
    columns: ["transferId", "currentRoomNumber", "preferredRoomNumber", "status", "requestedAt"],
    detail: "/student/room-transfer-requests",
    create: "/student/room-transfer-requests/new",
    createLabel: "Tạo yêu cầu chuyển phòng",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  },
  "/student/room-transfer-requests/new": {
    title: "Tạo yêu cầu chuyển phòng",
    group: "student",
    type: "form",
    resource: "/student/room-transfer-requests",
    fields: ["preferredRoomId", "reason"],
  },
  "/student/room-transfer-requests/:id": {
    title: "Chi tiết yêu cầu chuyển phòng",
    group: "student",
    type: "detail",
    resource: "/student/room-transfer-requests",
    actions: [
      {
        label: "Hủy yêu cầu",
        suffix: "/cancel",
        method: "PATCH",
        confirm: true,
        visibleWhen: (data) => data.status === "PENDING",
      },
    ],
  },
  "/manager/room-transfer-requests": {
    title: "Quản lý chuyển phòng",
    group: "manager",
    type: "list",
    resource: "/manager/room-transfer-requests",
    columns: ["transferId", "studentName", "studentCode", "currentRoomNumber", "preferredRoomNumber", "status", "requestedAt"],
    detail: "/manager/room-transfer-requests",
    statusOptions: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  },
  "/manager/room-transfer-requests/:id": {
    title: "Duyệt chuyển phòng",
    group: "manager",
    type: "detail",
    resource: "/manager/room-transfer-requests",
    actions: [
      {
        label: "Phê duyệt",
        suffix: "/review",
        method: "PATCH",
        body: { status: "APPROVED" },
        confirm: true,
        visibleWhen: (data) => data.status === "PENDING",
      },
      {
        label: "Từ chối",
        suffix: "/review",
        method: "PATCH",
        promptField: "reviewNote",
        promptLabel: "Lý do từ chối",
        promptRequired: true,
        bodyBuilder: (data, promptValue) => ({ status: "REJECTED", reviewNote: promptValue }),
        visibleWhen: (data) => data.status === "PENDING",
      },
    ],
  },
};

for (const [path, title] of [
  ["/manager/students", "Sinh viên & Đơn"],
  ["/manager/finance", "Quản lý Tài chính"],
  ["/manager/rooms/list", "Danh sách phòng"],
  ["/manager/contracts/list", "Danh sách hợp đồng"],
  ["/manager/maintenance/list", "Danh sách báo hỏng"],
]) {
  screens[path] = { ...(path.endsWith("/list") ? screens[path.replace(/\/list$/, "")] : {}), title, group: "manager", type: path.endsWith("/list") ? "list" : "custom" };
}

import { Home, Building2, Receipt, Wrench, User, LayoutDashboard, Users, FileCheck2, Bell } from "lucide-react";

export const nav = {
  // Guest: có thể xem trang chủ và tìm phòng (không cần đăng nhập)
  guest: [
    ["Trang chủ", "/"],
    ["Tìm phòng", "/rooms"]
  ],
  // Sinh viên ĐÃ có phòng: chỉ các chức năng chính
  student: [
    ["Tổng quan", "/student", Home],
    ["Chỗ ở & Hợp đồng", "/student/residence", Building2],
    ["Hóa đơn", "/student/invoices", Receipt],
    ["Lịch sử thanh toán", "/student/payments", Receipt],
    ["Báo hỏng", "/student/maintenance", Wrench],
    ["Thông báo", "/student/notifications", Bell],
    ["Tài khoản", "/student/profile", User],
  ],
  // Sinh viên CHƯA có phòng: vẫn cần thấy Hóa đơn (trả cọc) & Hợp đồng (PENDING)
  // để hoàn tất bước thanh toán sau khi đơn được duyệt.
  studentNoRoom: [
    ["Tìm phòng", "/student/rooms", Home],
    ["Đơn đăng ký", "/student/applications", Receipt],
    ["Lịch sử thanh toán", "/student/payments", Receipt],
    ["Thông báo", "/student/notifications", Bell],
    ["Tài khoản", "/student/profile", User],
  ],
  manager: [
    ["Tổng quan", "/manager", LayoutDashboard],
    ["Phòng & Tòa nhà", "/manager/rooms", Building2],
    ["Sinh viên & Đơn", "/manager/students", Users],
    ["Hợp đồng & Thủ tục", "/manager/contracts", FileCheck2],
    ["Quản lý Tài chính", "/manager/finance", Receipt],
    ["Vận hành & Hỗ trợ", "/manager/maintenance", Wrench],
    ["Lịch sử thông báo", "/manager/notifications/history", Bell],
  ],
};

// Đường dẫn sinh viên chưa có phòng được phép vào / sinh viên đã có phòng bị chặn
// FIX: thêm /student (dashboard), /student/invoices, /student/contracts —
// sinh viên được duyệt đơn phải vào được dashboard và trang hóa đơn để TRẢ CỌC,
// nếu không luồng "duyệt -> cọc -> phân phòng" bị kẹt vĩnh viễn.
export const STUDENT_NO_ROOM_ALLOWED = [
  "/student/rooms",
  "/student/applications",
  "/student/profile",
  "/student/invoices",
  "/student/payments",
  "/student/contracts",
  "/student/room-contract",
  "/student/residence",
  "/student/notifications",
  // FIX: cho phép xem lịch sử báo hỏng cũ khi phòng đã bị thu hồi (trả phòng xong),
  // tránh mất dấu vết các yêu cầu đã tạo khi còn ở KTX.
  "/student/maintenance",
  "/change-password",
  // FIX: trang kết quả thanh toán (QR VietQR) phải vào được khi SV chưa có phòng,
  // nếu không gate sẽ đá SV về /student/rooms ngay sau khi bấm "Thanh toán"
  // => triệu chứng "không có page thanh toán".
  "/student/payment-result",
];
export const STUDENT_NO_ROOM_HOME = "/student/rooms";
export const STUDENT_HOUSED_BLOCKED = ["/student/rooms", "/student/applications"];

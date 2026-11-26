// ====================================
// CONSTANTS - Các hằng số dùng chung
// ====================================
// File này chứa labels, field configs, status colors...
// Mục đích: Tách riêng phần cấu hình để dễ bảo trì và mở rộng

/**
 * FIELD_LABELS: Object chứa nhãn hiển thị tiếng Việt cho mỗi field
 * Key: Tên field trong code (vd: "fullName", "email")
 * Value: Nhãn hiển thị trên UI (vd: "Họ và tên", "Email")
 */
export const FIELD_LABELS = {
  // Thông tin cơ bản
  id: "Mã",
  name: "Tên",
  fullName: "Họ và tên",
  studentName: "Sinh viên",
  studentCode: "Mã sinh viên",
  cic: "CCCD",
  email: "Email",
  phone: "Số điện thoại",
  phoneNumber: "Số điện thoại",
  address: "Địa chỉ",
  gender: "Giới tính",
  dateOfBirth: "Ngày sinh",
  username: "Tên đăng nhập",
  password: "Mật khẩu",
  oldPassword: "Mật khẩu hiện tại",
  newPassword: "Mật khẩu mới",
  confirmPassword: "Xác nhận mật khẩu mới",

  // Thông tin phòng
  roomNumber: "Phòng",
  buildingName: "Tòa nhà",
  buildingId: "Mã tòa nhà",
  buildingCode: "Mã tòa",
  roomId: "Mã phòng",
  roomType: "Loại phòng",
  genderRestriction: "Đối tượng",
  electricMeterNumber: "Mã đồng hồ điện",
  waterMeterNumber: "Mã đồng hồ nước",
  capacity: "Sức chứa",
  currentOccupancy: "Đang ở",
  availableSlots: "Chỗ trống",
  floor: "Tầng",
  totalFloors: "Tổng số tầng",
  availableRooms: "Phòng còn trống",
  residents: "Sinh viên đang cư trú",

  // Thông tin tài chính
  monthlyPrice: "Giá hàng tháng",
  pricePerMonth: "Giá hàng tháng",
  monthlyRent: "Tiền thuê tháng",
  depositAmount: "Tiền cọc",
  price: "Giá",
  totalAmount: "Tổng tiền",
  electricityAmount: "Tiền điện",
  waterAmount: "Tiền nước",
  serviceAmount: "Phí dịch vụ",

  // Thông tin thời gian
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
  startDate: "Ngày bắt đầu",
  endDate: "Ngày kết thúc",
  dueDate: "Hạn thanh toán",
  issueDate: "Ngày phát hành",
  billingMonth: "Kỳ thanh toán",
  month: "Tháng",
  year: "Năm",
  requestDate: "Ngày nộp",
  processedAt: "Ngày xử lý",
  assignedAt: "Ngày phân phòng",
  checkInAt: "Ngày nhận phòng",
  checkOutAt: "Ngày trả phòng",
  readAt: "Ngày đọc",

  // Trạng thái và phân loại
  status: "Trạng thái",
  assignmentStatus: "Trạng thái phân phòng",
  contractStatus: "Trạng thái hợp đồng",
  type: "Loại",
  invoiceType: "Loại hóa đơn",
  itemType: "Khoản thu",
  priority: "Mức ưu tiên",
  overdue: "Quá hạn",
  quantity: "Số lượng",
  unitPrice: "Đơn giá",
  amount: "Thành tiền",

  // Thông tin hợp đồng và hóa đơn
  contractId: "Mã hợp đồng",
  invoiceId: "Mã hóa đơn",
  paymentId: "Mã thanh toán",
  method: "Phương thức",

  // Thanh toán / giao dịch SePay (màn quản lý)
  paymentReference: "Mã tham chiếu",
  expectedAmount: "Số tiền",
  transferAmount: "Số tiền GD",
  receivingBankCode: "Ngân hàng nhận",
  receivingAccountNumber: "TK nhận",
  expiresAt: "Hiệu lực đến",
  paidAt: "Thời gian trả tiền",
  sepayTransactionId: "Mã GD SePay",
  gateway: "Ngân hàng (SePay)",
  accountNumber: "Số TK nhận",
  transferType: "Loại giao dịch",
  code: "Mã trong nội dung CK",
  content: "Nội dung CK",
  bankReferenceCode: "Mã GD ngân hàng",
  transactionAt: "Thời gian GD",
  receivedAt: "Nhận lúc",
  reviewReason: "Lý do chờ đối soát",

  // Đơn đăng ký
  requestedRoomId: "Mã phòng chọn",
  requestedRoomNumber: "Phòng chọn",
  requestedBuildingId: "Mã tòa chọn",
  requestedBuildingName: "Tòa nhà chọn",
  note: "Ghi chú",
  reviewNote: "Ghi chú duyệt",
  studentId: "Mã sinh viên",
  accountStatus: "Trạng thái tài khoản",
  studentGender: "Giới tính SV",

  // Checkout requests (Trả phòng)
  checkoutRequestId: "Mã yêu cầu",
  checkoutDate: "Ngày trả phòng",
  reason: "Lý do",
  depositStatus: "Trạng thái cọc",
  depositDisposition: "Xử lý cọc",

  // Renewal requests (Gia hạn)
  renewalRequestId: "Mã yêu cầu",
  requestedEndDate: "Ngày kết thúc mới",
  contractEndDate: "Ngày kết thúc HĐ",
  reviewedById: "Người duyệt",
  reviewedAt: "Ngày duyệt",

  // Room transfer requests (Chuyển phòng)
  transferId: "Mã yêu cầu",
  responseDeadline: "Hạn phản hồi",
  completionDeadline: "Hạn hoàn tất bàn giao",
  completedAt: "Thời điểm hoàn tất",
  currentRoomId: "Phòng hiện tại",
  currentRoomNumber: "Phòng hiện tại",
  preferredRoomNumber: "Phòng mong muốn",
  approvedRoomNumber: "Phòng được duyệt",
  preferredRoomId: "Phòng mong muốn",
  approvedRoomId: "Phòng được duyệt",
  currentAssignmentId: "Mã phân phòng hiện tại",
  requestedAt: "Ngày yêu cầu",

  // Nội dung
  title: "Tiêu đề",
  body: "Nội dung",
  description: "Mô tả",
  rejectionReason: "Lý do từ chối",
  imageUrl: "Ảnh đính kèm",

  // Phân quyền
  role: "Vai trò",
  isRead: "Đã đọc",
  read: "Đã đọc",
  action: "Hành động",
  resource: "Đối tượng",

  // Dashboard metrics (manager)
  totalStudents: "Tổng số sinh viên",
  totalRooms: "Tổng số phòng",
  occupiedRooms: "Phòng đã sử dụng",
  pendingApplications: "Đơn chờ duyệt",
  openMaintenance: "Báo hỏng đang xử lý",
  unpaidInvoices: "Hóa đơn chưa thanh toán",
};

/**
 * FIELD_CONFIGS: Object chứa cấu hình cho từng loại field
 * Định nghĩa input type, options cho dropdown, min/max cho number...
 */
export const FIELD_CONFIGS = {
  // Input type = email (tự động validate email format)
  email: { type: "email" },

  // Input type = tel (keyboard điện thoại trên mobile)
  phone: { type: "tel" },
  phoneNumber: { type: "tel" },

  // Password fields
  password: { type: "password", minLength: 8, placeholder: "Tối thiểu 8 ký tự" },
  oldPassword: { type: "password", required: true },
  newPassword: { type: "password", required: true, minLength: 8 },
  confirmPassword: { type: "password", required: true },

  // Username
  username: { type: "text", minLength: 3, maxLength: 30, required: true },

  // Textarea (dùng cho nội dung dài)
  description: { tag: "textarea" },
  body: { tag: "textarea" },
  note: { tag: "textarea" },
  reason: { tag: "textarea" },

  // Date picker
  dateOfBirth: { type: "date", max: new Date().toISOString().split("T")[0] },
  expectedCheckInDate: { type: "date" },
  dueDate: { type: "date" },
  startDate: { type: "date" },
  endDate: { type: "date" },
  checkoutDate: { type: "date" },
  requestedEndDate: { type: "date" },

  // Number với min/max
  month: { type: "number", min: 1, max: 12 },
  year: { type: "number", min: 2020 },
  capacity: { type: "number", min: 1 },
  floor: { type: "number", min: 1 },
  monthlyPrice: { type: "number", min: 0 },
  pricePerMonth: { type: "number", min: 0 },
  electricityAmount: { type: "number", min: 0 },
  waterAmount: { type: "number", min: 0 },
  serviceAmount: { type: "number", min: 0 },
  amount: { type: "number", min: 0 },
  totalAmount: { type: "number", min: 0 },
  depositAmount: { type: "number", min: 0 },

  // Dropdown với options cố định
  gender: {
    options: [
      { label: "Nam", value: "MALE" },
      { label: "Nữ", value: "FEMALE" },
    ],
  },
  role: { options: ["STUDENT", "MANAGER"] },
  status: { options: ["ACTIVE", "OPEN", "CLOSED", "MAINTENANCE", "LOCKED"] },
  priority: { options: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
  type: {
    options: [
      { label: "Quạt", value: "FAN" },
      { label: "Điều hòa", value: "AIR_CONDITIONER" },
      { label: "Tủ lạnh", value: "REFRIGERATOR" },
      { label: "Chiếu sáng", value: "LIGHTING" },
      { label: "Hệ thống nước", value: "PLUMBING" },
      { label: "Nội thất", value: "FURNITURE" },
      { label: "Cửa/Cửa sổ", value: "DOOR_WINDOW" },
      { label: "Khác", value: "OTHER" },
    ],
  },
};

/**
 * Hàm xác định màu sắc cho status badge
 * @param {string} status - Trạng thái (vd: "APPROVED", "REJECTED", "PENDING")
 * @returns {string} - Tên class CSS ("green", "red", "amber")
 *
 * Logic:
 * - green: trạng thái thành công, hoàn thành
 * - red: trạng thái bị từ chối, thất bại
 * - amber: trạng thái chờ xử lý (mặc định)
 */
export function getStatusColor(status) {
  // Kiểm tra status có phải trạng thái "tích cực" không
  if (
    /^(APPROVED|ACTIVE|PAID|COMPLETED|OPEN|SUCCESS|CHECKED_IN|MATCHED)$/i.test(status)
  ) {
    return "green";
  }

  // Kiểm tra status có phải trạng thái "tiêu cực" không
  if (/^(REJECTED|FAILED|CLOSED|HELD)$/i.test(status)) {
    return "red";
  }

  // Mặc định: màu amber cho trạng thái chờ xử lý
  return "amber";
}

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
  email: "Email",
  phone: "Số điện thoại",
  address: "Địa chỉ",
  gender: "Giới tính",
  
  // Thông tin phòng
  roomNumber: "Phòng",
  buildingName: "Tòa nhà",
  buildingId: "Mã tòa nhà",
  roomId: "Mã phòng",
  roomType: "Loại phòng",
  capacity: "Sức chứa",
  availableSlots: "Chỗ trống",
  floor: "Tầng",
  
  // Thông tin tài chính
  monthlyPrice: "Giá hàng tháng",
  price: "Giá",
  totalAmount: "Tổng tiền",
  amount: "Số tiền",
  electricityAmount: "Tiền điện",
  waterAmount: "Tiền nước",
  serviceAmount: "Phí dịch vụ",
  
  // Thông tin thời gian
  createdAt: "Ngày tạo",
  startDate: "Ngày bắt đầu",
  endDate: "Ngày kết thúc",
  dueDate: "Hạn thanh toán",
  period: "Kỳ",
  month: "Tháng",
  year: "Năm",
  
  // Trạng thái và phân loại
  status: "Trạng thái",
  type: "Loại",
  priority: "Mức ưu tiên",
  
  // Thông tin hợp đồng và hóa đơn
  termName: "Đợt đăng ký",
  contractId: "Mã hợp đồng",
  invoiceId: "Mã hóa đơn",
  method: "Phương thức",
  
  // Nội dung
  title: "Tiêu đề",
  body: "Nội dung",
  description: "Mô tả",
  
  // Phân quyền
  role: "Vai trò",
  read: "Đã đọc",
  action: "Hành động",
  resource: "Đối tượng",
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
  
  // Textarea (dùng cho nội dung dài)
  description: { tag: "textarea" },
  body: { tag: "textarea" },
  note: { tag: "textarea" },
  
  // Date picker
  expectedCheckInDate: { type: "date" },
  dueDate: { type: "date" },
  startDate: { type: "date" },
  endDate: { type: "date" },
  
  // Number với min/max
  month: { type: "number", min: 1, max: 12 },
  year: { type: "number", min: 2020 },
  capacity: { type: "number", min: 1 },
  floor: { type: "number", min: 0 },
  monthlyPrice: { type: "number", min: 0 },
  electricityAmount: { type: "number", min: 0 },
  waterAmount: { type: "number", min: 0 },
  serviceAmount: { type: "number", min: 0 },
  
  // Dropdown với options cố định
  gender: { options: ["Nam", "Nữ"] },
  role: { options: ["STUDENT", "MANAGER"] },
  status: { options: ["ACTIVE", "OPEN", "CLOSED", "MAINTENANCE", "LOCKED"] },
  priority: { options: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
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
  if (/^(APPROVED|ACTIVE|PAID|RESOLVED|OPEN|SUCCESS|CHECKED_IN)$/i.test(status)) {
    return "green";
  }
  
  // Kiểm tra status có phải trạng thái "tiêu cực" không
  if (/^(REJECTED|FAILED|OVERDUE|CLOSED)$/i.test(status)) {
    return "red";
  }
  
  // Mặc định: màu amber cho trạng thái chờ xử lý
  return "amber";
}

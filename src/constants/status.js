export const STATUS_LABELS = Object.freeze({
  // Đơn đăng ký KTX
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',

  // Phân phòng
  ASSIGNED: 'Đã phân phòng',
  CHECKED_IN: 'Đã nhận phòng',
  CHECKED_OUT: 'Đã trả phòng',

  // Hợp đồng
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Hết hạn',
  TERMINATED: 'Đã chấm dứt',
  CANCELLED: 'Đã hủy',

  // Hóa đơn & Thanh toán
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
  PENDING_PAYMENT: 'Chờ thanh toán',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  FORFEITED: 'Đã tịch thu',
  ROOM_FEE: 'Tiền phòng',
  UTILITY: 'Điện nước',
  DEPOSIT: 'Tiền đặt cọc',
  ROOM: 'Tiền phòng',
  ELECTRICITY: 'Tiền điện',
  WATER: 'Tiền nước',
  HELD: 'Đang giữ',
  IN: 'Tiền vào',
  OUT: 'Tiền ra',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CASH: 'Tiền mặt',
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',

  // Bảo trì / Sửa chữa
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Đã hoàn thành',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  REVIEW_REQUIRED: 'Cần đối soát',
  PROCESSING: 'Đang xử lý',
  WAITING: 'Đang chờ xử lý',
  DONE: 'Đã hoàn thành',
  CONFIRMED: 'Đã xác nhận',
  OVERDUE: 'Quá hạn',
  EXPIRED_PAYMENT: 'Đã hết hạn thanh toán',

  // Phòng / Tòa nhà
  AVAILABLE: 'Còn trống',
  OCCUPIED: 'Đã đầy',
  RESERVED: 'Đã đặt',
  MAINTENANCE: 'Đang bảo trì',
  INACTIVE: 'Ngừng hoạt động',
  LOCKED: 'Đã khóa',

  // Giao dịch SePay
  MATCHED: 'Đã khớp',
  UNMATCHED: 'Chưa khớp',

  // Tài khoản
  ENABLED: 'Đang hoạt động',
  DISABLED: 'Đã khóa',
  PENDING_VERIFICATION: 'Chờ xác minh',
});

export const FILTERABLE_STATUSES = Object.freeze([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ASSIGNED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'ACTIVE',
  'EXPIRED',
  'UNPAID',
  'PAID',
  'OVERDUE',
  'PROCESSING',
  'RESOLVED',
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'CLOSED',
]);

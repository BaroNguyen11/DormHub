import { cn } from "@/lib/utils";

// Neo-Brutalism Status Variants Mapping
// Tinh chỉnh Tương phản: Xanh Neon (bg-success) & Vàng Neon (bg-warning) DÙNG CHỮ ĐEN (text-black) để hiển thị rõ nhất.
const statusVariants = {
  // 1. Success states - NEON Green
  ACTIVE: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang hoạt động",
  },
  DRAFT: {
    className:
      "bg-surface-3 text-text border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Bản nháp",
  },
  APPROVED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã duyệt",
  },
  PAID: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã thanh toán",
  },
  RESOLVED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã xử lý",
  },
  CHECKED_IN: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã check-in",
  },
  SUCCESS: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Thành công",
  },
  // FIX: trạng thái phòng/hợp đồng/phân phòng trước đây rơi vào "KHÔNG XÁC ĐỊNH"
  AVAILABLE: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Còn trống",
  },
  OCCUPIED: {
    className:
      "bg-info text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã đầy",
  },
  ASSIGNED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã phân phòng",
  },
  HELD: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang giữ cọc",
  },
  // FIX: trạng thái giao dịch SePay (màn "Giao dịch SePay" của quản lý)
  MATCHED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã khớp",
  },

  // 2. Warning states - NEON Yellow
  OPEN: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang mở",
  },
  UNPAID: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chưa thanh toán",
  },
  IN_PROGRESS: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang xử lý",
  },
  PENDING: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đợi xử lý",
  },
  COMPLETED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã hoàn thành",
  },
  DONE: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã hoàn thành",
  },
  WAITING: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang chờ xử lý",
  },
  PROCESSING: {
    className:
      "bg-info text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang xử lý",
  },
  PENDING_PAYMENT: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chờ thanh toán",
  },
  CONFIRMED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã xác nhận",
  },
  RESERVED: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã đặt trước",
  },
  PENDING_VERIFICATION: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chờ xác minh",
  },
  INACTIVE: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Ngừng hoạt động",
  },
  ENABLED: {
    className:
      "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang hoạt động",
  },
  DISABLED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã khóa",
  },
  REFUNDED: {
    className:
      "bg-info text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã hoàn tiền",
  },
  FORFEITED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã tịch thu",
  },
  MAINTENANCE: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Bảo trì",
  },
  EXPIRED: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Hết hạn",
  },
  REVIEW_REQUIRED: {
    className:
      "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chờ đối soát",
  },

  // 3. Error states - NEON Red
  REJECTED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Từ chối",
  },
  FAILED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Thất bại",
  },
  OVERDUE: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Quá hạn",
  },
  CLOSED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đóng",
  },
  LOCKED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã khóa",
  },
  CHECKED_OUT: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã trả phòng",
  },
  CANCELLED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã hủy",
  },
  TERMINATED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã chấm dứt",
  },
  UNMATCHED: {
    className:
      "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Không khớp",
  },

  READ: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã đọc",
  },
  UNREAD: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chưa đọc",
  },

  // 4. Default state - Neutral Gray
  DEFAULT: {
    className:
      "bg-surface-3 text-text-muted border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Không xác định",
  },
};

export function StatusBadge({ status, className }) {
  // Chuẩn hóa status key thành chữ hoa
  const normalizedKey =
    typeof status === "string" ? status.toUpperCase() : "DEFAULT";
  const variant = statusVariants[normalizedKey] || statusVariants.DEFAULT;
  const label = variant.label || status;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-sm text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap select-none transition-transform ",
        variant.className,
        className,
      )}
    >
      {label}
    </span>
  );
}

const maintenanceStatusVariants = {
  PENDING: { label: "ĐỢI XỬ LÝ", className: "bg-warning text-black" },
  WAITING: { label: "ĐỢI XỬ LÝ", className: "bg-warning text-black" },
  IN_PROGRESS: { label: "ĐANG XỬ LÝ", className: "bg-info text-black" },
  PROCESSING: { label: "ĐANG XỬ LÝ", className: "bg-info text-black" },
  COMPLETED: { label: "ĐÃ HOÀN THÀNH", className: "bg-success text-black" },
  RESOLVED: { label: "ĐÃ HOÀN THÀNH", className: "bg-success text-black" },
  DONE: { label: "ĐÃ HOÀN THÀNH", className: "bg-success text-black" },
  REJECTED: { label: "TỪ CHỐI", className: "bg-error text-white" },
  CANCELLED: { label: "TỪ CHỐI", className: "bg-error text-white" },
};

export function MaintenanceStatusBadge({ status, className }) {
  const normalizedStatus =
    typeof status === "string" ? status.toUpperCase() : "";
  const variant = maintenanceStatusVariants[normalizedStatus] || {
    label: normalizedStatus || "KHÔNG RÕ",
    className: "bg-surface-3 text-text-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 border-2 border-line-strong rounded-sm text-xs! shadow-[2px_2px_0_#141413] font-extrabold",
        variant.className,
        className,
      )}
    >
      {variant.label}
    </span>
  );
}

// import { cn } from "@/lib/utils";

// const statusVariants = {
//   // Success states - NEON green
//   ACTIVE: {
//     className:
//       "bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đang hoạt động",
//   },
//   APPROVED: {
//     className:
//       "bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đã duyệt",
//   },
//   PAID: {
//     className:
//       "bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đã thanh toán",
//   },
//   RESOLVED: {
//     className:
//       "bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đã xử lý",
//   },
//   CHECKED_IN: {
//     className:
//       "bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đã check-in",
//   },
//   SUCCESS: {
//     className:
//       "bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Thành công",
//   },

//   // Warning states - NEON yellow
//   OPEN: {
//     className:
//       "bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đang mở",
//   },
//   UNPAID: {
//     className:
//       "bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Chưa thanh toán",
//   },
//   IN_PROGRESS: {
//     className:
//       "bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đang xử lý",
//   },
//   PENDING: {
//     className:
//       "bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đợi xử lý",
//   },

//   // Error states - NEON red
//   REJECTED: {
//     className:
//       "bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Từ chối",
//   },
//   FAILED: {
//     className:
//       "bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Thất bại",
//   },
//   OVERDUE: {
//     className:
//       "bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Quá hạn",
//   },
//   CLOSED: {
//     className:
//       "bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đóng",
//   },
//   LOCKED: {
//     className:
//       "bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
//     label: "Đã khóa",
//   },

//   // Default
//   DEFAULT: {
//     className:
//       "bg-[#f3f4f6] text-[#4b5563] border-3 border-[#333333] shadow-[2px_2px_0_rgba(0,0,0,0.15)]",
//     label: "Không xác định",
//   },
// };

// export function StatusBadge({ status, className }) {
//   const variant = statusVariants[status] || statusVariants.DEFAULT;
//   const label = variant.label || status;

//   return (
//     <span
//       className={cn(
//         "inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-(family-name:--font-family-display) font-bold uppercase tracking-wider",
//         variant.className,
//         className,
//       )}
//     >
//       {label}
//     </span>
//   );
// }

import { cn } from "@/lib/utils";

// Neo-Brutalism Status Variants Mapping
// Tinh chỉnh Tương phản: Xanh Neon (bg-success) & Vàng Neon (bg-warning) DÙNG CHỮ ĐEN (text-black) để hiển thị rõ nhất.
const statusVariants = {
  // 1. Success states - NEON Green
  ACTIVE: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang hoạt động",
  },
  APPROVED: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã duyệt",
  },
  PAID: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã thanh toán",
  },
  RESOLVED: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã xử lý",
  },
  CHECKED_IN: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã check-in",
  },
  SUCCESS: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Thành công",
  },
  // FIX: trạng thái phòng/hợp đồng/phân phòng trước đây rơi vào "KHÔNG XÁC ĐỊNH"
  AVAILABLE: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Còn trống",
  },
  ASSIGNED: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã phân phòng",
  },
  HELD: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang giữ cọc",
  },
  // FIX: trạng thái giao dịch SePay (màn "Giao dịch SePay" của quản lý)
  MATCHED: {
    className: "bg-success text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã khớp",
  },

  // 2. Warning states - NEON Yellow
  OPEN: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang mở",
  },
  UNPAID: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chưa thanh toán",
  },
  IN_PROGRESS: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đang xử lý",
  },
  PENDING: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đợi xử lý",
  },
  MAINTENANCE: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Bảo trì",
  },
  EXPIRED: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Hết hạn",
  },
  REVIEW_REQUIRED: {
    className: "bg-warning text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Chờ đối soát",
  },

  // 3. Error states - NEON Red
  REJECTED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Từ chối",
  },
  FAILED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Thất bại",
  },
  OVERDUE: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Quá hạn",
  },
  CLOSED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đóng",
  },
  LOCKED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã khóa",
  },
  CHECKED_OUT: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã trả phòng",
  },
  CANCELLED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã hủy",
  },
  TERMINATED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Đã chấm dứt",
  },
  UNMATCHED: {
    className: "bg-error text-white border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Không khớp",
  },

  // 4. Default state - Neutral Gray
  DEFAULT: {
    className: "bg-surface-3 text-text-muted border-2 border-line-strong shadow-[2px_2px_0_#141413]",
    label: "Không xác định",
  },
};

export function StatusBadge({ status, className }) {
  // Chuẩn hóa status key thành chữ hoa
  const normalizedKey = typeof status === "string" ? status.toUpperCase() : "DEFAULT";
  const variant = statusVariants[normalizedKey] || statusVariants.DEFAULT;
  const label = variant.label || status;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-sm text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap select-none transition-transform ",
        variant.className,
        className
      )}
    >
      {label}
    </span>
  );
}
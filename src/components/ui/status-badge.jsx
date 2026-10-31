import { cn } from '@/lib/utils';

const statusVariants = {
  // Success states - NEON green
  ACTIVE: { className: 'bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đang hoạt động' },
  APPROVED: { className: 'bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đã duyệt' },
  PAID: { className: 'bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đã thanh toán' },
  RESOLVED: { className: 'bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đã xử lý' },
  CHECKED_IN: { className: 'bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đã check-in' },
  SUCCESS: { className: 'bg-[#00ff88] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Thành công' },
  
  // Warning states - NEON yellow
  OPEN: { className: 'bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đang mở' },
  UNPAID: { className: 'bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Chưa thanh toán' },
  IN_PROGRESS: { className: 'bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đang xử lý' },
  PENDING: { className: 'bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đợi xử lý' },
  
  // Error states - NEON red
  REJECTED: { className: 'bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Từ chối' },
  FAILED: { className: 'bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Thất bại' },
  OVERDUE: { className: 'bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Quá hạn' },
  CLOSED: { className: 'bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đóng' },
  LOCKED: { className: 'bg-[#ff3366] text-white border-3 border-[#000000] shadow-[2px_2px_0_rgba(0,0,0,0.2)]', label: 'Đã khóa' },
  
  // Default
  DEFAULT: { className: 'bg-[#f3f4f6] text-[#4b5563] border-3 border-[#333333] shadow-[2px_2px_0_rgba(0,0,0,0.15)]', label: 'Không xác định' },
};

export function StatusBadge({ status, className }) {
  const variant = statusVariants[status] || statusVariants.DEFAULT;
  const label = variant.label || status;
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-[family-name:var(--font-family-display)] font-bold uppercase tracking-wider',
      variant.className,
      className
    )}>
      {label}
    </span>
  );
}

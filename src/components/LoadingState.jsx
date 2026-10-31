// Hiển thị skeleton loading với Hallmark styling
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

// Loading đơn giản - chỉ hiện spinner
export function SimpleLoading() {
  return (
    <div className="p-[60px_20px] text-center text-[var(--color-text-muted)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="inline-block mb-3"
      >
        <RefreshCw size={32} className="text-[var(--color-primary)]" />
      </motion.div>
      <p className="font-[family-name:var(--font-family-body)] text-sm">Đang tải dữ liệu...</p>
    </div>
  );
}

// Loading cho bảng dữ liệu (ví dụ: danh sách phòng)
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="p-5">
      {/* Header của bảng */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="h-10 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] mb-4"
      />
      
      {/* Các dòng dữ liệu giả */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3 mb-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: (rowIndex * 0.1) + (colIndex * 0.05)
              }}
              className="h-8 flex-1 bg-[var(--color-surface-3)] rounded-[var(--radius-sm)]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading cho form (ví dụ: chi tiết hợp đồng)
export function FormSkeleton() {
  return (
    <div className="p-5 max-w-[600px]">
      {/* Giả lập 5 input fields */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-5">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.1
            }}
            className="w-[120px] h-4 bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] mb-2"
          />
          {/* Input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.1 + 0.05
            }}
            className="h-11 bg-[var(--color-surface-3)] rounded-[var(--radius-md)]"
          />
        </div>
      ))}
    </div>
  );
}

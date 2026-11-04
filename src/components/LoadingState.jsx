// ====================================
// LOADING & SKELETON COMPONENTS (Neo-Brutalism)
// ====================================
import { motion } from 'motion/react';
import { RefreshCw, Loader2 } from 'lucide-react';

// Loading đơn giản - Spinner xoay tròn nổi bật
export function SimpleLoading() {
  return (
    <div className="py-16 px-5 text-center text-text-muted flex flex-col items-center justify-center gap-3">
      <div className="size-12 rounded-xl bg-primary border-3 border-line-strong flex items-center justify-center shadow-[3px_3px_0_#141413]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={24} className="text-black" strokeWidth={2.5} />
        </motion.div>
      </div>
      <p className="text-sm font-black text-text">Đang tải dữ liệu...</p>
    </div>
  );
}

// Loading cho bảng dữ liệu (Table Skeleton)
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="p-6 bg-white border-4 border-line-strong rounded-2xl shadow-[6px_6px_0_#141413] space-y-4">
      {/* Header của bảng giả lập */}
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="h-11 bg-surface-2 border-2 border-line-strong rounded-xl shadow-[2px_2px_0_#141413]"
      />
      
      {/* Các dòng dữ liệu giả lập */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: (rowIndex * 0.08) + (colIndex * 0.04)
              }}
              className="h-9 flex-1 bg-surface border-2 border-line-strong/60 rounded-lg shadow-[1.5px_1.5px_0_#141413]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading cho form (Form Skeleton)
export function FormSkeleton() {
  return (
    <div className="p-6 sm:p-8 bg-white border-4 border-line-strong rounded-2xl shadow-[6px_6px_0_#141413] max-w-2xl space-y-6">
      {/* Giả lập 4-5 input fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Label giả lập */}
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.1
            }}
            className="w-32 h-4 bg-surface-2 border border-line-strong/40 rounded-md"
          />
          {/* Input giả lập */}
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.1 + 0.05
            }}
            className="h-12 bg-white border-3 border-line-strong rounded-xl shadow-[2px_2px_0_#141413]"
          />
        </div>
      ))}
    </div>
  );
}
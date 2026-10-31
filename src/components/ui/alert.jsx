import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  success: {
    icon: CheckCircle,
    className: 'bg-[#e0f7e8] border-3 border-[#00ff88] text-[#1a1a1a] shadow-[3px_3px_0_rgba(0,0,0,0.15)]',
  },
  error: {
    icon: XCircle,
    className: 'bg-[#ffe0e8] border-3 border-[#ff3366] text-[#1a1a1a] shadow-[3px_3px_0_rgba(0,0,0,0.15)]',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-[#fffbe0] border-3 border-[#ffcc00] text-[#1a1a1a] shadow-[3px_3px_0_rgba(0,0,0,0.15)]',
  },
  info: {
    icon: Info,
    className: 'bg-[#e0f7ff] border-3 border-[#00d2ff] text-[#1a1a1a] shadow-[3px_3px_0_rgba(0,0,0,0.15)]',
  },
};

export function Alert({ 
  variant = 'info',
  children,
  onClose,
  className 
}) {
  const { icon: Icon, className: variantClass } = variants[variant];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-[var(--radius-md)]',
        variantClass,
        className
      )}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm leading-relaxed">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}

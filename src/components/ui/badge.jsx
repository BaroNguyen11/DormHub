import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-[#e5e7eb] text-[#1a1a1a] border-3 border-[#333333]',
  primary: 'bg-[#00d2ff] text-white border-3 border-[#00d2ff]',
  success: 'bg-[#00ff88] text-white border-3 border-[#00ff88]',
  warning: 'bg-[#ffcc00] text-[#1a1a1a] border-3 border-[#ffcc00]',
  error: 'bg-[#ff3366] text-white border-3 border-[#ff3366]',
  info: 'bg-[#00d2ff] text-white border-3 border-[#00d2ff]',
};

export function Badge({ 
  children, 
  variant = 'default',
  className 
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-[family-name:var(--font-family-display)] font-bold shadow-[2px_2px_0_rgba(0,0,0,0.2)]',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-surface-2 text-text border-3 border-line',
  primary: 'bg-primary text-surface border-3 border-primary',
  success: 'bg-success text-text border-3 border-success',
  warning: 'bg-warning text-text border-3 border-warning',
  error: 'bg-error text-surface border-3 border-error',
  info: 'bg-primary text-surface border-3 border-primary',
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

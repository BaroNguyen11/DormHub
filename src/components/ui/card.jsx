import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function Card({ 
  children, 
  hover = false,
  className,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={cn(
        'bg-surface border-3 border-line rounded-[var(--radius-lg)] p-6 shadow-[4px_4px_0_rgba(0,0,0,0.15)]',
        hover && 'transition-all hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:border-primary',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn(
      'text-lg font-[family-name:var(--font-family-display)] font-bold text-[var(--color-text)]',
      className
    )}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-[var(--color-text-muted)] mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('mt-6 flex items-center gap-3', className)}>
      {children}
    </div>
  );
}

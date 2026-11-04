import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

const buttonVariants = {
  // Neo-Brutalism REAL - 3px borders, neon colors, strong shadows
  primary: {
    base: 'bg-primary text-(--color-text) font-bold! border-3 border-line-strong shadow-(--shadow-sm)',
    hover: ' hover:shadow-(--shadow-md) hover:-translate-0.5',
    focus: 'focus-visible:ring-primary',
  },
  accent: {
    base: 'bg-accent text-(--color-text) font-bold! border-3 border-line-strong shadow-(--shadow-sm)',
    hover: 'hover:bg-accent-hover hover:shadow-(--shadow-md) hover:-translate-0.5',
    focus: 'focus-visible:ring-accent',
  },
  secondary: {
    base: 'bg-surface text-text border-3 border-line shadow-(--shadow-sm)',
    hover: 'hover:shadow-(--shadow-md) hover:border-primary hover:-translate-0.5',
    focus: 'focus-visible:ring-primary',
  },
  ghost: {
    base: 'bg-transparent text-text border-3 border-transparent',
    hover: 'hover:bg-surface-3',
    focus: 'focus-visible:ring-primary',
  },
  outline: {
    base: 'bg-surface text-(--color-text) font-bold! border-3 border-line-strong shadow-(--shadow-sm)',
    hover: ' hover:shadow-(--shadow-md) hover:-translate-y-1 hover:translate-x-[-2px]',
    focus: 'focus-visible:ring-primary',
  },
  destructive: {
    base: 'bg-error-light text-error border-3 border-error shadow-[4px_4px_0_rgba(255,51,102,0.2)]',
    hover: 'hover:bg-error hover:text-surface hover:shadow-[6px_6px_0_rgba(255,51,102,0.3)] hover:-translate-y-1 hover:translate-x-[-2px]',
    focus: 'focus-visible:ring-error',
  },
};

const sizeVariants = {
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-11 px-6 text-base gap-2',
  lg: 'h-13 px-8 text-lg gap-2',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props 
}) {
  const variantStyle = buttonVariants[variant];
  
  return (
    <motion.button
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={disabled || loading}
      className={cn(
        // Base
        'inline-flex items-center justify-center font-(family-name:--font-family-display) font-bold',
        'rounded-md transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:translate-0.5 active:shadow-none',
        // Variant
        variantStyle.base,
        variantStyle.hover,
        variantStyle.focus,
      
        // Size
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {loading && <Loader size={16} className="animate-spin" />}
      {children}
    </motion.button>
  );
}

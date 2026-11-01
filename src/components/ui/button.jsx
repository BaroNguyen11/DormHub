import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

const buttonVariants = {
  // Neo-Brutalism REAL - 3px borders, neon colors, strong shadows
  primary: {
    base: 'bg-[#00d2ff] text-(--color-text) font-bold! border-3 border-[#000000] shadow-(--shadow-sm)',
    hover: ' hover:shadow-(--shadow-md) hover:-translate-0.5',
    focus: 'focus-visible:ring-[#00d2ff]',
  },
  accent: {
    base: 'bg-[#ff6b6b] text-(--color-text) font-bold! border-3 border-[#000000] shadow-(--shadow-sm)',
    hover: 'hover:bg-[#ff5252] hover:shadow-(--shadow-md) hover:-translate-0.5',
    focus: 'focus-visible:ring-[#ff6b6b]',
  },
  secondary: {
    base: 'bg-white text-[#1a1a1a] border-3 border-[#333333] shadow-(--shadow-sm)',
    hover: 'hover:shadow-(--shadow-md) hover:border-[#00d2ff] hover:-translate-0.5',
    focus: 'focus-visible:ring-[#00d2ff]',
  },
  ghost: {
    base: 'bg-transparent text-[#1a1a1a] border-3 border-transparent',
    hover: 'hover:bg-[#f3f4f6]',
    focus: 'focus-visible:ring-[#00d2ff]',
  },
  outline: {
    base: 'bg-white text-(--color-text) font-bold! border-3 border-[#1a1a1a] shadow-(--shadow-sm)',
    hover: ' hover:shadow-(--shadow-md) hover:-translate-y-1 hover:translate-x-[-2px]',
    focus: 'focus-visible:ring-[#00d2ff]',
  },
  destructive: {
    base: 'bg-[#ffe0e8] text-[#ff3366] border-3 border-[#ff3366] shadow-[4px_4px_0_rgba(255,51,102,0.2)]',
    hover: 'hover:bg-[#ff3366] hover:text-white hover:shadow-[6px_6px_0_rgba(255,51,102,0.3)] hover:-translate-y-1 hover:translate-x-[-2px]',
    focus: 'focus-visible:ring-[#ff3366]',
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

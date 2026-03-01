import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-[0_1px_1px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-primary/30',
  secondary:
    'bg-surface-hover hover:bg-surface-hover/80 text-text-secondary border border-border-strong shadow-[0_1px_1px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-primary/20',
  ghost:
    'bg-transparent hover:bg-surface-hover text-text-tertiary hover:text-text-primary',
  danger:
    'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 focus-visible:ring-2 focus-visible:ring-danger/20',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-6 px-2 text-xs gap-1',
  md: 'h-7 px-3 text-sm gap-1.5',
  lg: 'h-8 px-4 text-sm gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };

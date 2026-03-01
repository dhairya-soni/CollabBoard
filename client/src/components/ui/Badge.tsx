import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface-hover text-text-tertiary border border-border-strong',
  success: 'bg-success/8 text-success/80 border border-success/15',
  warning: 'bg-warning/8 text-warning/80 border border-warning/15',
  danger: 'bg-danger/8 text-danger/80 border border-danger/15',
};

function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-5 rounded px-1.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

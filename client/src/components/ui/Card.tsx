import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/* ── Card Root ── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-surface border border-border rounded-xl shadow-lg shadow-black/20 hover:border-surface-light transition-colors',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/* ── Card Header ── */
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 pt-6 pb-2', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/* ── Card Content ── */
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

/* ── Card Footer ── */
const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 pb-6 pt-2 flex items-center', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };

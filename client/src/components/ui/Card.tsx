import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/* ── Card Root ── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-surface rounded shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/* ── Card Header ── */
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 pt-4 pb-1.5', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/* ── Card Content ── */
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-3', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

/* ── Card Footer ── */
const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-4 pb-4 pt-1.5 flex items-center', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };

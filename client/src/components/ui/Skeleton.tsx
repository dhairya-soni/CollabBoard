import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-surface-light animate-skeleton',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

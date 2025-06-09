import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };

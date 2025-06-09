"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary";
}

export function LoadingSpinner({
  className,
  size = "md",
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  const variantClasses = {
    default: "border-muted-foreground/20 border-t-muted-foreground/60",
    primary: "border-primary/30 border-t-primary",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

export default LoadingSpinner;

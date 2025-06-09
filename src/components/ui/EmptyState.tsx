"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  imageSrc?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  imageSrc,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed",
        className
      )}
    >
      {imageSrc ? (
        <div className="relative h-40 w-40 mb-4">
          <Image
            src={imageSrc}
            alt="Empty state illustration"
            fill
            className="object-contain"
          />
        </div>
      ) : icon ? (
        <div className="mb-4 rounded-full bg-muted p-3">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-medium mt-2">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {(actionLabel && actionHref) || onAction ? (
        <Button
          className="mt-4"
          onClick={onAction}
          asChild={!!actionHref}
        >
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;

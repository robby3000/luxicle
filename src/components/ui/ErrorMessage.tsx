"use client";

import { AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
  variant?: "inline" | "block";
  onRetry?: () => void;
}

export function ErrorMessage({
  title = "Error",
  message,
  className,
  variant = "block",
  onRetry,
}: ErrorMessageProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center text-destructive text-sm", className)}>
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md bg-destructive/10 p-4 border border-destructive/30",
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-destructive">{title}</h3>
          <div className="mt-2 text-sm text-destructive/90">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive/10"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;

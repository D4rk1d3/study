import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressIndicatorProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressIndicator({
  value,
  label,
  showPercentage = true,
  color = "bg-primary-500",
  size = "md",
  className,
}: ProgressIndicatorProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">{clampedValue}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
        <div
          className={cn(color, "rounded-full transition-all duration-300", sizeClasses[size])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

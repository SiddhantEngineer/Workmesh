"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

export function Spinner({
  size = "md",
  color = "currentColor",
  className = "",
  style,
  label = "Loading...",
}: SpinnerProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 18;

  return (
    <span
      role="status"
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      <Loader2
        size={pixelSize}
        className={`animate-spin ${className}`.trim()}
        style={{
          color,
          animation: "spin 1s linear infinite",
          flexShrink: 0,
          ...style,
        }}
      />
    </span>
  );
}

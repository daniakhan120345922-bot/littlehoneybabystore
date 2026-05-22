"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "dark";
type Size = "sm" | "md" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-yellow-300 to-yellow-400 text-stone-900 shadow-lg shadow-yellow-300/30 hover:shadow-yellow-300/40 hover:brightness-110 active:scale-[0.98] font-bold",
  secondary:
    "bg-white text-stone-800 ring-1 ring-stone-200/80 shadow-sm hover:bg-stone-50",
  ghost: "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900",
  danger: "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600",
  outline: "border-2 border-amber-300/60 bg-amber-50/50 text-amber-900 hover:border-amber-400 hover:bg-amber-50",
  dark: "bg-stone-900 text-white hover:bg-stone-800 shadow-lg",
};

const sizes: Record<Size, string> = {
  sm: "gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
  md: "gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
  lg: "gap-2 rounded-xl px-5 py-3 text-base font-semibold",
  xl: "gap-2.5 rounded-2xl px-6 py-4 text-lg font-bold",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

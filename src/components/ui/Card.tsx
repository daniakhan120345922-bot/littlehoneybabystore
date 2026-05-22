import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "glass" | "outline";
};

export function Card({
  children,
  className,
  padding = "md",
  variant = "default",
}: CardProps) {
  const pad = { none: "", sm: "p-4", md: "p-6", lg: "p-8" }[padding];
  const variants = {
    default: "bg-white ring-1 ring-stone-200/70",
    elevated: "bg-white shadow-[var(--shadow-card)] ring-1 ring-stone-100",
    glass: "glass-panel shadow-[var(--shadow-soft)]",
    outline: "bg-transparent ring-1 ring-stone-200/60",
  };

  return (
    <div className={cn("rounded-2xl", variants[variant], pad, className)}>{children}</div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  badge,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {badge && (
          <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800">
            {badge}
          </span>
        )}
        <h2 className="font-display text-xl font-semibold tracking-tight text-stone-900">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

import { getCategoryBadgeClass } from "@/lib/category-styles";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types/inventory";

export function Badge({
  children,
  variant = "default",
  category,
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "category";
  category?: ProductCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        variant === "default" && "bg-stone-100 text-stone-600 ring-stone-200/60",
        variant === "success" && "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
        variant === "warning" && "bg-amber-500/10 text-amber-800 ring-amber-500/20",
        variant === "danger" && "bg-red-500/10 text-red-700 ring-red-500/20",
        variant === "category" && category && getCategoryBadgeClass(category),
        className
      )}
    >
      {children}
    </span>
  );
}

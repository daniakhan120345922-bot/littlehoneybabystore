import type { ProductCategory } from "@/types/inventory";

const STYLES: Record<ProductCategory, string> = {
  Toys: "bg-violet-500/10 text-violet-700 ring-violet-500/20",
  Clothing: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
  Feeding: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  Diapering: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
};

export function getCategoryBadgeClass(category: ProductCategory): string {
  return STYLES[category] ?? "bg-stone-500/10 text-stone-600 ring-stone-500/20";
}

import type { ProductCategory } from "@/types/inventory";

const CATEGORY_SKU_CODES: Record<ProductCategory, string> = {
  Clothing: "000014",
  Toys: "000022",
  Feeding: "000031",
  Diapering: "000045",
};

function normalizeSKU(value: string) {
  return value.trim().toUpperCase().replace(/[^0-9A-Z-]/g, "");
}

function buildSku(category: ProductCategory, productId: string, variant: string) {
  const categoryCode = CATEGORY_SKU_CODES[category] ?? "000000";
  const numericId = productId.replace(/\D/g, "").slice(-3).padStart(3, "0");
  return `${categoryCode}-${numericId}-${variant}`;
}

export async function generateUniqueSku(category: ProductCategory, productId: string, existingSkus: string[]) {
  const normalized = new Set(existingSkus.filter(Boolean).map(normalizeSKU));
  for (let index = 1; index < 1000; index += 1) {
    const variant = String(index).padStart(3, "0");
    const candidate = buildSku(category, productId, variant);
    if (!normalized.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique SKU.");
}

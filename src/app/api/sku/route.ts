import { NextResponse } from "next/server";
import { readInventory } from "@/lib/inventory";
import { generateUniqueSku } from "@/lib/SKUGenerator";
import { requireRole } from "@/lib/session";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { ProductCategory } from "@/types/inventory";

export async function GET(request: Request) {
  const session = await requireRole("owner");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const params = new URL(request.url).searchParams;
  const category = params.get("category") as ProductCategory | null;
  const productId = params.get("productId");

  if (!category || !productId) {
    return NextResponse.json(
      { success: false, error: "Category and productId are required.", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  if (!PRODUCT_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { success: false, error: "Invalid category.", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  const products = await readInventory();
  const sku = await generateUniqueSku(category, productId, products.map((item) => item.sku ?? ""));
  return NextResponse.json({ success: true, sku });
}

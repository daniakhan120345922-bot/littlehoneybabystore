export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findByBarcode } from "@/lib/inventory";
import { requireRole } from "@/lib/session";
import type { ApiError } from "@/types/inventory";

type RouteContext = { params: Promise<{ barcode: string }> };

/**
 * GET /api/products/[barcode]
 * Instant lookup for USB/Bluetooth scanners and manual entry.
 */
export async function GET(_request: Request, context: RouteContext) {
  const session = await requireRole("owner", "cashier");
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" } satisfies ApiError,
      { status: 401 }
    );
  }

  const { barcode } = await context.params;
  const decoded = decodeURIComponent(barcode).trim();

  if (!decoded) {
    return NextResponse.json(
      { success: false, error: "Barcode is required.", code: "INVALID_REQUEST" } satisfies ApiError,
      { status: 400 }
    );
  }

  const product = await findByBarcode(decoded);
  if (!product) {
    return NextResponse.json(
      {
        success: false,
        error: `No product found for barcode ${decoded}.`,
        code: "NOT_FOUND",
      } satisfies ApiError,
      { status: 404 }
    );
  }

  if (product.stock <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: `${product.name} is out of stock.`,
        code: "INSUFFICIENT_STOCK",
      } satisfies ApiError,
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, product });
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { roundMoney } from "@/lib/format";
import { readInventory, writeInventory } from "@/lib/inventory";
import { requireRole } from "@/lib/session";
import type {
  ApiError,
  CheckoutRequest,
  CheckoutResponse,
  InventoryProduct,
  ReceiptLine,
} from "@/types/inventory";

function errorResponse(error: string, status: number, code?: ApiError["code"]) {
  return NextResponse.json({ success: false, error, code } satisfies ApiError, { status });
}

/**
 * POST /api/checkout
 * Validates cart server-side, deducts stock, returns receipt.
 */
export async function POST(request: Request) {
  const session = await requireRole("owner", "cashier");
  if (!session) {
    return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400, "INVALID_REQUEST");
  }

  if (!body.items?.length) {
    return errorResponse("Cart is empty.", 400, "INVALID_REQUEST");
  }

  for (const item of body.items) {
    if (!item.productId || typeof item.quantity !== "number" || item.quantity < 1) {
      return errorResponse("Each line must have a productId and quantity ≥ 1.", 400, "INVALID_REQUEST");
    }
  }

  const products = await readInventory();
  const productMap = new Map<string, InventoryProduct>(products.map((p) => [p.id, p]));

  const receipt: ReceiptLine[] = [];
  let total = 0;

  // Validate all lines before mutating stock
  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return errorResponse(`Product ${item.productId} not found.`, 404, "NOT_FOUND");
    }
    if (product.stock < item.quantity) {
      return errorResponse(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}.`,
        409,
        "INSUFFICIENT_STOCK"
      );
    }
    const subtotal = roundMoney(product.price * item.quantity);
    total = roundMoney(total + subtotal);
    receipt.push({
      productId: product.id,
      barcode: product.barcode,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  // Deduct stock
  for (const item of body.items) {
    const product = productMap.get(item.productId)!;
    product.stock -= item.quantity;
  }

  await writeInventory([...productMap.values()]);

  const response: CheckoutResponse = {
    success: true,
    transactionId: `txn-${Date.now()}`,
    total,
    receipt,
  };

  return NextResponse.json(response);
}

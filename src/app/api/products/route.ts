export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateProductId, generateUniqueBarcode, readInventory, writeInventory } from "@/lib/inventory";
import { requireRole } from "@/lib/session";
import type { ApiError, CreateProductPayload, InventoryProduct, UpdateProductPayload } from "@/types/inventory";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

function errorResponse(error: string, status: number, code?: ApiError["code"]) {
  return NextResponse.json({ success: false, error, code } satisfies ApiError, { status });
}

/** GET /api/products — list full inventory (owner only) */
export async function GET() {
  const session = await requireRole("owner");
  if (!session) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

  const products = await readInventory();
  return NextResponse.json({ success: true, products });
}

/** POST /api/products — create or update inventory (owner only) */
export async function POST(request: Request) {
  const session = await requireRole("owner");
  if (!session) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

  let body: CreateProductPayload | UpdateProductPayload;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400, "INVALID_REQUEST");
  }

  const products = await readInventory();

  if ("product" in body && body.product) {
    const {
      barcode = "",
      name,
      price,
      stock,
      category,
      barcodeGenerated = false,
      barcodeImage,
    } = body.product;

    if (!name?.trim()) {
      return errorResponse("Name is required.", 400, "INVALID_REQUEST");
    }
    if (typeof price !== "number" || price < 0) {
      return errorResponse("Price must be a non-negative number.", 400, "INVALID_REQUEST");
    }
    if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) {
      return errorResponse("Stock must be a non-negative integer.", 400, "INVALID_REQUEST");
    }
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return errorResponse("Invalid product category.", 400, "INVALID_REQUEST");
    }

    let barcodeToSave = barcode.trim();
    if (!barcodeToSave && barcodeGenerated) {
      barcodeToSave = await generateUniqueBarcode(13);
    }

    if (!barcodeToSave) {
      return errorResponse("Barcode is required or must be generated.", 400, "INVALID_REQUEST");
    }
    if (products.some((p) => p.barcode === barcodeToSave)) {
      return errorResponse("A product with this barcode already exists.", 409, "INVALID_REQUEST");
    }

    const newProduct: InventoryProduct = {
      id: generateProductId(),
      barcode: barcodeToSave,
      barcodeGenerated: Boolean(barcodeGenerated),
      barcodeImage,
      name: name.trim(),
      price,
      stock,
      category,
    };
    products.push(newProduct);
    await writeInventory(products);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  }

  if ("productId" in body && body.productId) {
    const index = products.findIndex((p) => p.id === body.productId);
    if (index === -1) {
      return errorResponse("Product not found.", 404, "NOT_FOUND");
    }

    const updates = body.updates ?? {};
    const current = products[index];

    if (updates.barcode !== undefined) {
      const trimmed = updates.barcode.trim();
      if (!trimmed) return errorResponse("Barcode cannot be empty.", 400, "INVALID_REQUEST");
      if (products.some((p) => p.barcode === trimmed && p.id !== current.id)) {
        return errorResponse("Barcode already in use.", 409, "INVALID_REQUEST");
      }
      current.barcode = trimmed;
      current.barcodeGenerated = false;
    }
    if (updates.name !== undefined) current.name = updates.name.trim();
    if (updates.price !== undefined) {
      if (updates.price < 0) return errorResponse("Price cannot be negative.", 400, "INVALID_REQUEST");
      current.price = updates.price;
    }
    if (updates.stock !== undefined) {
      if (updates.stock < 0 || !Number.isInteger(updates.stock)) {
        return errorResponse("Stock must be a non-negative integer.", 400, "INVALID_REQUEST");
      }
      current.stock = updates.stock;
    }
    if (updates.category !== undefined) {
      if (!PRODUCT_CATEGORIES.includes(updates.category)) {
        return errorResponse("Invalid category.", 400, "INVALID_REQUEST");
      }
      current.category = updates.category;
    }

    products[index] = current;
    await writeInventory(products);
    return NextResponse.json({ success: true, product: current });
  }

  return errorResponse("Provide either `product` (create) or `productId` + `updates` (update).", 400, "INVALID_REQUEST");
}

/** DELETE /api/products?id= — delete a product (owner only) */
export async function DELETE(request: Request) {
  const session = await requireRole("owner");
  if (!session) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

  const productId = new URL(request.url).searchParams.get("id");
  if (!productId) return errorResponse("Product ID is required.", 400, "INVALID_REQUEST");

  const products = await readInventory();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return errorResponse("Product not found.", 404, "NOT_FOUND");

  const deleted = products.splice(index, 1)[0];
  await writeInventory(products);
  return NextResponse.json({ success: true, product: deleted });
}

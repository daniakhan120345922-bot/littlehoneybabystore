import { NextResponse } from "next/server";
import { generateUniqueBarcode } from "@/lib/inventory";
import type { ApiError } from "@/types/inventory";

export const runtime = "nodejs";

function errorResponse(error: string, status: number, code?: ApiError["code"]) {
  return NextResponse.json({ success: false, error, code } satisfies ApiError, { status });
}

export async function GET() {
  try {
    const barcode = await generateUniqueBarcode(13);
    return NextResponse.json({ success: true, barcode });
  } catch {
    return errorResponse("Unable to generate barcode at this time.", 500, "INVALID_REQUEST");
  }
}

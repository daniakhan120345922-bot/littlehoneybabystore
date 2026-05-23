"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BarcodeLabel } from "./BarcodeLabel";
import type { InventoryProduct } from "@/types/inventory";

type Props = {
  open: boolean;
  product: InventoryProduct | null;
  onClose: () => void;
};

export function BarcodePrintModal({ open, product, onClose }: Props) {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: product ? `barcode-${product.barcode}` : "barcode-label",
  });

  const handleDownloadSvg = () => {
    if (!printRef.current || !product) return;
    const svg = printRef.current.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `barcode-${product.barcode}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-stone-200">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Print label</p>
            <h2 className="text-lg font-semibold text-stone-900">Printable barcode label</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div ref={printRef} className="mx-auto w-full max-w-md">
            <BarcodeLabel name={product.name} price={product.price} barcode={product.barcode} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleDownloadSvg}>
              Download barcode SVG
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              Print Barcode
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BarcodeLabel } from "./BarcodeLabel";
import { SaleBarcodeLabel } from "./SaleBarcodeLabel";
import type { InventoryProduct } from "@/types/inventory";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const handleDownloadPng = async () => {
    if (!printRef.current || !product) return;
    const canvas = await html2canvas(printRef.current, { backgroundColor: "#ffffff", scale: 2 });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `barcode-${product.barcode}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !product) return;
    const canvas = await html2canvas(printRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageProps = pdf.getImageProperties(imgData);
    const imgHeight = (imageProps.height * pageWidth) / imageProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
    pdf.save(`barcode-${product.barcode}.pdf`);
  };

  if (!open || !product) return null;

  const isSaleLabel = Boolean(product.salePercentage && product.salePercentage > 0);

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
            {isSaleLabel ? (
              <SaleBarcodeLabel
                barcode={product.barcode}
                sku={product.sku}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                salePercentage={product.salePercentage}
              />
            ) : (
              <BarcodeLabel barcode={product.barcode} sku={product.sku} name={product.name} price={product.price} />
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleDownloadSvg}>
              Download SVG
            </Button>
            <Button variant="outline" onClick={handleDownloadPng}>
              Download PNG
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf}>
              Download PDF
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

"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
};

type JsBarcode = (element: SVGSVGElement, value: string, options?: Record<string, unknown>) => void;

export function BarcodeImage({ value }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    import("jsbarcode")
      .then((module) => {
        const svgElement = svgRef.current;
        if (!svgElement) return;
        const JsBarcodeImpl = (module.default ?? module) as unknown as JsBarcode;
        JsBarcodeImpl(svgElement, value, {
          format: "ean13",
          lineColor: "#111827",
          width: 2,
          height: 90,
          displayValue: false,
          margin: 6,
          fontSize: 14,
        });
      })
      .catch((error) => {
        console.error("Failed to render barcode:", error);
      });
  }, [value]);

  return <svg ref={svgRef} className="mx-auto h-28 w-full" aria-label={`Barcode ${value}`} />;
}

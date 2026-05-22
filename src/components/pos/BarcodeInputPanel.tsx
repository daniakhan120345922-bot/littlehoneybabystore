"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanBarcode, ScanLine } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { InventoryProduct } from "@/types/inventory";
import { BarcodeScannerModal } from "@/components/pos/BarcodeScannerModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Props = {
  onProductScanned: (product: InventoryProduct) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

export function BarcodeInputPanel({ onProductScanned, onError, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScanned, setLastScanned] = useState<InventoryProduct | null>(null);

  const focusInput = useCallback(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const lookupBarcode = useCallback(
    async (raw: string) => {
      const barcode = raw.trim();
      if (!barcode) return;
      setIsLookingUp(true);
      const result = await apiFetch<{ success: true; product: InventoryProduct }>(
        `/api/products/${encodeURIComponent(barcode)}`
      );
      setIsLookingUp(false);
      setValue("");
      if ("error" in result) {
        onError(result.error.error);
        focusInput();
        return;
      }
      setLastScanned(result.data.product);
      onProductScanned(result.data.product);
      focusInput();
    },
    [onProductScanned, onError, focusInput]
  );

  return (
    <Card variant="elevated" padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-stone-100 px-6 py-5">
        <SectionHeader
          badge="Scanner"
          title="Barcode input"
          description="Hardware scanners auto-submit on Enter · field stays focused"
        />
      </div>

      <div className="flex-1 p-6">
        <div className="relative">
          <ScanBarcode className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-amber-500/80" />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled || isLookingUp}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void lookupBarcode(value);
              }
            }}
            onBlur={() => {
              if (!disabled && !scannerOpen) focusInput();
            }}
            placeholder="Scan barcode…"
            className={cn(
              "scan-glow w-full rounded-2xl border-2 border-amber-300/60 bg-gradient-to-b from-amber-50/90 to-white py-6 pl-14 pr-12 font-mono text-2xl tracking-widest text-stone-900 outline-none transition",
              "focus:border-amber-400",
              (disabled || isLookingUp) && "opacity-60"
            )}
          />
          {isLookingUp && (
            <Loader2 className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 animate-spin text-amber-500" />
          )}
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="mt-4"
          disabled={disabled}
          leftIcon={<Camera className="h-5 w-5" />}
          onClick={() => setScannerOpen(true)}
        >
          Camera scanner
        </Button>

        {lastScanned && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 p-5 ring-1 ring-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Last scanned
            </p>
            <p className="font-display mt-2 text-xl font-semibold text-stone-900">
              {lastScanned.name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="category" category={lastScanned.category}>
                {lastScanned.category}
              </Badge>
              <span className="text-sm font-semibold text-amber-800">
                {formatCurrency(lastScanned.price)}
              </span>
              <span className="text-sm text-stone-500">{lastScanned.stock} in stock</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-stone-100 bg-stone-50/80 px-6 py-4">
        <p className="flex items-center gap-2 text-xs text-stone-500">
          <ScanLine className="h-4 w-4 shrink-0 text-amber-600" />
          Only products you add in Owner appear here.
        </p>
      </div>

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          focusInput();
        }}
        onScan={(code) => void lookupBarcode(code)}
      />
    </Card>
  );
}

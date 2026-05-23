"use client";

import { formatCurrency } from "@/lib/format";
import { BarcodeImage } from "./BarcodeImage";

type Props = {
  barcode: string;
  sku?: string;
  name: string;
  price: number;
};

export function BarcodeLabel({ barcode, sku, name, price }: Props) {
  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-stone-800 bg-white p-8 text-stone-900 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-stone-500">Little Honey Baby Store</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900">{name}</h1>
        {sku ? <p className="mt-1 text-xs uppercase tracking-[0.3em] text-stone-400">SKU {sku}</p> : null}
      </div>

      <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Price</p>
            <p className="text-4xl font-black text-amber-800">{formatCurrency(price)}</p>
          </div>
          <div className="rounded-3xl bg-stone-900 px-4 py-3 text-right text-xs uppercase tracking-[0.3em] text-white">
            <p>POS</p>
            <p className="mt-1 text-lg font-bold">LABEL</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <BarcodeImage value={barcode} />
        <p className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-stone-500">{barcode}</p>
      </div>

      <div className="mt-6 space-y-1 text-center text-xs uppercase tracking-[0.25em] text-stone-400">
        <p>Retail-ready shelf tag</p>
        <p>Made for quick scanning and pricing.</p>
      </div>
    </div>
  );
}

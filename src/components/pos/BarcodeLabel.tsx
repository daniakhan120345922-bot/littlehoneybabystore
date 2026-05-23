"use client";

import { formatCurrency } from "@/lib/format";

type Props = {
  barcode: string;
  name: string;
  price: number;
};

export function BarcodeLabel({ barcode, name, price }: Props) {
  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-stone-800 bg-white p-8 text-stone-900 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <div className="space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-stone-500">Store Label</p>
        <h1 className="text-3xl font-bold leading-tight">{name}</h1>
        <p className="text-lg font-semibold text-amber-700">{formatCurrency(price)}</p>
      </div>

      <div className="my-8 border-t-2 border-b-2 border-stone-800 py-6 text-center">
        <p className="font-mono text-4xl font-bold tracking-wider">{barcode}</p>
        <p className="mt-3 text-xs text-stone-500">Barcode</p>
      </div>

      <div className="space-y-2 text-center text-xs text-stone-400">
        <p>Little Honey Baby Store</p>
        <p>Scan barcode with POS scanner</p>
      </div>
    </div>
  );
}

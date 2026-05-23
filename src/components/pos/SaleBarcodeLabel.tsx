import { formatCurrency } from "@/lib/format";
import { BarcodeImage } from "./BarcodeImage";

type Props = {
  barcode: string;
  sku?: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePercentage?: number;
};

export function SaleBarcodeLabel({ barcode, sku, name, price, originalPrice, salePercentage }: Props) {
  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-stone-900 bg-white p-8 text-stone-900 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">Limited time offer</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900">{name}</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-stone-500">{sku ?? "SKU pending"}</p>
        </div>
        <div className="rounded-3xl bg-amber-100 px-4 py-3 text-right text-sm font-semibold text-amber-900 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em]">Sale</p>
          <p className="mt-1 text-3xl font-black">{salePercentage ?? 0}%</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Was</p>
            <p className="text-sm line-through text-stone-400">{originalPrice ? formatCurrency(originalPrice) : "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Now</p>
            <p className="text-4xl font-bold text-amber-800">{formatCurrency(price)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <BarcodeImage value={barcode} />
        <p className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-stone-500">{barcode}</p>
      </div>

      <div className="mt-6 grid gap-2 text-center text-xs uppercase tracking-[0.25em] text-stone-500">
        <p>Little Honey Baby Store</p>
        <p>Retail-ready label for shelves, cabinets, and point-of-sale.</p>
      </div>
    </div>
  );
}

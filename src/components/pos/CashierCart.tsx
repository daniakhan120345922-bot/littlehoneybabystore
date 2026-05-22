"use client";

import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Props = {
  items: CartItem[];
  total: number;
  lineCount: number;
  isCheckingOut: boolean;
  checkoutSuccess: boolean;
  lastTransactionId: string | null;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onNewSale: () => void;
};

export function CashierCart(props: Props) {
  const {
    items,
    total,
    lineCount,
    isCheckingOut,
    checkoutSuccess,
    lastTransactionId,
    onIncrement,
    onDecrement,
    onRemove,
    onCheckout,
    onNewSale,
  } = props;

  if (checkoutSuccess) {
    return (
      <Card variant="elevated" className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-12 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="font-display mt-8 text-3xl font-bold text-stone-900">Sale complete</h2>
        <p className="mt-2 text-stone-500">Inventory synced · ready for next customer</p>
        {lastTransactionId && (
          <p className="mt-4 rounded-xl bg-stone-100 px-4 py-2 font-mono text-xs text-stone-600">
            {lastTransactionId}
          </p>
        )}
        <Button variant="primary" size="xl" className="mt-10" onClick={onNewSale}>
          Start new sale
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-amber-50/40 px-6 py-5">
        <SectionHeader
          badge="Live"
          title="Current receipt"
          description={`${lineCount} units · ${items.length} line items`}
        />
      </div>

      <div className="pos-scroll flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100">
              <ShoppingCart className="h-10 w-10 text-stone-300" />
            </div>
            <p className="font-display mt-6 text-xl font-semibold text-stone-700">Awaiting scan</p>
            <p className="mt-2 max-w-xs text-sm text-stone-400">
              Scan a barcode from your catalog to build the receipt.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {items.map((item, i) => (
              <li key={item.productId} className="flex gap-4 px-6 py-5 transition hover:bg-stone-50/60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-sm font-bold text-amber-800 ring-1 ring-amber-200/50">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  <p className="font-mono text-xs text-stone-400">{item.barcode}</p>
                  <p className="mt-1 text-sm text-stone-500">{formatCurrency(item.price)} / unit</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-display text-xl font-bold text-stone-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onDecrement(item.productId)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm hover:bg-stone-50">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center font-bold tabular-nums">{item.quantity}</span>
                    <button type="button" disabled={item.quantity >= item.maxStock} onClick={() => onIncrement(item.productId)} className={cn("flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm hover:bg-stone-50", item.quantity >= item.maxStock && "opacity-40")}>
                      <Plus className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onRemove(item.productId)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-stone-800 bg-gradient-to-br from-stone-900 to-stone-950 p-6 text-white">
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
              <Receipt className="h-3.5 w-3.5" />
              Total due
            </p>
            <p className="font-display mt-1 text-5xl font-bold tabular-nums tracking-tight">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/10">
            <p className="text-[10px] uppercase text-stone-500">Items</p>
            <p className="text-2xl font-bold">{lineCount}</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="xl"
          fullWidth
          className="mt-5"
          disabled={items.length === 0 || isCheckingOut}
          onClick={onCheckout}
          leftIcon={isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
        >
          {isCheckingOut ? "Processing…" : "Complete sale"}
        </Button>
      </div>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Baby, Boxes, CircleDollarSign, Plus } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import type { InventoryProduct } from "@/types/inventory";

export function StoreStats({ products }: { products: InventoryProduct[] }) {
  const count = products.length;
  const units = products.reduce((s, p) => s + p.stock, 0);
  const value = products.reduce((s, p) => s + p.price * p.stock, 0);
  const empty = count === 0;

  return (
    <section className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Live inventory
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold text-stone-900">
            Your store at a glance
          </h2>
        </div>
        {empty && (
          <Link href="/owner">
            <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />}>
              Add first product
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Products you added"
          value={count}
          subtext={empty ? "Start in Owner dashboard" : "Active SKUs"}
          icon={<Baby className="h-6 w-6" />}
          accent="amber"
        />
        <StatCard
          label="Units on hand"
          value={units}
          subtext={empty ? "No stock yet" : "Available to sell"}
          icon={<Boxes className="h-6 w-6" />}
          accent="emerald"
        />
        <StatCard
          label="Stock value"
          value={formatCurrency(value)}
          subtext={empty ? "Rs 0" : "Price × quantity"}
          icon={<CircleDollarSign className="h-6 w-6" />}
          accent="violet"
        />
      </div>
    </section>
  );
}

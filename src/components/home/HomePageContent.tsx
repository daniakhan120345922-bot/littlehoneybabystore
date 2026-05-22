"use client";

import Link from "next/link";
import { ArrowRight, ScanLine, Shield, Sparkles, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StoreStats } from "@/components/home/StoreStats";
import { Card } from "@/components/ui/Card";
import type { InventoryProduct } from "@/types/inventory";

export function HomePageContent({ products }: { products: InventoryProduct[] }) {
  const lowStock = products.filter((p) => p.stock <= 5).length;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Little Honey Baby Store — point of sale & inventory"
    >
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-8 text-white shadow-2xl sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              Professional retail POS
            </span>
            <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back to
              <span className="block bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Little Honey
              </span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-300">
              Scan products at the cashier, manage inventory as owner, and track real numbers
              from products you add — no demo data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cashier"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-sm font-bold text-stone-900 shadow-lg shadow-amber-500/30 transition hover:brightness-110"
              >
                <ScanLine className="h-4 w-4" />
                Open cashier
              </Link>
              <Link
                href="/owner"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <Shield className="h-4 w-4" />
                Owner panel
              </Link>
            </div>
          </div>
        </section>

        <StoreStats products={products} />

        <section className="grid gap-6 lg:grid-cols-2">
          <Link href="/cashier" className="group">
            <Card
              variant="elevated"
              padding="lg"
              className="h-full transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-200/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
                <ScanLine className="h-7 w-7" />
              </div>
              <h3 className="font-display mt-6 text-xl font-bold text-stone-900">
                Cashier terminal
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Barcode scanning, live cart, quantity controls, and instant checkout.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-700 group-hover:gap-3 transition-all">
                Launch <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
          <Link href="/owner" className="group">
            <Card
              variant="elevated"
              padding="lg"
              className="h-full transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-lg">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="font-display mt-6 text-xl font-bold text-stone-900">
                Owner dashboard
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Add SKUs, set prices, restock, and search your full catalog.
              </p>
              {lowStock > 0 && (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  <Zap className="h-3.5 w-3.5" />
                  {lowStock} low-stock alert{lowStock !== 1 ? "s" : ""}
                </span>
              )}
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-stone-700 group-hover:gap-3 transition-all">
                Manage <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

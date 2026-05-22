"use client";

import { AppShell } from "@/components/layout/AppShell";
import { OwnerDashboard } from "@/components/pos/OwnerDashboard";
import type { InventoryProduct } from "@/types/inventory";

export function OwnerPageContent({ products }: { products: InventoryProduct[] }) {
  return (
    <AppShell
      title="Owner dashboard"
      subtitle="Inventory administration · pricing · stock control"
    >
      <div className="mx-auto max-w-6xl">
        <OwnerDashboard initialProducts={products} />
      </div>
    </AppShell>
  );
}

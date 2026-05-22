"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LiveClock } from "@/components/ui/LiveClock";
import { BarcodeInputPanel } from "@/components/pos/BarcodeInputPanel";
import { CashierCart } from "@/components/pos/CashierCart";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/hooks/useCart";
import { apiFetch } from "@/lib/api";
import type { CheckoutResponse, InventoryProduct } from "@/types/inventory";

export default function CashierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

  const handleProductScanned = useCallback(
    (product: InventoryProduct) => {
      if (checkoutSuccess) {
        setCheckoutSuccess(false);
        setLastTransactionId(null);
      }
      cart.addProduct(product);
      showToast(`Added ${product.name}`, "success");
    },
    [cart, showToast, checkoutSuccess]
  );

  const handleCheckout = async () => {
    if (cart.isEmpty) return;
    setIsCheckingOut(true);
    const result = await apiFetch<CheckoutResponse>("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    setIsCheckingOut(false);
    if ("error" in result) {
      showToast(result.error.error, "error");
      return;
    }
    cart.clear();
    setCheckoutSuccess(true);
    setLastTransactionId(result.data.transactionId);
    showToast(`Sale complete — ${result.data.receipt.length} line(s).`, "success");
  };

  if (status === "unauthenticated") {
    router.replace("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-mesh">
        <p className="text-stone-500">Loading…</p>
      </div>
    );
  }

  return (
    <AppShell
      title="Cashier terminal"
      subtitle={`Signed in as ${session?.user?.name ?? "staff"}`}
      headerRight={<LiveClock />}
      fullBleed
    >
      <div className="grid h-[calc(100vh-5rem)] grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <BarcodeInputPanel
          onProductScanned={handleProductScanned}
          onError={(msg) => showToast(msg, "error")}
          disabled={isCheckingOut || checkoutSuccess}
        />
        <CashierCart
          items={cart.items}
          total={cart.total}
          lineCount={cart.lineCount}
          isCheckingOut={isCheckingOut}
          checkoutSuccess={checkoutSuccess}
          lastTransactionId={lastTransactionId}
          onIncrement={cart.increment}
          onDecrement={cart.decrement}
          onRemove={cart.remove}
          onCheckout={() => void handleCheckout()}
          onNewSale={() => {
            setCheckoutSuccess(false);
            setLastTransactionId(null);
          }}
        />
      </div>
    </AppShell>
  );
}

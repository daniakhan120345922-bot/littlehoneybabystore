"use client";

import { useCallback, useMemo, useState } from "react";
import type { InventoryProduct } from "@/types/inventory";
import { roundMoney } from "@/lib/format";

export type CartItem = {
  productId: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
};

/** Client-side cart state for the cashier dashboard */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addProduct = useCallback((product: InventoryProduct) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1, maxStock: product.stock } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          quantity: 1,
          maxStock: product.stock,
        },
      ];
    });
  }, []);

  const increment = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.quantity < i.maxStock
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  }, []);

  const decrement = useCallback((productId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0)),
    [items]
  );

  const lineCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return {
    items,
    total,
    lineCount,
    addProduct,
    increment,
    decrement,
    remove,
    clear,
    isEmpty: items.length === 0,
  };
}

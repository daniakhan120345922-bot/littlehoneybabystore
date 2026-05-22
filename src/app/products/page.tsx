"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { AppShell } from "@/components/layout/AppShell";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { InventoryProduct, ProductCategory } from "@/types/inventory";
import inventory from "@/../data/inventory.json";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100/80";

const initialProducts = inventory as InventoryProduct[];

type EditForm = {
  barcode: string;
  name: string;
  price: string;
  stock: string;
  category: ProductCategory;
};

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<InventoryProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    barcode: "",
    name: "",
    price: "",
    stock: "",
    category: "Clothing",
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEdit = (product: InventoryProduct) => {
    setEditingProduct(product);
    setEditForm({
      barcode: product.barcode,
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const price = parseFloat(editForm.price);
    const stock = parseInt(editForm.stock, 10);
    if (Number.isNaN(price) || Number.isNaN(stock)) {
      showToast("Enter valid price and stock.", "error");
      return;
    }
    setIsSaving(true);
    const res = await apiFetch<{ success: true; product: InventoryProduct }>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        productId: editingProduct.id,
        updates: {
          barcode: editForm.barcode.trim(),
          name: editForm.name.trim(),
          price,
          stock,
          category: editForm.category,
        },
      }),
    });
    setIsSaving(false);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    const updated = res.data.product;
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (viewingProduct?.id === updated.id) setViewingProduct(updated);
    showToast("Product updated.", "success");
    setEditingProduct(null);
  };

  const handleDeleteClick = (productId: string) => {
    setConfirmingDelete(productId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmingDelete) return;
    
    setIsDeleting(confirmingDelete);
    try {
      const response = await fetch(`/api/products?id=${confirmingDelete}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== confirmingDelete));
        setConfirmingDelete(null);
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };
  return (
    <AppShell title="Your catalog" subtitle="All registered products">
      <div className="max-w-4xl">
        <div className="rounded-3xl bg-yellow-50 p-6 mb-6 shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
              <svg width="24" height="24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/></svg>
            </div>
            <div>
              <div className="font-semibold text-stone-800">{products.length} products registered</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow divide-y">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4">
              <div>
                <div className="font-semibold text-stone-900">{product.name}</div>
                <div className="text-xs text-stone-500">{product.barcode}</div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="category" category={product.category}>
                  {product.category}
                </Badge>
                <span className="text-stone-500 text-sm">{product.stock} units</span>
                <span className="text-stone-700 font-semibold">{formatCurrency(product.price)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingProduct(product)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-700 hover:bg-amber-50 hover:text-amber-900 transition"
                    title="View product"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition"
                    title="Edit product"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(product.id)}
                    disabled={isDeleting === product.id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View product modal */}
      {viewingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-product-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-stone-200">
            <div className="flex items-start justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Product details
                </p>
                <h3 id="view-product-title" className="font-display mt-1 text-xl font-bold text-stone-900">
                  {viewingProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-4 px-6 py-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Barcode</dt>
                <dd className="mt-1 font-mono text-sm text-stone-800">{viewingProduct.barcode}</dd>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Category</dt>
                  <dd className="mt-1">
                    <Badge variant="category" category={viewingProduct.category}>
                      {viewingProduct.category}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Stock</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-900">
                    {viewingProduct.stock} units
                  </dd>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Unit price</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-900">
                    {formatCurrency(viewingProduct.price)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Stock value</dt>
                  <dd className="mt-1 text-lg font-semibold text-amber-800">
                    {formatCurrency(viewingProduct.price * viewingProduct.stock)}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Product ID</dt>
                <dd className="mt-1 font-mono text-xs text-stone-500">{viewingProduct.id}</dd>
              </div>
            </dl>
            <div className="flex gap-3 border-t border-stone-100 px-6 py-4">
              <Button variant="secondary" fullWidth onClick={() => setViewingProduct(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  const product = viewingProduct;
                  setViewingProduct(null);
                  openEdit(product);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit product modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-product-title"
        >
          <form
            className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-stone-200"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveEdit();
            }}
          >
            <div className="flex items-start justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Edit product</p>
                <h3 id="edit-product-title" className="font-display mt-1 text-xl font-bold text-stone-900">
                  {editingProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Name</span>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className={cn(inputClass, "mt-1")}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Barcode</span>
                <input
                  required
                  value={editForm.barcode}
                  onChange={(e) => setEditForm((f) => ({ ...f, barcode: e.target.value }))}
                  className={cn(inputClass, "mt-1 font-mono")}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Category</span>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, category: e.target.value as ProductCategory }))
                  }
                  className={cn(inputClass, "mt-1")}
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Price (Rs)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    className={cn(inputClass, "mt-1")}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Stock</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.stock}
                    onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                    className={cn(inputClass, "mt-1")}
                  />
                </label>
              </div>
            </div>
            <div className="flex gap-3 border-t border-stone-100 px-6 py-4">
              <Button type="button" variant="secondary" fullWidth onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth disabled={isSaving}>
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-6 shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-bold text-stone-900">Delete Product?</h3>
            <p className="mt-2 text-sm text-stone-600">
              Are you sure you want to permanently delete this product? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg bg-stone-100 text-stone-900 hover:bg-stone-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting !== null}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

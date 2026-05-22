"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CircleDollarSign,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { BarcodeScannerModal } from "@/components/pos/BarcodeScannerModal";
import type { InventoryProduct, ProductCategory } from "@/types/inventory";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100/80";

export function OwnerDashboard({ initialProducts }: { initialProducts: InventoryProduct[] }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    price: "",
    stock: "",
    category: "Clothing" as ProductCategory,
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<InventoryProduct | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    price: "",
    stock: "",
    name: "",
    category: "Clothing" as ProductCategory,
  });

  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 5).length;
    return { totalStock, inventoryValue, lowStock };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const refreshProducts = useCallback(async () => {
    const res = await apiFetch<{ success: true; products: InventoryProduct[] }>("/api/products");
    if ("data" in res) setProducts(res.data.products);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock, 10);
    if (Number.isNaN(price) || Number.isNaN(stock)) {
      showToast("Enter valid price and stock.", "error");
      return;
    }
    setIsSaving(true);
    const res = await apiFetch<{ success: true; product: InventoryProduct }>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        product: {
          barcode: newProduct.barcode.trim(),
          name: newProduct.name.trim(),
          price,
          stock,
          category: newProduct.category,
        },
      }),
    });
    setIsSaving(false);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    showToast(`Added ${res.data.product.name}.`, "success");
    setNewProduct({ barcode: "", name: "", price: "", stock: "", category: "Clothing" });
    await refreshProducts();
  };

  const startEdit = (product: InventoryProduct) => {
    setEditingId(product.id);
    setEditForm({
      price: String(product.price),
      stock: String(product.stock),
      name: product.name,
      category: product.category,
    });
  };

  const handleUpdate = async (productId: string) => {
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
        productId,
        updates: {
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
    showToast("Product updated.", "success");
    setEditingId(null);
    await refreshProducts();
  };

  const lookupBarcodeForNew = async () => {
    const code = newProduct.barcode.trim();
    if (!code) return;
    const res = await apiFetch<{ success: true; product: InventoryProduct }>(
      `/api/products/${encodeURIComponent(code)}`
    );
    showToast(
      "data" in res ? "Barcode already in use." : "Barcode available.",
      "data" in res ? "error" : "success"
    );
  };

  const handleBarcodeScanned = async (barcode: string) => {
    const code = barcode.trim();
    setNewProduct((p) => ({ ...p, barcode: code }));
    if (!code) return;
    const res = await apiFetch<{ success: true; product: InventoryProduct }>(
      `/api/products/${encodeURIComponent(code)}`
    );
    showToast(
      "data" in res ? "Barcode already in use." : "Barcode loaded.",
      "data" in res ? "error" : "success"
    );
  };

  const handleViewProduct = (product: InventoryProduct) => {
    setViewingProduct(product);
  };

  const handleDeleteClick = (productId: string) => {
    setConfirmingDelete(productId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmingDelete) return;
    setIsDeleting(confirmingDelete);
    const res = await apiFetch<{ success: true; product: InventoryProduct }>(`/api/products?id=${encodeURIComponent(confirmingDelete)}`, {
      method: "DELETE",
    });
    setIsDeleting(null);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    showToast("Product deleted.", "success");
    setConfirmingDelete(null);
    setProducts((prev) => prev.filter((p) => p.id !== confirmingDelete));
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };

  return (
    <div className="animate-fade-up space-y-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Your SKUs" value={products.length} icon={<Package className="h-6 w-6" />} accent="sky" />
        <StatCard label="Units on hand" value={stats.totalStock} icon={<Package className="h-6 w-6" />} accent="emerald" />
        <StatCard
          label="Stock value"
          value={formatCurrency(stats.inventoryValue)}
          subtext={stats.lowStock > 0 ? `${stats.lowStock} low-stock` : "Healthy levels"}
          icon={stats.lowStock > 0 ? <AlertTriangle className="h-6 w-6" /> : <CircleDollarSign className="h-6 w-6" />}
          accent={stats.lowStock > 0 ? "violet" : "amber"}
        />
      </div>

      <Card variant="elevated">
        <SectionHeader badge="New SKU" title="Add product" description="Register barcode, price, and opening stock" />
        <form onSubmit={handleCreate} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Barcode</label>
            <div className="mt-2 flex gap-2">
              <input required value={newProduct.barcode} onChange={(e) => setNewProduct((p) => ({ ...p, barcode: e.target.value }))} className={cn(inputClass, "font-mono")} placeholder="8901234567899" />
              <Button type="button" variant="outline" size="sm" onClick={() => setScannerOpen(true)} leftIcon={<Camera className="h-4 w-4" />}>
                Scan
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => void lookupBarcodeForNew()}>
                Check
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Name</label>
            <input required value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} className={cn(inputClass, "mt-2")} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Category</label>
            <select value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value as ProductCategory }))} className={cn(inputClass, "mt-2")}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Price (Rs)</label>
            <input required type="number" min="0" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} className={cn(inputClass, "mt-2")} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Stock</label>
            <input required type="number" min="0" step="1" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} className={cn(inputClass, "mt-2")} />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSaving} leftIcon={<Plus className="h-5 w-5" />}>
              Add product
            </Button>
          </div>
        </form>
      </Card>

      <BarcodeScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScanned} />

      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <SectionHeader title="Inventory table" description={`${filtered.length} of ${products.length} products`} />
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className={cn(inputClass, "w-full pl-10")} />
          </div>
        </div>
        <div className="pos-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                <th className="px-6 py-4">Barcode</th>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((product) => (
                <tr key={product.id} className="transition hover:bg-amber-50/20">
                  <td className="px-6 py-4 font-mono text-xs text-stone-500">{product.barcode}</td>
                  <td className="px-4 py-4">
                    {editingId === product.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
                    ) : (
                      <span className="font-semibold text-stone-900">{product.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === product.id ? (
                      <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as ProductCategory }))} className={inputClass}>
                        {PRODUCT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant="category" category={product.category}>{product.category}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {editingId === product.id ? (
                      <input type="number" min="0" step="0.01" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className={cn(inputClass, "w-28")} />
                    ) : (
                      formatCurrency(product.price)
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === product.id ? (
                      <input type="number" min="0" step="1" value={editForm.stock} onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))} className={cn(inputClass, "w-24")} />
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("font-bold tabular-nums", product.stock <= 5 && "text-amber-700")}>{product.stock}</span>
                        {product.stock <= 5 && <Badge variant="warning">Low</Badge>}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" disabled={isSaving} onClick={() => void handleUpdate(product.id)}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => handleViewProduct(product)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-600" />}
                          className="text-red-600"
                          onClick={() => handleDeleteClick(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-stone-400">No products match your search.</p>
          )}
        </div>
      </Card>
      {viewingProduct && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center bg-white/30 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-stone-200">
            <div className="flex items-start justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Product details</p>
                <h3 className="mt-1 text-xl font-semibold text-stone-900">{viewingProduct.name}</h3>
              </div>
              <button type="button" onClick={() => setViewingProduct(null)} className="rounded-xl p-2 text-stone-500 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Barcode</p>
                <p className="mt-1 font-mono text-sm text-stone-800">{viewingProduct.barcode}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Category</p>
                  <Badge variant="category" category={viewingProduct.category}>{viewingProduct.category}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Stock</p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">{viewingProduct.stock}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Price</p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">{formatCurrency(viewingProduct.price)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Stock value</p>
                  <p className="mt-1 text-lg font-semibold text-amber-800">{formatCurrency(viewingProduct.price * viewingProduct.stock)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-stone-100 px-6 py-4">
              <Button variant="secondary" fullWidth onClick={() => setViewingProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center bg-white/30 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-stone-200">
            <div className="space-y-4 px-6 py-6">
              <h3 className="text-lg font-semibold text-stone-900">Delete product?</h3>
              <p className="text-sm text-stone-600">This will permanently remove the product from inventory.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={handleCancelDelete} fullWidth>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmDelete} fullWidth disabled={isDeleting !== null}>
                  {isDeleting ? "Deleting…" : "Delete product"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}    </div>
  );
}

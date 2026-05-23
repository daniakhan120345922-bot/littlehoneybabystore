import fs from "fs/promises";
import os from "os";
import path from "path";
import type { InventoryProduct } from "@/types/inventory";

const APP_DATA_DIR = path.join(process.cwd(), "data");
const READONLY_INVENTORY_PATH = path.join(APP_DATA_DIR, "inventory.json");
const INVENTORY_PATH = process.env.NODE_ENV === "production"
  ? path.join(os.tmpdir(), "little-honey-baby-store", "inventory.json")
  : READONLY_INVENTORY_PATH;

/** Seed data used when inventory.json is missing or corrupt */
export const SEED_INVENTORY: InventoryProduct[] = [
  {
    id: "prod-001",
    barcode: "8901234567890",
    name: "Organic Cotton Onesie (0-3M)",
    price: 18.99,
    stock: 42,
    category: "Clothing",
  },
  {
    id: "prod-002",
    barcode: "8901234567891",
    name: "Silicone Baby Bib — Honey Bee",
    price: 12.5,
    stock: 65,
    category: "Feeding",
  },
  {
    id: "prod-003",
    barcode: "8901234567892",
    name: "Plush Honey Bear Rattle",
    price: 14.99,
    stock: 28,
    category: "Toys",
  },
  {
    id: "prod-004",
    barcode: "8901234567893",
    name: "Bamboo Nursing Pads (24 pk)",
    price: 16.99,
    stock: 36,
    category: "Feeding",
  },
  {
    id: "prod-005",
    barcode: "8901234567894",
    name: "Hypoallergenic Diapers — Size 2 (32 ct)",
    price: 24.99,
    stock: 55,
    category: "Diapering",
  },
];

/** Reads all products from the JSON inventory file */
export async function readInventory(): Promise<InventoryProduct[]> {
  try {
    if (process.env.NODE_ENV === "production") {
      try {
        await fs.access(INVENTORY_PATH);
      } catch {
        const raw = await fs.readFile(READONLY_INVENTORY_PATH, "utf-8");
        await fs.mkdir(path.dirname(INVENTORY_PATH), { recursive: true });
        await fs.writeFile(INVENTORY_PATH, raw, "utf-8");
      }
    }

    const raw = await fs.readFile(INVENTORY_PATH, "utf-8");
    const parsed = JSON.parse(raw) as InventoryProduct[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await writeInventory(SEED_INVENTORY);
      return [...SEED_INVENTORY];
    }
    return parsed;
  } catch {
    await writeInventory(SEED_INVENTORY);
    return [...SEED_INVENTORY];
  }
}

/** Persists the full inventory array to disk */
export async function writeInventory(products: InventoryProduct[]): Promise<void> {
  await fs.mkdir(path.dirname(INVENTORY_PATH), { recursive: true });
  await fs.writeFile(INVENTORY_PATH, JSON.stringify(products, null, 2), "utf-8");
}

export function normalizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, "").trim();
}

export async function generateUniqueBarcode(length = 13): Promise<string> {
  const products = await readInventory();
  const existing = new Set(products.map((product) => normalizeBarcode(product.barcode)));
  const prefix = "89";
  const bodyLength = Math.max(0, length - prefix.length);

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const randomDigits = Array.from({ length: bodyLength }, () => Math.floor(Math.random() * 10)).join("");
    const candidate = (prefix + randomDigits).slice(0, length);
    if (!existing.has(candidate)) return candidate;
  }

  throw new Error("Unable to generate a unique barcode after many attempts.");
}

/** Finds a product by exact barcode match (trimmed) */
export async function findByBarcode(barcode: string): Promise<InventoryProduct | null> {
  const normalized = barcode.trim();
  const products = await readInventory();
  return products.find((p) => p.barcode === normalized) ?? null;
}

/** Finds a product by internal id */
export async function findById(id: string): Promise<InventoryProduct | null> {
  const products = await readInventory();
  return products.find((p) => p.id === id) ?? null;
}

/** Generates a simple unique product id */
export function generateProductId(): string {
  return `prod-${Date.now().toString(36)}`;
}

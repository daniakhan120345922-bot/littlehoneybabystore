/** Product categories sold at Little Honey Baby Store */
export type ProductCategory = "Toys" | "Clothing" | "Feeding" | "Diapering";

/** Canonical inventory record persisted in data/inventory.json */
export type InventoryProduct = {
  id: string;
  barcode: string;
  sku?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  salePercentage?: number;
  stock: number;
  category: ProductCategory;
  barcodeGenerated?: boolean;
  barcodeImage?: string;
};

/** Line item sent from the cashier cart to POST /api/checkout */
export type CheckoutLineItem = {
  productId: string;
  quantity: number;
};

/** Resolved line on a completed sale (server-calculated) */
export type ReceiptLine = {
  productId: string;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type CheckoutRequest = {
  items: CheckoutLineItem[];
};

export type CheckoutResponse = {
  success: true;
  transactionId: string;
  total: number;
  receipt: ReceiptLine[];
};

export type ApiError = {
  success: false;
  error: string;
  code?: "NOT_FOUND" | "INSUFFICIENT_STOCK" | "INVALID_REQUEST" | "UNAUTHORIZED";
};

/** Owner dashboard: create a new product */
export type CreateProductPayload = {
  product: Omit<InventoryProduct, "id"> & {
    barcode?: string;
    barcodeGenerated?: boolean;
    barcodeImage?: string;
  };
};

/** Owner dashboard: patch an existing product */
export type UpdateProductPayload = {
  productId: string;
  updates: Partial<Pick<InventoryProduct, "name" | "price" | "stock" | "category" | "barcode" | "sku" | "originalPrice" | "discountedPrice" | "salePercentage" | "barcodeGenerated" | "barcodeImage">>;
};

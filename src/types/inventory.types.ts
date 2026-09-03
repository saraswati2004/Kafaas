import { ProductStatus } from './product.types';

export type InventoryTransactionType = 
  | 'restock'
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'cancellation'
  | 'reservation'
  | 'release';

export interface VendorInventoryItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  sku: string;
  mainImage: string;
  packSize: string;
  price: number;
  availableStock: number;
  reservedStock: number;
  totalStock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isLowStock: boolean;
  lastRestockedAt: string;
  updatedAt: string;
  warehouseLocation: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  type: InventoryTransactionType;
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceId?: string; // Order ID, Batch Number, or Audit Reference
  reason: string;
  performedBy: string;
  performedByRole: 'admin' | 'vendor' | 'system';
  timestamp: string;
}

export interface StockAdjustmentPayload {
  productId: string;
  adjustmentType: 'add' | 'subtract' | 'set_exact';
  quantity: number;
  reason: string;
  batchNumber: string;
}

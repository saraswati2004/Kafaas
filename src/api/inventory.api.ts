import { apiClient, API_BASE_URL, mockDelay } from './client';
import { VendorInventoryItem, InventoryTransaction, StockAdjustmentPayload } from '../types/inventory.types';
import { User } from '../types/auth.types';
import { MOCK_VENDOR_INVENTORY, MOCK_INVENTORY_TRANSACTIONS } from './mockData';
import { productsApi } from './products.api';

let localInventory = [...MOCK_VENDOR_INVENTORY];
let localTransactions = [...MOCK_INVENTORY_TRANSACTIONS];

export const inventoryApi = {
  getVendorInventory: async (_vendorId?: string): Promise<VendorInventoryItem[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<VendorInventoryItem[]>('/inventory/vendor');
      return res.data;
    }
    await mockDelay(250);
    return localInventory;
  },

  getAdminInventory: async (): Promise<VendorInventoryItem[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<VendorInventoryItem[]>('/inventory/admin');
      return res.data;
    }
    await mockDelay(250);
    return localInventory;
  },

  getInventoryTransactions: async (): Promise<InventoryTransaction[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<InventoryTransaction[]>('/inventory/transactions');
      return res.data;
    }
    await mockDelay(250);
    return localTransactions;
  },

  adjustStock: async (payload: StockAdjustmentPayload, user: User): Promise<VendorInventoryItem> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<VendorInventoryItem>('/inventory/adjust', payload);
      return res.data;
    }
    await mockDelay(400);

    const index = localInventory.findIndex((i) => i.productId === payload.productId);
    if (index === -1) {
      throw new Error(`Inventory item for product ${payload.productId} not found`);
    }

    const current = localInventory[index];
    const prevStock = current.availableStock;
    let newStock = prevStock;

    if (payload.adjustmentType === 'add') {
      newStock = prevStock + payload.quantity;
    } else if (payload.adjustmentType === 'subtract') {
      newStock = Math.max(0, prevStock - payload.quantity);
    } else if (payload.adjustmentType === 'set_exact') {
      newStock = Math.max(0, payload.quantity);
    }

    const qtyChange = newStock - prevStock;

    const updatedItem: VendorInventoryItem = {
      ...current,
      availableStock: newStock,
      totalStock: newStock + current.reservedStock,
      isLowStock: newStock <= current.lowStockThreshold,
      lastRestockedAt: qtyChange > 0 ? new Date().toISOString() : current.lastRestockedAt,
      updatedAt: new Date().toISOString(),
    };

    localInventory[index] = updatedItem;

    // Sync product stock quantity
    await productsApi.updateProduct(payload.productId, {
      stockQuantity: newStock,
      inStock: newStock > 0,
      status: newStock > 0 ? 'active' : 'out_of_stock',
    });

    // Record audit transaction
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: current.productId,
      productName: current.productName,
      sku: current.sku,
      vendorId: user.role === 'vendor' ? user.id : 'usr-vendor-1',
      vendorName: user.vendorBusinessName || 'AgroTech Solutions Indore',
      type: qtyChange > 0 ? 'restock' : 'adjustment',
      quantityChange: qtyChange,
      previousStock: prevStock,
      newStock,
      referenceId: payload.batchNumber || `ADJ-${Date.now()}`,
      reason: payload.reason,
      performedBy: user.fullName,
      performedByRole: user.role === 'admin' ? 'admin' : 'vendor',
      timestamp: new Date().toISOString(),
    };

    localTransactions = [newTx, ...localTransactions];

    return updatedItem;
  }
};

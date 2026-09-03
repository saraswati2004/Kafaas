import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { StockAdjustmentPayload } from '../types/inventory.types';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

export const useVendorInventory = (vendorId?: string) => {
  return useQuery({
    queryKey: ['vendorInventory', vendorId],
    queryFn: () => inventoryApi.getVendorInventory(vendorId),
    staleTime: 1000 * 30,
  });
};

export const useAdminInventory = () => {
  return useQuery({
    queryKey: ['adminInventory'],
    queryFn: () => inventoryApi.getAdminInventory(),
    staleTime: 1000 * 30,
  });
};

export const useInventoryTransactions = () => {
  return useQuery({
    queryKey: ['inventoryTransactions'],
    queryFn: () => inventoryApi.getInventoryTransactions(),
    staleTime: 1000 * 30,
  });
};

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const adjustStockMutation = useMutation({
    mutationFn: (payload: StockAdjustmentPayload) => {
      if (!user) throw new Error('Authentication required');
      return inventoryApi.adjustStock(payload, user);
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['vendorInventory'] });
      queryClient.invalidateQueries({ queryKey: ['adminInventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast({
        type: 'success',
        title: 'Stock Updated',
        message: `${updatedItem.productName} new available quantity: ${updatedItem.availableStock} units.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Stock Adjustment Failed',
        message: err.message,
      });
    },
  });

  return {
    adjustStock: adjustStockMutation.mutateAsync,
    isAdjustingStock: adjustStockMutation.isPending,
  };
};

import { useCartStore } from '../stores/cartStore';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../api/cart.api';
import { useUIStore } from '../stores/uiStore';

export const useCart = () => {
  const { items, addItem, updateQuantity, removeItem, clearCart, getItemCount } = useCartStore();
  const { addToast } = useUIStore();
  
  console.log('[useCart] items from store:', items);
  console.log('[useCart] items length:', items?.length);

  const handleAddToCart = (productId: string, productName: string = 'Product', quantity: number = 1) => {
    addItem(productId, quantity);
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${quantity}x ${productName} added to your basket.`,
    });
  };

  const handleAddMultipleToCart = (products: { productId: string; productName: string; quantity: number }[]) => {
    products.forEach((p) => addItem(p.productId, p.quantity));
    addToast({
      type: 'success',
      title: 'Kit Added to Cart',
      message: `${products.length} recommended products added to your basket.`,
    });
  };

  // Authoritative Backend calculation query
  const cartCalculationQuery = useQuery({
    queryKey: ['cartCalculation', items],
    queryFn: async () => {
      console.log('[useCart] queryFn called with items:', items);
      return cartApi.calculateTotals({ items });
    },
    enabled: items.length > 0,
    staleTime: 1000 * 10,
  });

  console.log('[useCart] cartCalculationQuery:', {
    data: cartCalculationQuery.data,
    isLoading: cartCalculationQuery.isLoading,
    isError: cartCalculationQuery.isError,
    error: cartCalculationQuery.error
  });

  return {
    items,
    itemCount: getItemCount(),
    addToCart: handleAddToCart,
    addMultipleToCart: handleAddMultipleToCart,
    updateQuantity,
    removeFromCart: (productId: string, productName?: string) => {
      removeItem(productId);
      if (productName) {
        addToast({
          type: 'info',
          message: `${productName} removed from cart.`,
        });
      }
    },
    clearCart,
    calculation: cartCalculationQuery.data,
    isLoadingCalculation: cartCalculationQuery.isLoading && items.length > 0,
    isCalculationError: cartCalculationQuery.isError,
    calculationError: cartCalculationQuery.error,
    refetchCalculation: cartCalculationQuery.refetch,
  };
};
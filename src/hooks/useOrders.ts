import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { CreateOrderPayload, OrderStatus } from '../types/order.types';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { useNavigate } from 'react-router-dom';

export const useOrders = (userId?: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => ordersApi.getOrders(userId),
    staleTime: 1000 * 30,
  });
};

export const useOrder = (id?: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
};

export const useVendorOrders = (vendorId?: string) => {
  return useQuery({
    queryKey: ['vendorOrders', vendorId],
    queryFn: () => ordersApi.getVendorOrders(vendorId!),
    enabled: !!vendorId,
    staleTime: 1000 * 30,
  });
};

export const useOrderMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => {
      if (!user) throw new Error('You must be logged in to place an order');
      return ordersApi.createOrder(payload, user);
    },
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Order #${order.orderNumber} has been booked. Estimated delivery by ${order.estimatedDeliveryDate}.`,
      });
      navigate(`/farmer/orders/${order.id}`);
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Failed to Place Order',
        message: err.message,
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersApi.cancelOrder(id, reason),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      addToast({
        type: 'info',
        title: 'Order Cancelled',
        message: `Order #${order.orderNumber} has been cancelled.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err.message,
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: OrderStatus; notes?: string }) =>
      ordersApi.updateOrderStatus(id, status, notes),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      addToast({
        type: 'success',
        title: 'Order Status Updated',
        message: `Order #${order.orderNumber} is now ${order.status.toUpperCase()}.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message,
      });
    },
  });

  return {
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isCancellingOrder: cancelOrderMutation.isPending,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
  };
};

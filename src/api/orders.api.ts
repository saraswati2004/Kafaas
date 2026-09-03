import { apiClient, API_BASE_URL, mockDelay } from './client';
import { Order, OrderStatus, CreateOrderPayload } from '../types/order.types';
import { User } from '../types/auth.types';
import { MOCK_ORDERS } from './mockData';
import { cartApi } from './cart.api';
import { productsApi } from './products.api';

let localOrders = [...MOCK_ORDERS];

export const ordersApi = {
  getOrders: async (userId?: string): Promise<Order[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Order[]>('/orders', { params: { userId } });
      return res.data;
    }
    await mockDelay(300);
    if (userId) {
      return localOrders.filter((o) => o.userId === userId);
    }
    return localOrders;
  },

  getOrderById: async (id: string): Promise<Order> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Order>(`/orders/${id}`);
      return res.data;
    }
    await mockDelay(200);
    const order = localOrders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }
    return order;
  },

  createOrder: async (payload: CreateOrderPayload, user: User): Promise<Order> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<Order>('/orders', payload);
      return res.data;
    }
    await mockDelay(600);

    // Calculate authoritative backend pricing and validate items
    const calc = await cartApi.calculateTotals({ items: payload.items });
    if (!calc.isValid) {
      throw new Error('Some items are out of stock or exceed available quantity.');
    }

    const shippingAddress = payload.shippingAddressId
      ? user.addresses.find((a) => a.id === payload.shippingAddressId) || user.addresses[0]
      : payload.newShippingAddress
      ? { ...payload.newShippingAddress, id: `addr-${Date.now()}`, isDefault: false }
      : user.addresses[0];

    if (!shippingAddress) {
      throw new Error('Please select or provide a valid delivery address.');
    }

    // Build order items
    const orderItems = await Promise.all(
      payload.items.map(async (item, idx) => {
        const prod = await productsApi.getProductById(item.productId);
        return {
          id: `item-${Date.now()}-${idx}`,
          productId: prod.id,
          productName: prod.name,
          brand: prod.brand,
          category: prod.category,
          image: prod.mainImage,
          packSize: prod.packSize,
          unitPrice: prod.price,
          quantity: item.quantity,
          totalPrice: prod.price * item.quantity,
          sku: prod.sku,
          vendorId: prod.vendorId,
          vendorName: prod.vendorName,
        };
      })
    );

    const orderNumSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `KF-2026-${orderNumSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: user.id,
      customerName: user.fullName,
      customerPhone: user.phone,
      customerEmail: user.email,
      shippingAddress,
      items: orderItems,
      pricing: calc.pricing,
      status: 'pending',
      paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod: payload.paymentMethod,
      paymentTransactionId: payload.paymentMethod === 'cod' ? undefined : `TXN-UPI-${Date.now()}`,
      timeline: [
        {
          status: 'pending',
          title: 'Order Placed',
          description: `Order successfully booked with ${payload.paymentMethod.toUpperCase()} payment method.`,
          timestamp: new Date().toISOString(),
          completed: true,
        },
        {
          status: 'confirmed',
          title: 'Order Confirmation',
          description: 'Awaiting vendor dispatch confirmation.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'processing',
          title: 'Packaging & Quality Check',
          description: 'Sealed for agrochemical transit.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'shipped',
          title: 'Dispatched to Hub',
          description: 'Handed over to rural courier logistics.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'out_for_delivery',
          title: 'Out for Farm Delivery',
          description: 'Delivery executive on the way to village.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Package received by farmer.',
          timestamp: '',
          completed: false,
        },
      ],
      cancellationAllowed: true,
      notes: payload.notes,
      vendorId: orderItems[0]?.vendorId || 'usr-vendor-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    localOrders = [newOrder, ...localOrders];
    return newOrder;
  },

  cancelOrder: async (id: string, reason: string): Promise<Order> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<Order>(`/orders/${id}/cancel`, { reason });
      return res.data;
    }
    await mockDelay(300);
    const index = localOrders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const order = localOrders[index];
    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new Error('Order cannot be cancelled once dispatched.');
    }

    localOrders[index] = {
      ...order,
      status: 'cancelled',
      cancelReason: reason,
      cancellationAllowed: false,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...order.timeline,
        {
          status: 'cancelled',
          title: 'Order Cancelled',
          description: `Cancelled: ${reason}`,
          timestamp: new Date().toISOString(),
          completed: true,
        }
      ]
    };

    return localOrders[index];
  },

  updateOrderStatus: async (id: string, status: OrderStatus, notes?: string): Promise<Order> => {
    if (API_BASE_URL) {
      const res = await apiClient.put<Order>(`/orders/${id}/status`, { status, notes });
      return res.data;
    }
    await mockDelay(300);
    const index = localOrders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const order = localOrders[index];
    const updatedTimeline = order.timeline.map((event) => {
      if (event.status === status) {
        return {
          ...event,
          completed: true,
          timestamp: new Date().toISOString(),
          description: notes || event.description,
        };
      }
      return event;
    });

    localOrders[index] = {
      ...order,
      status,
      timeline: updatedTimeline,
      cancellationAllowed: status === 'pending' || status === 'confirmed',
      updatedAt: new Date().toISOString(),
    };

    return localOrders[index];
  },

  getVendorOrders: async (vendorId: string): Promise<Order[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Order[]>(`/vendor/orders`, { params: { vendorId } });
      return res.data;
    }
    await mockDelay(250);
    return localOrders.filter((o) => o.vendorId === vendorId || o.items.some((i) => i.vendorId === vendorId));
  }
};

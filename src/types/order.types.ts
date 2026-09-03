import { Address } from './auth.types';
import { Product } from './product.types';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  image: string;
  packSize: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  sku: string;
  vendorId?: string;
  vendorName?: string;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  farmerSubsidyDiscount: number;
  deliveryCharge: number;
  taxGst: number;
  totalAmount: number;
}

export interface OrderTrackingEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: Address;
  items: OrderItem[];
  pricing: OrderPricing;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  timeline: OrderTrackingEvent[];
  cancelReason?: string;
  cancellationAllowed: boolean;
  notes?: string;
  vendorId?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate: string;
}

export interface CreateOrderPayload {
  shippingAddressId?: string;
  newShippingAddress?: Omit<Address, 'id'>;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

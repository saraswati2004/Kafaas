import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVendorOrders, useOrderMutations } from '../../hooks/useOrders';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ShoppingBag, CheckCircle2, Truck, Package, Clock } from 'lucide-react';
import { OrderStatus } from '../../types/order.types';

export const VendorOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useVendorOrders(user?.id || 'usr-vendor-1');
  const { updateOrderStatus, isUpdatingStatus } = useOrderMutations();

  const handleProgressOrder = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'processing';
    if (currentStatus === 'pending') nextStatus = 'confirmed';
    else if (currentStatus === 'confirmed') nextStatus = 'processing';
    else if (currentStatus === 'processing') nextStatus = 'shipped';

    updateOrderStatus({ id: orderId, status: nextStatus });
  };

  const statusVariant = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'blue',
    shipped: 'purple',
    out_for_delivery: 'yellow',
    delivered: 'green',
    cancelled: 'red',
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Consignment Dispatch Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Process orders, assign logistics tracking numbers, and dispatch agro-inputs.
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-base text-slate-900">{order.orderNumber}</span>
                <Badge variant={statusVariant[order.status]} size="sm" dot>
                  {order.status.toUpperCase()}
                </Badge>
              </div>

              <div className="text-xs text-slate-500">
                <span>Booked: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                <span className="mx-2">•</span>
                <span className="font-bold text-slate-900">
                  ₹{order.pricing.totalAmount.toLocaleString('en-IN')} ({order.paymentMethod.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">
                  Farmer Details
                </span>
                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                <p>Phone: {order.customerPhone}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">
                  Destination Farm
                </span>
                <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.villageOrCity}</p>
                <p>{order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Items to Pack:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                  >
                    <span className="font-bold text-slate-900 truncate max-w-xs">{item.productName}</span>
                    <span className="font-mono text-blue-700 font-bold shrink-0">{item.quantity} Units</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Logistics Hub: Indore Central Sector B
              </span>

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <Button
                  onClick={() => handleProgressOrder(order.id, order.status)}
                  isLoading={isUpdatingStatus}
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 font-bold"
                >
                  {order.status === 'pending' && 'Accept Order & Allocate Inventory'}
                  {order.status === 'confirmed' && 'Mark as Quality Checked & Packed'}
                  {order.status === 'processing' && 'Dispatch to Rural Logistics'}
                  {order.status === 'shipped' && 'Mark Out for Delivery'}
                  {order.status === 'out_for_delivery' && 'Mark Delivered'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

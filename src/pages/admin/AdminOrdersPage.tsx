import React, { useState } from 'react';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import { Order, OrderStatus } from '../../types/order.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle2, 
  Truck, 
  Package, 
  MapPin, 
  CreditCard,
  Printer
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { data: orders = [], isLoading } = useOrders();
  const { updateOrderStatus, isUpdatingStatus } = useOrderMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusNote, setStatusNote] = useState('');

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      const updated = await updateOrderStatus({
        id: selectedOrder.id,
        status: nextStatus,
        notes: statusNote || undefined,
      });
      setSelectedOrder(updated);
      setStatusNote('');
    } catch (err) {
      console.error(err);
    }
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
            Consignments & Logistics Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee fulfillment pipelines, audit payments, and trigger courier dispatches.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order #, Customer, or Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Order Number & Date</th>
                <th className="py-4 px-4">Farmer / Customer</th>
                <th className="py-4 px-4">Items Count</th>
                <th className="py-4 px-4 text-right">Total Amount</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Order Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-slate-900 block font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{order.customerName}</span>
                    <span className="text-[11px] text-slate-400">{order.customerPhone}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {order.items.length} Product{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-sm">
                    ₹{order.pricing.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-xs uppercase font-bold text-slate-700 block">
                      {order.paymentMethod}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={statusVariant[order.status]} size="sm" dot>
                      {order.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Management Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        description="Review customer address, item lines, and trigger authorized status progressions."
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <OrderStatusTimeline timeline={selectedOrder.timeline} currentStatus={selectedOrder.status} />
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Customer</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                <p>Phone: {selectedOrder.customerPhone}</p>
                <p>Email: {selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Shipping Farm Address</span>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                <p>{selectedOrder.shippingAddress.villageOrCity}, {selectedOrder.shippingAddress.district} - {selectedOrder.shippingAddress.pincode}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Ordered Products</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {selectedOrder.items.map((i) => (
                  <div key={i.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{i.productName}</span>
                      <span className="text-slate-400 font-mono">SKU: {i.sku} • Pack: {i.packSize}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {i.quantity} × ₹{i.unitPrice} = ₹{i.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Progression Controls */}
            {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                <span className="text-xs font-bold text-purple-950 block">
                  Authoritative Status Actions:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      onClick={() => handleUpdateStatus('confirmed')}
                      isLoading={isUpdatingStatus}
                      variant="primary"
                      size="sm"
                    >
                      Confirm Order
                    </Button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <Button
                      onClick={() => handleUpdateStatus('processing')}
                      isLoading={isUpdatingStatus}
                      variant="primary"
                      size="sm"
                    >
                      Mark Packaged & QC Passed
                    </Button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button
                      onClick={() => handleUpdateStatus('shipped')}
                      isLoading={isUpdatingStatus}
                      variant="primary"
                      size="sm"
                    >
                      Handover to Rural Logistics (Shipped)
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button
                      onClick={() => handleUpdateStatus('out_for_delivery')}
                      isLoading={isUpdatingStatus}
                      variant="primary"
                      size="sm"
                    >
                      Mark Out for Farm Delivery
                    </Button>
                  )}
                  {selectedOrder.status === 'out_for_delivery' && (
                    <Button
                      onClick={() => handleUpdateStatus('delivered')}
                      isLoading={isUpdatingStatus}
                      variant="success"
                      size="sm"
                    >
                      Confirm Delivery Handover
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

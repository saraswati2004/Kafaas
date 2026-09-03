import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder, useOrderMutations } from '../../hooks/useOrders';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { 
  ArrowLeft, 
  Printer, 
  MapPin, 
  CreditCard, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package,
  Sparkles
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id);
  const { cancelOrder, isCancellingOrder } = useOrderMutations();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Crop spray plan rescheduled due to unseasonal rain');

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Could not find details for order #{id}.</p>
        <Link to="/farmer/orders">
          <Button variant="primary" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason) return;
    try {
      await cancelOrder({ id: order.id, reason: cancelReason });
      setIsCancelModalOpen(false);
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
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          to="/farmer/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          {order.cancellationAllowed && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Order Status Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                Order #{order.orderNumber}
              </h1>
              <Badge variant={statusVariant[order.status]} size="md" dot>
                {order.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Booked on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Estimated Arrival Date</span>
            <span className="text-base font-extrabold text-emerald-800">
              {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="py-2">
          <OrderStatusTimeline timeline={order.timeline} currentStatus={order.status} />
        </div>

        {order.status === 'cancelled' && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Order Cancelled</span>
              <p className="mt-0.5">{order.cancelReason || 'Cancelled upon customer request.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Order Items & Delivery Address + Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900">
            Items in Consignment ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 p-2 border border-slate-200 shrink-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      {item.brand} • {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.productName}</h4>
                    <span className="text-xs text-slate-400 font-mono block">
                      SKU: {item.sku} • Pack: {item.packSize}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.quantity} × ₹{item.unitPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Address & Authoritative Totals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Farm Delivery Address</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.villageOrCity}, {order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-slate-500 font-medium pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment & Pricing */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</span>
              <span className="text-xs font-extrabold text-slate-900 uppercase">
                {order.paymentMethod} ({order.paymentStatus})
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold">₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Volume Discount</span>
                  <span>- ₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.pricing.farmerSubsidyDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Kisan Subsidy</span>
                  <span>- ₹{order.pricing.farmerSubsidyDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>{order.pricing.deliveryCharge === 0 ? 'FREE' : `₹${order.pricing.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Agrochemical GST (5%)</span>
                <span>₹{order.pricing.taxGst.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Paid / Payable</span>
              <span className="text-xl font-extrabold text-emerald-800">
                ₹{order.pricing.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Consignment Order"
        description="Please let us know why you are cancelling this order so we can improve our service."
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Cancellation
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              isLoading={isCancellingOrder}
            >
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

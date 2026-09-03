import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  ShoppingBag, 
  Search, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { OrderStatus } from '../../types/order.types';

export const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrders(user?.id);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusVariant = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'blue',
    shipped: 'purple',
    out_for_delivery: 'yellow',
    delivered: 'green',
    cancelled: 'red',
  } as const;

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'active') {
      if (order.status === 'delivered' || order.status === 'cancelled') return false;
    } else if (filterStatus === 'delivered') {
      if (order.status !== 'delivered') return false;
    } else if (filterStatus === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
      if (!matchNum && !matchItem) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            My Orders & Consignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track deliveries, view agrochemical batch invoices, and manage farm receipts.
          </p>
        </div>

        <Link to="/shop">
          <Button variant="primary" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Order More Inputs
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'active', label: 'In Progress / Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by Order # or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-emerald-600" />}
          title="No Orders Found"
          description="You have no recorded orders under the selected filter criteria."
          actionText="Browse Agri Catalog"
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
            >
              {/* Top Row: Order Number, Date, Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {order.orderNumber}
                  </span>
                  <Badge variant={statusVariant[order.status]} size="sm" dot>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">
                    ₹{order.pricing.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails and Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-12 rounded-lg bg-white object-contain p-1 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {item.productName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Qty: {item.quantity} • {item.packSize}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Row: Address summary & CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-xs">
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.villageOrCity}
                  </span>
                </div>

                <Link to={`/farmer/orders/${order.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Tracking & Invoice
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

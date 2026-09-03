import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useVendorInventory } from '../../hooks/useInventory';
import { useVendorOrders } from '../../hooks/useOrders';
import { usersApi } from '../../api/users.api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  Store, 
  Boxes, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Building2,
  PackageCheck
} from 'lucide-react';

export const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: inventory = [] } = useVendorInventory(user?.id);
  const { data: vendorOrders = [] } = useVendorOrders(user?.id || 'usr-vendor-1');
  const { data: metrics } = useQuery({
    queryKey: ['vendorMetrics', user?.id],
    queryFn: () => usersApi.getVendorMetrics(user?.id),
  });

  const lowStockItems = inventory.filter((i) => i.isLowStock);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-soft relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-700 text-blue-100 uppercase tracking-wider">
              {user?.vendorGstin ? `GST: ${user.vendorGstin}` : 'Authorized Hub'}
            </span>
            <span className="text-blue-300">•</span>
            <span className="text-xs text-blue-200">Indore Regional Agro-Warehouse</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans']">
            {user?.vendorBusinessName || 'AgroTech Solutions Indore'} 🏪
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage your assigned warehouse stock levels, fulfill incoming farmer consignments, and monitor fulfillment metrics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/vendor/inventory">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Boxes className="w-4 h-4 text-blue-900" />}
                className="bg-white text-blue-950 hover:bg-blue-50 border-0 font-bold"
              >
                Manage Inventory
              </Button>
            </Link>
            <Link to="/vendor/orders">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-950/60 text-white border-blue-600 hover:bg-blue-900"
              >
                View Dispatch Queue ({vendorOrders.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{metrics?.totalSales.toLocaleString('en-IN') || '4,85,000'}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium block">
            +18% month-over-month
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600">
            {metrics?.totalOrders || vendorOrders.length}
          </span>
          <span className="text-[11px] text-slate-400 block">Fulfillment orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">
            {lowStockItems.length}
          </span>
          <span className="text-[11px] text-slate-400 block">Needs restock request</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Fulfillment Rate</span>
            <PackageCheck className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-extrabold text-purple-600">
            {metrics?.fulfillmentRatePercentage || 98.4}%
          </span>
          <span className="text-[11px] text-emerald-600 font-medium block">48hr SLA compliance</span>
        </div>
      </div>

      {/* Grid: Assigned Inventory Preview & Recent Fulfillment Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assigned Inventory */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Assigned Inventory Stock</h2>
            </div>
            <Link to="/vendor/inventory" className="text-xs font-bold text-blue-700 hover:underline">
              View All ({inventory.length})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {inventory.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.mainImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl bg-slate-100 p-1 object-contain border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-xs">
                      {item.productName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      SKU: {item.sku} • {item.packSize}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-extrabold text-slate-900">
                      {item.availableStock} Units
                    </span>
                    {item.isLowStock && (
                      <Badge variant="yellow" size="sm">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Reserved: {item.reservedStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Dispatch Queue */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Fulfillment Orders</h2>
            </div>
            <Link to="/vendor/orders" className="text-xs font-bold text-blue-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {vendorOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                  <Badge variant={order.status === 'delivered' ? 'green' : 'blue'} size="sm">
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Farmer: <strong>{order.customerName}</strong> ({order.shippingAddress.villageOrCity})
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-bold text-slate-900">
                    ₹{order.pricing.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <Link
                    to={`/farmer/orders/${order.id}`}
                    className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Slip</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

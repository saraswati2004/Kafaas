import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { useFarmerScanHistory } from '../../hooks/useRecommendations';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  ShoppingBag, 
  Stethoscope, 
  MapPin, 
  History, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Package,
  Store
} from 'lucide-react';

export const FarmerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders(user?.id);
  const { data: scanHistory = [] } = useFarmerScanHistory(user?.id);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700 text-emerald-100 uppercase tracking-wider">
              {user?.kisanId || 'KISAN-MP-2024'}
            </span>
            <span className="text-emerald-300">•</span>
            <span className="text-xs text-emerald-200">Madhya Pradesh Agri Zone</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans']">
            Namaste, {user?.fullName}! 🌾
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Welcome to your KaFaaS Kisan Portal. Track your farm input shipments, review past crop diagnosis advisories, and manage farm delivery addresses.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/recommendations">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Stethoscope className="w-4 h-4 text-emerald-800" />}
                className="bg-white text-emerald-950 hover:bg-emerald-50 border-0 font-bold"
              >
                Diagnose Crop Issues
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                variant="outline"
                size="sm"
                className="bg-emerald-900/60 text-white border-emerald-600 hover:bg-emerald-800"
              >
                Shop Agro Inputs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{orders.length}</span>
          <span className="text-[11px] text-slate-400 block">All-time farm orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">{activeOrders.length}</span>
          <span className="text-[11px] text-slate-400 block">En route to village hub</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Crop Scans</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600">{scanHistory.length}</span>
          <span className="text-[11px] text-slate-400 block">Diagnosed plot records</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Farms</span>
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-extrabold text-purple-600">{user?.addresses?.length || 0}</span>
          <span className="text-[11px] text-slate-400 block">Delivery locations</span>
        </div>
      </div>

      {/* Two Column Grid: Active Orders & Recent Crop Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Farm Orders</h2>
            </div>
            <Link to="/farmer/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{order.orderNumber}</span>
                      <Badge variant={statusVariant[order.status]} size="sm" dot>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ₹{order.pricing.totalAmount.toLocaleString('en-IN')} via {order.paymentMethod.toUpperCase()}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <Link to={`/farmer/orders/${order.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Track
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Crop Scans & Advisory */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Crop Health Diagnosis</h2>
            </div>
            <Link to="/farmer/scans" className="text-xs font-bold text-emerald-700 hover:underline">
              History
            </Link>
          </div>

          {scanHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No scan archives recorded.</p>
          ) : (
            <div className="space-y-3">
              {scanHistory.slice(0, 2).map((scan) => (
                <div
                  key={scan.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 block">{scan.cropName}</span>
                      <h4 className="font-bold text-sm text-slate-900">{scan.diseaseDetected}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      {scan.confidenceScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{scan.plotName}</p>

                  <Link
                    to="/farmer/recommendations"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
                  >
                    <span>View Prescribed Remedy Kit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

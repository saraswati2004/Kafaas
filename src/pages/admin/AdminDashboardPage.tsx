import React from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api/users.api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  GitPullRequest, 
  Stethoscope, 
  ArrowRight,
  Package,
  Plus
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => usersApi.getAdminMetrics(),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Enterprise Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System overview of agricultural input commerce, vendor fulfillment, and disease advisory matrices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Product
            </Button>
          </Link>
          <Link to="/admin/recommendations">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Stethoscope className="w-4 h-4 text-emerald-700" />}
            >
              Advisory Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* 8-Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{metrics?.totalRevenue.toLocaleString('en-IN') || '18,45,000'}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium block">Active GMV</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Farmers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600">
            {metrics?.totalFarmers.toLocaleString('en-IN') || '1,380'}
          </span>
          <span className="text-[11px] text-slate-400 block">Kisan verified profiles</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Vendors</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-extrabold text-purple-600">
            {metrics?.totalVendors || 42}
          </span>
          <span className="text-[11px] text-slate-400 block">Regional agri-depots</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Consignments</span>
            <ShoppingBag className="w-4 h-4 text-slate-700" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {metrics?.totalOrders.toLocaleString('en-IN') || '514'}
          </span>
          <span className="text-[11px] text-slate-400 block">Fulfilled orders</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">
            {metrics?.pendingOrdersCount || 4}
          </span>
          <span className="text-[11px] text-slate-400 block">Requires dispatch check</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-extrabold text-red-600">
            {metrics?.lowStockProductsCount || 2}
          </span>
          <span className="text-[11px] text-slate-400 block">Depot alert triggered</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Vendor Req</span>
            <GitPullRequest className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-extrabold text-orange-600">
            {metrics?.pendingVendorRequestsCount || 1}
          </span>
          <span className="text-[11px] text-slate-400 block">Awaiting admin review</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Disease Mappings</span>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-600">
            {metrics?.activeRecommendationsCount || 4}
          </span>
          <span className="text-[11px] text-slate-400 block">Verified ICM kits</span>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products"
          className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-purple-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">
            Product Catalog CRUD
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create, edit, activate/deactivate fertilizers, fungicides, seeds, and define chemical specifications.
          </p>
        </Link>

        <Link
          to="/admin/recommendations"
          className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
            Disease-to-Product Matrix
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Map agricultural crops & diseases (Tomato Early Blight, Cotton Bollworm) to priority product remedy combinations.
          </p>
        </Link>

        <Link
          to="/admin/vendor-requests"
          className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
            Vendor Request Review Queue
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Approve or reject vendor business name, GSTIN, and bank account amendment requests with audit trail.
          </p>
        </Link>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import { ToastContainer } from '../components/common/ToastContainer';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingBag, 
  TrendingUp, 
  Building2, 
  Sliders, 
  LogOut, 
  Store, 
  Menu, 
  X 
} from 'lucide-react';
import { clsx } from 'clsx';

export const VendorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Vendor Dashboard', path: '/vendor', icon: LayoutDashboard, exact: true },
    { name: 'Assigned Inventory', path: '/vendor/inventory', icon: Boxes },
    { name: 'Fulfillment Orders', path: '/vendor/orders', icon: ShoppingBag },
    { name: 'Sales Reports', path: '/vendor/sales', icon: TrendingUp },
    { name: 'Business Profile & KYC', path: '/vendor/profile', icon: Building2 },
    { name: 'Vendor Settings', path: '/vendor/preferences', icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <RoleSwitcher />

      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <span>Vendor Console</span>
          </div>
        </div>
        <Link to="/shop" className="text-xs font-bold text-blue-700 hover:underline">
          View Store
        </Link>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Vendor Sidebar */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 p-5 flex flex-col justify-between shadow-xl transition-transform duration-300 lg:static lg:shadow-soft lg:rounded-2xl lg:border lg:z-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="space-y-6">
            {/* Vendor Profile Header */}
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Authorized Supplier
              </span>
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {user?.vendorBusinessName || 'AgroTech Solutions Indore'}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                GST: {user?.vendorGstin || '23AABCA1234F1Z8'}
              </p>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              to="/shop"
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Agri Storefront</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

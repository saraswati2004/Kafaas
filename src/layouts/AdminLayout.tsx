import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import { ToastContainer } from '../components/common/ToastContainer';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingBag, 
  Stethoscope, 
  Users, 
  GitPullRequest, 
  ScrollText, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Store
} from 'lucide-react';
import { clsx } from 'clsx';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Product Catalog CRUD', path: '/admin/products', icon: Package },
    { name: 'Inventory & Ledger', path: '/admin/inventory', icon: Boxes },
    { name: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Disease Advisory Matrix', path: '/admin/recommendations', icon: Stethoscope },
    { name: 'Farmers & Users', path: '/admin/users', icon: Users },
    { name: 'Vendor Approval Queue', path: '/admin/vendor-requests', icon: GitPullRequest },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <RoleSwitcher />

      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-700 text-slate-200"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>KaFaaS Admin</span>
          </div>
        </div>
        <Link to="/shop" className="text-xs font-bold text-purple-400 hover:underline">
          View Store
        </Link>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Admin Sidebar */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:static lg:shadow-xl lg:rounded-2xl lg:border lg:z-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="space-y-6">
            {/* Admin Header */}
            <div className="p-4 bg-purple-950/50 rounded-2xl border border-purple-800/40">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
              <h3 className="font-bold text-white text-sm truncate">{user?.fullName}</h3>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
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
                          ? 'bg-purple-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
          <div className="pt-4 border-t border-slate-700 space-y-2">
            <Link
              to="/shop"
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-purple-400 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Public Storefront</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

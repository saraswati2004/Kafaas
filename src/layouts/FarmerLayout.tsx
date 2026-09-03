import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import { ToastContainer } from '../components/common/ToastContainer';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MapPin, 
  Stethoscope, 
  History, 
  User, 
  Sliders, 
  LogOut, 
  Sprout, 
  Menu, 
  X,
  ArrowLeft,
  Store
} from 'lucide-react';
import { clsx } from 'clsx';

export const FarmerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Farmer Dashboard', path: '/farmer', icon: LayoutDashboard, exact: true },
    { name: 'My Orders & Tracking', path: '/farmer/orders', icon: ShoppingBag },
    { name: 'My Crop Advisory', path: '/farmer/recommendations', icon: Stethoscope },
    { name: 'Scan History Archive', path: '/farmer/scans', icon: History },
    { name: 'Saved Farm Addresses', path: '/farmer/addresses', icon: MapPin },
    { name: 'Farmer Profile', path: '/farmer/profile', icon: User },
    { name: 'Preferences', path: '/farmer/preferences', icon: Sliders },
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
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <span>KaFaaS Kisan</span>
          </Link>
        </div>
        <Link to="/shop" className="text-xs font-bold text-emerald-700 hover:underline">
          Go to Store
        </Link>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Farmer Sidebar */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 p-5 flex flex-col justify-between shadow-xl transition-transform duration-300 lg:static lg:shadow-soft lg:rounded-2xl lg:border lg:z-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="space-y-6">
            {/* User Profile Header */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={user?.fullName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
              />
              <div className="truncate">
                <h3 className="font-bold text-slate-900 text-sm truncate">{user?.fullName}</h3>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {user?.kisanId || 'Kisan Member'}
                </span>
                <span className="text-[11px] text-slate-500">{user?.phone}</span>
              </div>
            </div>

            {/* Navigation items */}
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
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
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
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Back to Agri Store</span>
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

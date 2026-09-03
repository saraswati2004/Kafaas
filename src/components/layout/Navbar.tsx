import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  Sprout, 
  ShieldCheck, 
  Stethoscope, 
  LayoutDashboard, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, role, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = getItemCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop Products', path: '/shop' },
    { name: 'Categories', path: '/shop#categories' },
    { 
      name: 'Disease Advisory', 
      path: '/recommendations', 
      badge: 'Smart AI',
      icon: <Stethoscope className="w-4 h-4 text-emerald-600 inline mr-1" /> 
    },
    { name: 'About KaFaaS', path: '/about' },
  ];

  const getPortalLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'vendor') return '/vendor';
    return '/farmer';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Advisory Bar */}
      <div className="bg-emerald-800 text-white text-[11px] py-1 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              100% Genuine CIB&RC Certified Agrochemicals & Seeds
            </span>
            <span className="text-emerald-300">•</span>
            <span>Free Rural Delivery on orders over ₹999</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Kisan Support Helpline: <strong>1800-180-1551 (Toll Free)</strong></span>
            <span className="text-emerald-300">•</span>
            <Link to="/about" className="hover:underline text-emerald-200">
              Why KaFaaS
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                  KaFaaS
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded uppercase tracking-wider">
                  Agri
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 tracking-wide">
                Kavir Fasal Sarthi
              </p>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search fertilizers, fungicides, seeds, crop disease..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 text-slate-900 pl-11 pr-24 py-2.5 rounded-2xl text-sm border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={clsx(
                    'text-sm font-medium transition-colors relative py-1.5 flex items-center',
                    isActive
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-600'
                  )}
                >
                  {link.icon}
                  {link.name}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User & Cart Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all text-left"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div className="hidden sm:block text-left leading-tight">
                    <span className="text-xs font-semibold text-slate-900 block truncate max-w-[100px]">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-emerald-600 uppercase font-bold">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full capitalize">
                          {user.role} Account
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getPortalLink()}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          <span>{role === 'admin' ? 'Admin Dashboard' : role === 'vendor' ? 'Vendor Dashboard' : 'Farmer Dashboard'}</span>
                        </Link>
                        {role === 'farmer' && (
                          <>
                            <Link
                              to="/farmer/orders"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <ShoppingCart className="w-4 h-4 text-slate-400" />
                              <span>My Orders</span>
                            </Link>
                            <Link
                              to="/farmer/recommendations"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Stethoscope className="w-4 h-4 text-slate-400" />
                              <span>My Crop Advisory</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* Mobile Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products or crop disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-900 pl-10 pr-20 py-2.5 rounded-xl text-sm border-transparent focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              Go
            </button>
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <div className="flex items-center">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {isAuthenticated ? (
              <Link
                to={getPortalLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard ({role.toUpperCase()})</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

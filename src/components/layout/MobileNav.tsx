import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Stethoscope, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

export const MobileNav: React.FC = () => {
  const { getItemCount } = useCartStore();
  const { isAuthenticated, role } = useAuthStore();
  const cartCount = getItemCount();

  const getAccountLink = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/admin';
    if (role === 'vendor') return '/vendor';
    return '/farmer';
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Advisory', path: '/recommendations', icon: Stethoscope },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, count: cartCount },
    { name: 'Account', path: getAccountLink(), icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative',
                  isActive ? 'text-emerald-700 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
                )
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

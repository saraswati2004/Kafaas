import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth.types';
import { UserCheck, ShieldAlert, Store, UserX, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const RoleSwitcher: React.FC = () => {
  const { role, user, setRole } = useAuthStore();
  const location = useLocation();

  const roles: { key: UserRole; label: string; icon: React.ReactNode; color: string; portalPath?: string }[] = [
    {
      key: 'farmer',
      label: 'Farmer View',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600 text-white',
      portalPath: '/farmer',
    },
    {
      key: 'vendor',
      label: 'Vendor Portal',
      icon: <Store className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 text-white',
      portalPath: '/vendor',
    },
    {
      key: 'admin',
      label: 'Admin Console',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'bg-purple-600 text-white',
      portalPath: '/admin',
    },
    {
      key: 'guest',
      label: 'Guest Mode',
      icon: <UserX className="w-3.5 h-3.5" />,
      color: 'bg-slate-700 text-white',
      portalPath: '/',
    },
  ];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider text-[10px]">
            Demo Environment
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Active Identity:{' '}
            <strong className="text-white font-medium">
              {user ? `${user.fullName} (${role.toUpperCase()})` : 'Guest / Non-Authenticated'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Switch Role:</span>
          {roles.map((r) => {
            const isActive = role === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? `${r.color} shadow-sm font-semibold ring-1 ring-white/20`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}

          {/* Direct link to role portal */}
          {role !== 'guest' && (
            <Link
              to={role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/farmer'}
              className="inline-flex items-center gap-1 ml-2 text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-[11px]"
            >
              <span>Go to {role === 'admin' ? 'Admin' : role === 'vendor' ? 'Vendor' : 'Farmer'} Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

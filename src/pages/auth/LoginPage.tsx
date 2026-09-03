import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sprout, Lock, Mail, UserCheck, Store, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('farmer@kafaas.com');
  const [password, setPassword] = useState('Farmer@12345');

  const redirectPath = (location.state as any)?.from?.pathname || '/farmer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await login({ email, password });
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickDemoLogin = async (role: 'farmer' | 'vendor' | 'admin') => {
    let demoEmail = 'farmer@kafaas.com';
    let demoPass = 'Farmer@12345';

    if (role === 'vendor') {
      demoEmail = 'vendor@kafaas.com';
      demoPass = 'Vendor@12345';
    } else if (role === 'admin') {
      demoEmail = 'admin@kafaas.com';
      demoPass = 'Admin@12345';
    }

    setEmail(demoEmail);
    setPassword(demoPass);

    try {
      await login({ email: demoEmail, password: demoPass });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-soft-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Welcome to KaFaaS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your farmer orders, crop advisory, or vendor console.
          </p>
        </div>

        {/* Quick Demo Role Logins */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block text-center">
            ⚡ Quick 1-Click Demo Login
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('farmer')}
              disabled={isLoggingIn}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vendor')}
              disabled={isLoggingIn}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={isLoggingIn}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Mobile Number"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-emerald-700 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoggingIn}
            className="font-bold shadow-md"
          >
            Sign In to KaFaaS
          </Button>
        </form>

        {/* Register CTA */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Don't have a Kisan account? </span>
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

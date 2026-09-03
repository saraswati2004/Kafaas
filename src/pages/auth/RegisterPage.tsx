import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sprout, Lock, Mail, User, Phone, MapPin, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    primaryCrop: 'Tomato',
    farmSizeAcres: 5,
    district: 'Dhar',
    state: 'Madhya Pradesh',
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');

    try {
      await register({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'farmer',
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-soft-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Create Farmer Account
          </h2>
          <p className="text-xs text-slate-500">
            Join thousands of Indian farmers benefiting from direct genuine agro-inputs and subsidized pricing.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Farmer Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Mobile Number *"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <Input
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Primary Standing Crop</label>
              <select
                value={formData.primaryCrop}
                onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                className="w-full bg-white text-xs text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Tomato">Tomato (टमाटर)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Paddy / Rice">Paddy / Rice (धान)</option>
                <option value="Chilli">Chilli (मिर्च)</option>
                <option value="Potato">Potato (आलू)</option>
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
              </select>
            </div>

            <Input
              label="Farm Holding (Acres)"
              type="number"
              value={formData.farmSizeAcres}
              onChange={(e) => setFormData({ ...formData, farmSizeAcres: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="District *"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
            <Input
              label="State *"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isRegistering}
            className="font-bold shadow-md mt-2"
          >
            Create Kisan Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

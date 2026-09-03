import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { User, Mail, Phone, MapPin, ShieldCheck, Sprout, Save } from 'lucide-react';

export const FarmerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useUIStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [kisanId, setKisanId] = useState(user?.kisanId || 'KISAN-MP-2024-8841');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ fullName, email, phone, kisanId });
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your farmer profile information has been saved.',
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          Farmer Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal Kisan ID credentials, contact numbers, and farming region.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
            alt={user?.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{user?.fullName}</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              {kisanId}
            </span>
            <p className="text-xs text-slate-400 mt-1">Role: Farmer / Normal User</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farmer Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Kisan ID / Farmer Reg No"
              value={kisanId}
              onChange={(e) => setKisanId(e.target.value)}
              leftIcon={<Sprout className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

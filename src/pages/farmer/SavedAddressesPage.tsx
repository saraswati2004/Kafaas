import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Address } from '../../types/auth.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Home } from 'lucide-react';

export const SavedAddressesPage: React.FC = () => {
  const { user, addAddress, updateAddress, setDefaultAddress, deleteAddress } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    alternatePhone: '',
    addressLine1: '',
    villageOrCity: '',
    district: 'Dhar',
    state: 'Madhya Pradesh',
    pincode: '',
    isDefault: false,
    addressType: 'farm' as 'farm' | 'home' | 'warehouse',
  });

  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setForm({
      name: user?.fullName || '',
      phone: user?.phone || '',
      alternatePhone: '',
      addressLine1: '',
      villageOrCity: '',
      district: 'Dhar',
      state: 'Madhya Pradesh',
      pincode: '',
      isDefault: user?.addresses.length === 0,
      addressType: 'farm',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddressId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      alternatePhone: addr.alternatePhone || '',
      addressLine1: addr.addressLine1,
      villageOrCity: addr.villageOrCity,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
      addressType: addr.addressType,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.addressLine1 || !form.pincode) return;

    if (editingAddressId) {
      updateAddress(editingAddressId, form);
    } else {
      addAddress(form);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Saved Farm & Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your farm gates, storage sheds, and residence delivery destinations.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Farm Address
        </Button>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white rounded-2xl border p-6 shadow-soft space-y-4 flex flex-col justify-between transition-all ${
              addr.isDefault ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  {addr.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {addr.addressType}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {addr.addressLine1}
                <br />
                {addr.villageOrCity}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
              </p>

              <p className="text-xs text-slate-500 font-medium">
                Phone: {addr.phone} {addr.alternatePhone ? `• Alt: ${addr.alternatePhone}` : ''}
              </p>

              {addr.isDefault && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Default Delivery Location</span>
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {!addr.isDefault && (
                <button
                  onClick={() => setDefaultAddress(addr.id)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Set as Default
                </button>
              )}
              {addr.isDefault && <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit address"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {user.addresses.length > 1 && (
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddressId ? 'Edit Farm Address' : 'Add New Farm Delivery Address'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Recipient Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Mobile Number *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <Input
            label="Farm Survey No / Street Address *"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Village / City *"
              value={form.villageOrCity}
              onChange={(e) => setForm({ ...form, villageOrCity: e.target.value })}
              required
            />
            <Input
              label="District *"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              required
            />
            <Input
              label="Pincode *"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultCheck"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isDefaultCheck" className="text-xs font-semibold text-slate-700">
              Make this my primary default farm delivery address
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {editingAddressId ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

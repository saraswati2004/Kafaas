import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { Settings, Save, ShieldCheck, Phone, DollarSign, Truck } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { addToast } = useUIStore();

  const [settings, setSettings] = useState({
    freeDeliveryMinimum: 999,
    standardDeliveryFee: 80,
    kisanSubsidyAmount: 100,
    kisanSubsidyThreshold: 1000,
    agriGstPercent: 5,
    helplineNumber: '1800-180-1551',
    supportEmail: 'support@kafaas.com',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Global agricultural commerce parameters updated successfully.',
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          Agricultural Platform Parameters
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure nationwide Kisan subsidy thresholds, freight logistics, and toll-free helpline routing.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        {/* Logistics & Delivery Rates */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            <span>Rural Logistics & Freight Policy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free Rural Delivery Minimum (₹)"
              type="number"
              value={settings.freeDeliveryMinimum}
              onChange={(e) => setSettings({ ...settings, freeDeliveryMinimum: Number(e.target.value) })}
              required
            />
            <Input
              label="Standard Tehsil Delivery Fee (₹)"
              type="number"
              value={settings.standardDeliveryFee}
              onChange={(e) => setSettings({ ...settings, standardDeliveryFee: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* Kisan Subsidy & GST */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Kisan Subsidy & Agrochemical Tax</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Subsidy Discount (₹)"
              type="number"
              value={settings.kisanSubsidyAmount}
              onChange={(e) => setSettings({ ...settings, kisanSubsidyAmount: Number(e.target.value) })}
            />
            <Input
              label="Min Order For Subsidy (₹)"
              type="number"
              value={settings.kisanSubsidyThreshold}
              onChange={(e) => setSettings({ ...settings, kisanSubsidyThreshold: Number(e.target.value) })}
            />
            <Input
              label="Agrochemical GST Rate (%)"
              type="number"
              value={settings.agriGstPercent}
              onChange={(e) => setSettings({ ...settings, agriGstPercent: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Support Helplines */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Kisan Call Center Helplines</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Toll Free Agronomist Helpline"
              value={settings.helplineNumber}
              onChange={(e) => setSettings({ ...settings, helplineNumber: e.target.value })}
            />
            <Input
              label="Support Inquiries Email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-700 font-bold"
          >
            Save Global Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

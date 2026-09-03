import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

export const VendorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: changeRequests = [], isLoading } = useQuery({
    queryKey: ['vendorChangeRequests'],
    queryFn: () => usersApi.getVendorChangeRequests(),
  });

  const [proposedData, setProposedData] = useState({
    businessName: user?.vendorBusinessName || 'AgroTech Solutions Indore',
    contactPerson: user?.fullName || 'Suresh Verma',
    phone: user?.phone || '+91 98260 77889',
    email: user?.email || 'vendor.agrotech@kafaas.com',
    gstin: user?.vendorGstin || '23AABCA1234F1Z8',
    licenseNumber: user?.vendorLicenseNo || 'AGRI/MP/IND/2022/9041',
    warehouseAddress: 'Plot 18, Sanwer Road Industrial Area, Sector B',
    state: 'Madhya Pradesh',
    district: 'Indore',
    bankAccountName: 'AgroTech Solutions Current A/C',
    bankAccountNumber: '918020038910291',
    ifscCode: 'HDFC0001024',
  });

  const [reasonForChange, setReasonForChange] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      usersApi.submitVendorChangeRequest({
        vendorId: user?.id || 'usr-vendor-1',
        vendorName: user?.vendorBusinessName || 'AgroTech Solutions Indore',
        currentData: {
          businessName: user?.vendorBusinessName || 'AgroTech Solutions Indore',
          contactPerson: user?.fullName || 'Suresh Verma',
          phone: user?.phone || '+91 98260 77889',
          email: user?.email || 'vendor.agrotech@kafaas.com',
          gstin: user?.vendorGstin || '23AABCA1234F1Z8',
          licenseNumber: user?.vendorLicenseNo || 'AGRI/MP/IND/2022/9041',
          warehouseAddress: 'Plot 18, Sanwer Road Industrial Area, Sector B',
          state: 'Madhya Pradesh',
          district: 'Indore',
          bankAccountName: 'AgroTech Solutions Current A/C',
          bankAccountNumber: '918020038910291',
          ifscCode: 'HDFC0001024',
        },
        proposedData,
        reasonForChange,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorChangeRequests'] });
      addToast({
        type: 'success',
        title: 'Change Request Submitted',
        message: 'Your profile amendment request has been sent for Admin review & verification.',
      });
      setReasonForChange('');
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonForChange.trim()) {
      addToast({
        type: 'warning',
        title: 'Reason Required',
        message: 'Please provide a rationale for the profile/banking change.',
      });
      return;
    }
    submitMutation.mutate();
  };

  const statusVariant = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
  } as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          Vendor Business Profile & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Submit official entity, GSTIN, or warehouse address amendment requests for administrative approval.
        </p>
      </div>

      {/* Process Flow Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-soft space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
          Compliance Protocol
        </span>
        <h3 className="text-lg font-bold">Profile Change Governance Workflow</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <span className="font-bold text-slate-300 block mb-1">1. Current Profile</span>
            <span className="text-slate-400">Review currently active license & warehouse details</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <span className="font-bold text-slate-300 block mb-1">2. Edit Information</span>
            <span className="text-slate-400">Enter proposed amendments and changes</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <span className="font-bold text-slate-300 block mb-1">3. Submit Request</span>
            <span className="text-slate-400">Provide official rationale and documentation</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-900/60 border border-blue-700">
            <span className="font-bold text-blue-300 block mb-1">4. Admin Approval</span>
            <span className="text-blue-200">Changes go live strictly after Admin approval</span>
          </div>
        </div>
      </div>

      {/* Grid: Edit Form (Left) & Request Status Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form: Propose Changes */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-900">
            Propose Profile / Warehouse Modifications
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Business Entity Name *"
                value={proposedData.businessName}
                onChange={(e) => setProposedData({ ...proposedData, businessName: e.target.value })}
                required
              />
              <Input
                label="Authorized Contact Person *"
                value={proposedData.contactPerson}
                onChange={(e) => setProposedData({ ...proposedData, contactPerson: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GSTIN Number *"
                value={proposedData.gstin}
                onChange={(e) => setProposedData({ ...proposedData, gstin: e.target.value })}
                required
              />
              <Input
                label="Agrochemical Fertilizer License No *"
                value={proposedData.licenseNumber}
                onChange={(e) => setProposedData({ ...proposedData, licenseNumber: e.target.value })}
                required
              />
            </div>

            <Input
              label="Primary Warehouse / Fulfillment Depot Address *"
              value={proposedData.warehouseAddress}
              onChange={(e) => setProposedData({ ...proposedData, warehouseAddress: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Bank Account Name"
                value={proposedData.bankAccountName}
                onChange={(e) => setProposedData({ ...proposedData, bankAccountName: e.target.value })}
              />
              <Input
                label="Account Number"
                value={proposedData.bankAccountNumber}
                onChange={(e) => setProposedData({ ...proposedData, bankAccountNumber: e.target.value })}
              />
              <Input
                label="IFSC Code"
                value={proposedData.ifscCode}
                onChange={(e) => setProposedData({ ...proposedData, ifscCode: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Reason / Justification for Change Request *
              </label>
              <textarea
                rows={3}
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="e.g. Upgrading from proprietorship to Pvt Ltd or warehouse relocation..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={submitMutation.isPending}
                leftIcon={<Send className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                Submit Change Request for Approval
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Submitted Change Requests History */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Change Request Status History
          </h3>

          <div className="space-y-4">
            {changeRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    Request #{req.id.slice(-6).toUpperCase()}
                  </span>
                  <Badge variant={statusVariant[req.status]} size="sm" dot>
                    {req.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Proposed Entity:</strong> {req.proposedData.businessName}
                  </p>
                  <p>
                    <strong>Reason:</strong> {req.reasonForChange}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {req.status === 'rejected' && req.rejectionReason && (
                  <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200">
                    <strong>Admin Feedback:</strong> {req.rejectionReason}
                  </div>
                )}
                {req.status === 'approved' && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Approved & Applied to Live System</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

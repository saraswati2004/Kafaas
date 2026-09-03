import React, { useState } from 'react';
import { usersApi } from '../../api/users.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorProfileChangeRequest } from '../../types/user.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useUIStore } from '../../stores/uiStore';
import { 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  ArrowRight, 
  ShieldAlert 
} from 'lucide-react';

export const AdminVendorRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['adminVendorRequests'],
    queryFn: () => usersApi.getVendorChangeRequests(),
  });

  const [selectedRequest, setSelectedRequest] = useState<VendorProfileChangeRequest | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Incomplete GSTIN incorporation certificate attached.');

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approved' | 'rejected'; reason?: string }) =>
      usersApi.reviewVendorChangeRequest(id, action, reason),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminVendorRequests'] });
      queryClient.invalidateQueries({ queryKey: ['vendorChangeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      addToast({
        type: updated.status === 'approved' ? 'success' : 'info',
        title: `Request ${updated.status.toUpperCase()}`,
        message: `Vendor change request for ${updated.vendorName} has been ${updated.status}.`,
      });
      setSelectedRequest(null);
      setRejectionModalOpen(false);
    },
  });

  const handleApprove = (req: VendorProfileChangeRequest) => {
    reviewMutation.mutate({ id: req.id, action: 'approved' });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !rejectionReason) return;
    reviewMutation.mutate({
      id: selectedRequest.id,
      action: 'rejected',
      reason: rejectionReason,
    });
  };

  const statusVariant = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Vendor Profile Change Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit and approve modifications to vendor entity titles, GSTIN numbers, bank details, and warehouse addresses.
          </p>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{req.vendorName}</h3>
                  <span className="text-xs text-slate-400">Request #{req.id.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[req.status]} size="md" dot>
                  {req.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-400">
                  {new Date(req.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Justification Rationale */}
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs">
              <span className="font-bold text-purple-950 block mb-1">
                Vendor Justification & Documentation:
              </span>
              <p className="text-purple-900 leading-relaxed">{req.reasonForChange}</p>
            </div>

            {/* Side-by-Side Comparison: Current Data vs Proposed Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Active Data */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block pb-1 border-b border-slate-200">
                  Current Active Identity
                </span>
                <p>
                  <strong>Business:</strong> {req.currentData.businessName}
                </p>
                <p>
                  <strong>Contact Person:</strong> {req.currentData.contactPerson} ({req.currentData.phone})
                </p>
                <p>
                  <strong>GSTIN:</strong> {req.currentData.gstin}
                </p>
                <p>
                  <strong>License:</strong> {req.currentData.licenseNumber}
                </p>
                <p>
                  <strong>Warehouse:</strong> {req.currentData.warehouseAddress}
                </p>
                <p>
                  <strong>Bank A/C:</strong> {req.currentData.bankAccountNumber} ({req.currentData.ifscCode})
                </p>
              </div>

              {/* Proposed Modified Data */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block pb-1 border-b border-emerald-200">
                  Proposed Modified Identity
                </span>
                <p className="text-emerald-950 font-semibold">
                  <strong>Business:</strong> {req.proposedData.businessName}
                </p>
                <p className="text-emerald-950">
                  <strong>Contact Person:</strong> {req.proposedData.contactPerson} ({req.proposedData.phone})
                </p>
                <p className="text-emerald-950">
                  <strong>GSTIN:</strong> {req.proposedData.gstin}
                </p>
                <p className="text-emerald-950">
                  <strong>License:</strong> {req.proposedData.licenseNumber}
                </p>
                <p className="text-emerald-950">
                  <strong>Warehouse:</strong> {req.proposedData.warehouseAddress}
                </p>
                <p className="text-emerald-950">
                  <strong>Bank A/C:</strong> {req.proposedData.bankAccountNumber} ({req.proposedData.ifscCode})
                </p>
              </div>
            </div>

            {/* Action Bar (if Pending) */}
            {req.status === 'pending' && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    setSelectedRequest(req);
                    setRejectionModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  leftIcon={<XCircle className="w-4 h-4 text-red-600" />}
                  className="text-red-700 hover:bg-red-50"
                >
                  Reject with Reason
                </Button>
                <Button
                  onClick={() => handleApprove(req)}
                  isLoading={reviewMutation.isPending}
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  Approve & Apply Changes Live
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Profile Change Request"
        description="Provide a clear compliance reason to the vendor explaining why this request cannot be approved."
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Rejection Reason & Compliance Instructions *
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setRejectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              isLoading={reviewMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

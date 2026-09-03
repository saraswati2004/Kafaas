import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVendorInventory, useInventoryMutations } from '../../hooks/useInventory';
import { VendorInventoryItem } from '../../types/inventory.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { 
  Boxes, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw,
  FileText
} from 'lucide-react';

export const VendorInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const { data: inventory = [], isLoading } = useVendorInventory(user?.id);
  const { adjustStock, isAdjustingStock } = useInventoryMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VendorInventoryItem | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustmentType: 'add' as 'add' | 'subtract' | 'set_exact',
    quantity: 50,
    batchNumber: 'BATCH-MP-2026-AUG',
    reason: 'Depot replenishment shipment received',
  });

  const filteredItems = inventory.filter((item) => {
    if (filterLowStockOnly && !item.isLowStock) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdjustment = (item: VendorInventoryItem) => {
    setSelectedItem(item);
    setAdjustmentForm({
      adjustmentType: 'add',
      quantity: 50,
      batchNumber: `BATCH-${item.sku.slice(0, 4)}-${Date.now().toString().slice(-4)}`,
      reason: 'Depot replenishment batch intake',
    });
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await adjustStock({
        productId: selectedItem.productId,
        adjustmentType: adjustmentForm.adjustmentType,
        quantity: Number(adjustmentForm.quantity),
        batchNumber: adjustmentForm.batchNumber,
        reason: adjustmentForm.reason,
      });
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Assigned Warehouse Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor allocated agrochemical batches and log inventory replenishments.
          </p>
        </div>
      </div>

      {/* Permission & Catalog Authority Notice */}
      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-start gap-3 text-xs text-blue-950">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold block text-sm mb-0.5">Catalog Governance Rule:</span>
          Vendors do not freely create global store products. All agricultural products, active ingredient formulations, and base prices are centrally curated by Admin. Vendors manage assigned stock units for fulfillment.
        </div>
      </div>

      {/* Controls Bar: Search & Low Stock Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by product name, SKU, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filterLowStockOnly}
            onChange={(e) => setFilterLowStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <span>Show Low Stock Items Only</span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Product & Brand</th>
                <th className="py-4 px-4">SKU / Pack</th>
                <th className="py-4 px-4 text-right">Available</th>
                <th className="py-4 px-4 text-right">Reserved</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-4">Last Updated</th>
                <th className="py-4 px-6 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.mainImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded-xl bg-slate-100 p-1 object-contain border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{item.productName}</span>
                        <span className="text-[11px] text-blue-700 font-semibold">{item.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-600">
                    {item.sku}
                    <span className="block text-[11px] text-slate-400 font-sans">{item.packSize}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-sm">
                    {item.availableStock}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500 font-medium">
                    {item.reservedStock}
                  </td>
                  <td className="py-4 px-4">
                    {item.isLowStock ? (
                      <Badge variant="yellow" size="sm" dot>
                        Low Stock (Threshold {item.lowStockThreshold})
                      </Badge>
                    ) : (
                      <Badge variant="green" size="sm" dot>
                        Healthy Stock
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">
                    {new Date(item.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      onClick={() => handleOpenAdjustment(item)}
                      variant="outline"
                      size="sm"
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Adjust Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Adjust Stock: ${selectedItem?.productName}`}
        description={`Current Available Quantity: ${selectedItem?.availableStock} units.`}
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Action Type</label>
              <select
                value={adjustmentForm.adjustmentType}
                onChange={(e) =>
                  setAdjustmentForm({ ...adjustmentForm, adjustmentType: e.target.value as any })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="add">Add Stock (Restock Intake)</option>
                <option value="subtract">Subtract Stock (Damaged/Return)</option>
                <option value="set_exact">Set Exact Verified Count</option>
              </select>
            </div>

            <Input
              label="Quantity *"
              type="number"
              value={adjustmentForm.quantity}
              onChange={(e) =>
                setAdjustmentForm({ ...adjustmentForm, quantity: Number(e.target.value) })
              }
              required
              min={1}
            />
          </div>

          <Input
            label="Manufacturer Batch / Depot Reference No *"
            value={adjustmentForm.batchNumber}
            onChange={(e) =>
              setAdjustmentForm({ ...adjustmentForm, batchNumber: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Adjustment Audit Reason *
            </label>
            <textarea
              rows={2}
              value={adjustmentForm.reason}
              onChange={(e) =>
                setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
              }
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setSelectedItem(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isAdjustingStock}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              Confirm Stock Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

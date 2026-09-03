import React, { useState } from 'react';
import { useAdminInventory, useInventoryTransactions } from '../../hooks/useInventory';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  Boxes, 
  Search, 
  History, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Package, 
  ShieldAlert, 
  Calendar 
} from 'lucide-react';
import { InventoryTransactionType } from '../../types/inventory.types';

export const AdminInventoryPage: React.FC = () => {
  const { data: inventory = [], isLoading: isLoadingInv } = useAdminInventory();
  const { data: transactions = [], isLoading: isLoadingTx } = useInventoryTransactions();

  const [activeTab, setActiveTab] = useState<'stock' | 'ledger'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxType, setSelectedTxType] = useState<string>('all');

  const filteredInventory = inventory.filter((item) => {
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

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedTxType !== 'all' && tx.type !== selectedTxType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.productName.toLowerCase().includes(q) ||
        tx.sku.toLowerCase().includes(q) ||
        tx.performedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const txTypeBadge = {
    restock: 'green',
    sale: 'blue',
    return: 'yellow',
    adjustment: 'purple',
    cancellation: 'red',
    reservation: 'gray',
    release: 'green',
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Central Inventory & Transaction Audit Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time multi-depot stock quantities, reserved unit locks, and immutable transaction records.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stock'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Warehouse Stock ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ledger'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transaction History ({transactions.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CENTRAL STOCK SUMMARY */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search stock by product, SKU, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredInventory.length} managed inventory lines
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Product & Brand</th>
                    <th className="py-4 px-4">Warehouse Location</th>
                    <th className="py-4 px-4 text-right">Available Stock</th>
                    <th className="py-4 px-4 text-right">Reserved (In-Flight)</th>
                    <th className="py-4 px-4 text-right">Total Physical Units</th>
                    <th className="py-4 px-6 text-right">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
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
                            <span className="text-[11px] text-purple-700 font-semibold font-mono">
                              {item.sku} • {item.packSize}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {item.warehouseLocation}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-sm">
                        {item.availableStock}
                      </td>
                      <td className="py-4 px-4 text-right text-amber-700 font-semibold">
                        {item.reservedStock}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900">
                        {item.totalStock}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {item.isLowStock ? (
                          <Badge variant="red" size="sm" dot>
                            Critical Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="green" size="sm" dot>
                            Optimum Level
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LEDGER TRANSACTIONS */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search transaction, SKU, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTxType}
                onChange={(e) => setSelectedTxType(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium"
              >
                <option value="all">All Transaction Types</option>
                <option value="restock">Restock</option>
                <option value="sale">Sale</option>
                <option value="return">Return</option>
                <option value="adjustment">Adjustment</option>
                <option value="reservation">Reservation</option>
                <option value="release">Release</option>
                <option value="cancellation">Cancellation</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Timestamp & Ref</th>
                    <th className="py-4 px-4">Product & SKU</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4 text-right">Quantity Delta</th>
                    <th className="py-4 px-4 text-right">Balance Stock</th>
                    <th className="py-4 px-4">Audit Reason</th>
                    <th className="py-4 px-6 text-right">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-slate-900 block">
                          {tx.referenceId || `#${tx.id.slice(-6)}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{tx.productName}</span>
                        <span className="text-[11px] font-mono text-slate-400">{tx.sku}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={txTypeBadge[tx.type]} size="sm">
                          {tx.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-sm">
                        {tx.quantityChange > 0 ? (
                          <span className="text-emerald-600 font-mono">+{tx.quantityChange}</span>
                        ) : (
                          <span className="text-slate-900 font-mono">{tx.quantityChange}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 font-mono">
                        {tx.newStock}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {tx.reason}
                      </td>
                      <td className="py-4 px-6 text-right text-xs">
                        <span className="font-bold text-slate-900 block">{tx.performedBy}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{tx.performedByRole}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ProductCategory, ProductFilterParams } from '../../types/product.types';
import { Filter, X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_CROPS } from '../../api/mockData';

export interface ProductFiltersProps {
  filters: ProductFilterParams;
  onFilterChange: (newFilters: ProductFilterParams) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
}) => {
  const categories = MOCK_CATEGORIES.map((c) => c.name);
  const forms = ['Liquid', 'Granules', 'Powder', 'Soluble Powder', 'Seeds Pack'];

  const handleCategorySelect = (category?: ProductCategory) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? undefined : category,
      page: 1,
    });
  };

  const handleCropSelect = (cropName?: string) => {
    onFilterChange({
      ...filters,
      targetCrop: filters.targetCrop === cropName ? undefined : cropName,
      page: 1,
    });
  };

  const handleFormSelect = (form?: string) => {
    onFilterChange({
      ...filters,
      form: filters.form === form ? undefined : form,
      page: 1,
    });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-slate-900 text-sm">Filter Products</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Category
        </h4>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Crop Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Target Crop
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_CROPS.map((crop) => {
            const isSelected = filters.targetCrop?.toLowerCase() === crop.name.toLowerCase();
            return (
              <button
                key={crop.id}
                onClick={() => handleCropSelect(crop.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {crop.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulation / Physical Form */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Formulation
        </h4>
        <div className="flex flex-col gap-1">
          {forms.map((f) => {
            const isSelected = filters.form === f;
            return (
              <button
                key={f}
                onClick={() => handleFormSelect(f)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{f}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={!!filters.organicOnly}
            onChange={(e) => onFilterChange({ ...filters, organicOnly: e.target.checked, page: 1 })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Organic Certified Only
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked, page: 1 })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <span>In-Stock Only</span>
        </label>
      </div>

      {/* Price Range Filters */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft h-fit sticky top-24">
        {filterContent}
      </aside>

      {/* Mobile Drawer Filters */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <span className="font-bold text-slate-900">Filters</span>
              <button
                onClick={onCloseMobile}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

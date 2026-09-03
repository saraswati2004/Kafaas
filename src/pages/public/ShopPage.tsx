import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductFilterParams, ProductCategory } from '../../types/product.types';
import { ProductGrid } from '../../components/shop/ProductGrid';
import { ProductFilters } from '../../components/shop/ProductFilters';
import { Pagination } from '../../components/common/Pagination';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sprout } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Parse filters from URL
  const [filters, setFilters] = useState<ProductFilterParams>({
    category: (searchParams.get('category') as ProductCategory) || undefined,
    search: searchParams.get('search') || undefined,
    targetCrop: searchParams.get('crop') || undefined,
    form: searchParams.get('form') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    organicOnly: searchParams.get('organic') === 'true',
    inStockOnly: searchParams.get('inStock') === 'true',
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
  });

  // Sync state when URL params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: (searchParams.get('category') as ProductCategory) || undefined,
      search: searchParams.get('search') || undefined,
      targetCrop: searchParams.get('crop') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    }));
  }, [searchParams]);

  const { data: productResponse, isLoading, isError } = useProducts(filters);

  const handleFilterChange = (newFilters: ProductFilterParams) => {
    setFilters(newFilters);

    // Update URL query params
    const nextParams: Record<string, string> = {};
    if (newFilters.category) nextParams.category = newFilters.category;
    if (newFilters.search) nextParams.search = newFilters.search;
    if (newFilters.targetCrop) nextParams.crop = newFilters.targetCrop;
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') nextParams.sortBy = newFilters.sortBy;
    if (newFilters.page && newFilters.page > 1) nextParams.page = String(newFilters.page);
    if (newFilters.organicOnly) nextParams.organic = 'true';
    if (newFilters.inStockOnly) nextParams.inStock = 'true';

    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const defaultFilters: ProductFilterParams = {
      page: 1,
      limit: 12,
      sortBy: 'newest',
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Agricultural Store Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse genuine fertilizers, fungicides, insecticides, certified seeds, and bio-stimulants.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by product, brand, chemical..."
            value={filters.search || ''}
            onChange={(e) =>
              handleFilterChange({
                ...filters,
                search: e.target.value || undefined,
                page: 1,
              })
            }
            className="w-full bg-white text-slate-900 pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {filters.search && (
            <button
              onClick={() => handleFilterChange({ ...filters, search: undefined, page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Mobile Filter Button, Result Count, Sort By */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <span className="text-xs sm:text-sm text-slate-600 font-medium">
            Showing <strong>{productResponse?.items?.length || 0}</strong> of{' '}
            <strong>{productResponse?.total || 0}</strong> products
          </span>
        </div>

        {/* Active Filter Chips */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Sort by:</span>
          </div>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) =>
              handleFilterChange({
                ...filters,
                sortBy: e.target.value as any,
                page: 1,
              })
            }
            className="text-xs bg-slate-50 text-slate-800 font-semibold border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(filters.category || filters.targetCrop || filters.search || filters.organicOnly || filters.inStockOnly) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Active filters:</span>
          {filters.category && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">
              Category: {filters.category}
              <button onClick={() => handleFilterChange({ ...filters, category: undefined })}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.targetCrop && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">
              Crop: {filters.targetCrop}
              <button onClick={() => handleFilterChange({ ...filters, targetCrop: undefined })}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.organicOnly && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">
              Organic Only
              <button onClick={() => handleFilterChange({ ...filters, organicOnly: false })}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-red-600 hover:underline font-semibold ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Layout Grid: Sidebar Filters + Main Product Grid */}
      <div className="flex items-start gap-8">
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={productResponse?.items}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination */}
          {productResponse && productResponse.totalPages > 1 && (
            <Pagination
              currentPage={productResponse.page}
              totalPages={productResponse.totalPages}
              onPageChange={(page) => handleFilterChange({ ...filters, page })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

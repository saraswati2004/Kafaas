import React from 'react';
import { Product } from '../../types/product.types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Sprout } from 'lucide-react';

export interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products = [],
  isLoading = false,
  emptyTitle = 'No Products Found',
  emptyDescription = 'Try adjusting your search criteria, category, or crop filters.',
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Sprout className="w-8 h-8 text-emerald-600" />}
        title={emptyTitle}
        description={emptyDescription}
        actionText={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

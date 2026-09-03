import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('animate-pulse bg-slate-200 rounded-lg', className)} />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft space-y-3">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-2/3 h-4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

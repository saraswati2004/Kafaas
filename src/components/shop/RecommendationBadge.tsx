import React from 'react';
import { Stethoscope } from 'lucide-react';
import { clsx } from 'clsx';

export interface RecommendationBadgeProps {
  diseaseName?: string;
  diseaseCount?: number;
  className?: string;
  variant?: 'inline' | 'compact' | 'full';
}

export const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({
  diseaseName = 'Crop Disease Remedy',
  diseaseCount,
  className,
  variant = 'inline',
}) => {
  if (variant === 'compact') {
    return (
      <span
        title={`Recommended for ${diseaseName}`}
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs',
          className
        )}
      >
        <Stethoscope className="w-3 h-3" />
        <span>Advisory Fit</span>
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs',
          className
        )}
      >
        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Stethoscope className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold block text-amber-950">Disease Recommendation Fit</span>
          <span className="text-amber-800">
            Recommended remedy for <strong>{diseaseName}</strong>
            {diseaseCount && diseaseCount > 1 ? ` + ${diseaseCount - 1} more conditions` : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100/90 text-amber-900 border border-amber-200/80',
        className
      )}
    >
      <Stethoscope className="w-3.5 h-3.5 text-amber-700 shrink-0" />
      <span className="truncate max-w-[160px]">Rec. for {diseaseName}</span>
    </span>
  );
};

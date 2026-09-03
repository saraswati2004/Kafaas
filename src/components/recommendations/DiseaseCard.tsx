import React from 'react';
import { CropDisease, AffectedPart } from '../../types/recommendation.types';
import { Badge } from '../common/Badge';
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface DiseaseCardProps {
  disease: CropDisease;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DiseaseCard: React.FC<DiseaseCardProps> = ({
  disease,
  isSelected = false,
  onSelect,
}) => {
  const severityVariant = {
    Mild: 'green',
    Moderate: 'blue',
    Severe: 'yellow',
    Critical: 'red',
  } as const;

  const affectedParts: AffectedPart[] = Array.isArray(disease.affectedParts)
    ? disease.affectedParts
    : [];

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'group cursor-pointer rounded-2xl border p-5 transition-all duration-200 bg-white flex flex-col justify-between shadow-soft',
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-soft-lg'
          : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-soft-lg'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                {disease.name}
              </h3>
              <Badge variant={severityVariant[disease.severity]} size="sm" dot>
                {disease.severity}
              </Badge>
            </div>
            {disease.hindiName && (
              <p className="text-xs text-emerald-800 font-medium">{disease.hindiName}</p>
            )}
            {disease.scientificName && (
              <p className="text-[11px] text-slate-400 italic">{disease.scientificName}</p>
            )}
          </div>

          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            <img
              src={disease.imageUrl}
              alt={disease.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Affected Parts */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Affects:</span>
          {affectedParts.map((part) => (
            <span
              key={part}
              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
            >
              {part}
            </span>
          ))}
        </div>

        {/* Key Symptoms Bullet points */}
        <div className="space-y-1.5 mb-4">
          <span className="text-xs font-semibold text-slate-700 block">Primary Symptoms:</span>
          {disease.symptoms.slice(0, 2).map((symptom, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 leading-snug">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{symptom}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
          <span>{isSelected ? 'Viewing Remedies' : 'View Recommended Remedies'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
        {isSelected && (
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
};

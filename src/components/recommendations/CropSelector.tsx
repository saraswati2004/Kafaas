import React from 'react';
import { Crop } from '../../types/recommendation.types';
import { clsx } from 'clsx';

export interface CropSelectorProps {
  crops: Crop[];
  selectedCropId?: string;
  onSelectCrop: (crop: Crop) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  crops,
  selectedCropId,
  onSelectCrop,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
      {crops.map((crop) => {
        const isSelected = selectedCropId === crop.id;
        return (
          <button
            key={crop.id}
            type="button"
            onClick={() => onSelectCrop(crop)}
            className={clsx(
              'group flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-200 focus:outline-none',
              isSelected
                ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/30'
                : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-soft'
            )}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2.5 bg-slate-100 p-0.5 border border-slate-200 group-hover:scale-105 transition-transform">
              <img
                src={crop.imageUrl}
                alt={crop.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span
              className={clsx(
                'text-xs font-bold block truncate w-full',
                isSelected ? 'text-emerald-900' : 'text-slate-800'
              )}
            >
              {crop.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {crop.commonDiseasesCount} Advisories
            </span>
          </button>
        );
      })}
    </div>
  );
};

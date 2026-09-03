import React, { useState } from 'react';
import { useCrops, useDiseases, useRecommendationLookup } from '../../hooks/useRecommendations';
import { CropSelector } from '../../components/recommendations/CropSelector';
import { DiseaseCard } from '../../components/recommendations/DiseaseCard';
import { RecommendedProductList } from '../../components/recommendations/RecommendedProductList';
import { EmptyState } from '../../components/common/EmptyState';
import { Stethoscope, Sprout, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { Crop, CropDisease } from '../../types/recommendation.types';

export const RecommendationsPage: React.FC = () => {
  const { data: crops = [], isLoading: isLoadingCrops } = useCrops();

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<CropDisease | null>(null);

  // Set initial default crop when crops load
  React.useEffect(() => {
    if (crops.length > 0 && !selectedCrop) {
      setSelectedCrop(crops[0]); // Tomato default
    }
  }, [crops, selectedCrop]);

  const { data: diseases = [], isLoading: isLoadingDiseases } = useDiseases(selectedCrop?.id);

  // Set initial default disease when diseases load for crop
  React.useEffect(() => {
    if (diseases.length > 0) {
      setSelectedDisease(diseases[0]);
    } else {
      setSelectedDisease(null);
    }
  }, [diseases]);

  const {
    data: activeRecommendation,
    isLoading: isLoadingRec,
  } = useRecommendationLookup(selectedCrop?.id, selectedDisease?.id);

  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop);
  };

  const handleDiseaseSelect = (disease: CropDisease) => {
    setSelectedDisease(disease);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Disease-to-Product Recommendation Matrix</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans']">
            Find Targeted Solutions for Your Standing Crops
          </h1>

          <p className="text-emerald-100 text-sm leading-relaxed">
            Select your crop and identify symptoms. Our agronomist-validated matrix provides exact curative chemicals, bio-stimulants, and recovery schedules to safeguard your harvest.
          </p>
        </div>
      </div>

      {/* 1. SELECT CROP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Select Your Standing Crop
            </h2>
          </div>
          {selectedCrop && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Active: {selectedCrop.name}
            </span>
          )}
        </div>

        <CropSelector
          crops={crops}
          selectedCropId={selectedCrop?.id}
          onSelectCrop={handleCropSelect}
        />
      </section>

      {/* 2. SELECT IDENTIFIED DISEASE / ISSUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Identified Issue / Disease for {selectedCrop?.name || 'Selected Crop'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {diseases.length} condition{diseases.length !== 1 ? 's' : ''} mapped
          </span>
        </div>

        {diseases.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            No disease entries cataloged for this crop yet. Select Tomato, Cotton, Rice, or Chilli to see verified recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {diseases.map((disease) => (
              <DiseaseCard
                key={disease.id}
                disease={disease}
                isSelected={selectedDisease?.id === disease.id}
                onSelect={() => handleDiseaseSelect(disease)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. PRESCRIBED RECOMMENDED REMEDIES & PRODUCT COMBO */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Curated Remedy & Chemical Recommendation Kit
          </h2>
        </div>

        {isLoadingRec ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Retrieving agronomist-verified product recommendations...
            </p>
          </div>
        ) : activeRecommendation ? (
          <RecommendedProductList recommendation={activeRecommendation} />
        ) : (
          <EmptyState
            icon={<Stethoscope className="w-8 h-8 text-emerald-600" />}
            title="Recommendation Under Validation"
            description="Our agronomists are currently verifying the optimal fungicide and bio-stimulant combo for this condition. Please check back shortly or explore other crop conditions."
          />
        )}
      </section>
    </div>
  );
};

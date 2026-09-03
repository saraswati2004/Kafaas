import React from 'react';
import { Link } from 'react-router-dom';
import { useRecommendations } from '../../hooks/useRecommendations';
import { RecommendedProductList } from '../../components/recommendations/RecommendedProductList';
import { Stethoscope, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const FarmerRecommendationsPage: React.FC = () => {
  const { data: recommendations = [], isLoading } = useRecommendations();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            My Crop Advisory Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active crop remedy kits and agronomist-verified dosage recommendations for your standing crops.
          </p>
        </div>

        <Link to="/recommendations">
          <Button variant="primary" size="sm" leftIcon={<Stethoscope className="w-4 h-4" />}>
            Diagnose New Issue
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="space-y-8">
          {recommendations.map((rec) => (
            <RecommendedProductList key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFarmerScanHistory } from '../../hooks/useRecommendations';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { History, Stethoscope, ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';

export const ScanHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { data: scanHistory = [], isLoading } = useFarmerScanHistory(user?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Crop Disease Diagnosis Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log of previously identified crop pathologies, confidence ratings, and linked input kits.
          </p>
        </div>

        <Link to="/recommendations">
          <Button variant="primary" size="sm" leftIcon={<Stethoscope className="w-4 h-4" />}>
            Run Disease Advisory
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scanHistory.map((scan) => (
            <div
              key={scan.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {scan.cropName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">#{scan.scanCode}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{scan.diseaseDetected}</h3>
                  </div>

                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={scan.imageUrl}
                      alt={scan.cropName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(scan.scanDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {scan.plotName}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950">AI Confidence Score</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {scan.confidenceScore}% Validated
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Badge variant={scan.status === 'Resolved' ? 'green' : 'yellow'} size="sm" dot>
                  {scan.status}
                </Badge>
                <Link
                  to="/recommendations"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Re-Order Prescription Kit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useRecommendations, useCrops, useDiseases, useRecommendationMutations } from '../../hooks/useRecommendations';
import { useProducts } from '../../hooks/useProducts';
import { DiseaseRecommendation, RecommendedProductItem } from '../../types/recommendation.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { 
  Stethoscope, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Layers
} from 'lucide-react';

export const AdminRecommendationsPage: React.FC = () => {
  const { data: recommendations = [], isLoading } = useRecommendations();
  const { data: crops = [] } = useCrops();
  const { data: allProductsResp } = useProducts({ limit: 50 });
  const allProducts = allProductsResp?.items || [];
  const { updateRecommendationMatrix, isUpdatingMatrix } = useRecommendationMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<DiseaseRecommendation | null>(null);

  // Form State
  const [form, setForm] = useState({
    cropName: 'Tomato',
    diseaseName: 'Early Blight',
    diseaseSeverity: 'Severe' as any,
    advisoryNote: '',
    selectedProducts: [] as RecommendedProductItem[],
  });

  const handleOpenEdit = (rec: DiseaseRecommendation) => {
    setEditingRec(rec);
    setForm({
      cropName: rec.cropName,
      diseaseName: rec.diseaseName,
      diseaseSeverity: rec.diseaseSeverity,
      advisoryNote: rec.advisoryNote,
      selectedProducts: [...rec.recommendedProducts],
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (rec: DiseaseRecommendation) => {
    updateRecommendationMatrix({
      id: rec.id,
      updates: { isActive: !rec.isActive },
    });
  };

  const handleAddProductToMatrix = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    const newItem: RecommendedProductItem = {
      productId: product.id,
      product,
      category: product.category,
      role: 'Primary Treatment',
      priority: form.selectedProducts.length + 1,
      reason: `High efficacy active formulation for ${form.diseaseName} control.`,
      applicationSchedule: 'Spray 1.5ml/L clean water early morning.',
      isActive: true,
    };

    setForm({
      ...form,
      selectedProducts: [...form.selectedProducts, newItem],
    });
  };

  const handleRemoveProductFromMatrix = (index: number) => {
    const updated = form.selectedProducts.filter((_, idx) => idx !== index);
    setForm({ ...form, selectedProducts: updated });
  };

  const handleSaveMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRec) return;

    await updateRecommendationMatrix({
      id: editingRec.id,
      updates: {
        advisoryNote: form.advisoryNote,
        diseaseSeverity: form.diseaseSeverity,
        recommendedProducts: form.selectedProducts,
      },
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Disease-to-Product Recommendation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure scientifically validated remedy linkages between Crop Conditions and Agrochemical Kits.
          </p>
        </div>
      </div>

      {/* Advisory Matrix Cards */}
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`bg-white rounded-3xl border p-6 shadow-soft space-y-6 transition-all ${
              rec.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {rec.cropName}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{rec.diseaseName}</h2>
                  <Badge variant={rec.diseaseSeverity === 'Critical' ? 'red' : 'yellow'} size="sm">
                    {rec.diseaseSeverity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{rec.advisoryNote}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(rec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    rec.isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {rec.isActive ? 'Active in Portal' : 'Draft / Disabled'}
                </button>
                <Button
                  onClick={() => handleOpenEdit(rec)}
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Matrix
                </Button>
              </div>
            </div>

            {/* Prescribed Products Linkage Table */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Linked Product Prescriptions ({rec.recommendedProducts.length}):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rec.recommendedProducts.map((rp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="purple" size="sm">
                        {rp.role}
                      </Badge>
                      <span className="font-bold text-slate-400">Priority #{rp.priority}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {rp.product?.name || rp.productId}
                    </h4>

                    <p className="text-slate-600 leading-snug">{rp.reason}</p>

                    <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-purple-900">
                      {rp.applicationSchedule}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Recommendation Matrix Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Advisory: ${editingRec?.cropName} - ${editingRec?.diseaseName}`}
        description="Update scientific note, add/remove curative products, and set priority order."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveMatrix} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Agronomist Advisory Summary Note *
            </label>
            <textarea
              rows={3}
              value={form.advisoryNote}
              onChange={(e) => setForm({ ...form, advisoryNote: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Add Products Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Attach Additional Product to Matrix
            </label>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) handleAddProductToMatrix(e.target.value);
                  e.target.value = '';
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              >
                <option value="">Select an active agrochemical to attach...</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand} - {p.category}) - ₹{p.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Products in Modal */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-700 block">Current Attached Items:</span>
            {form.selectedProducts.map((p, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{p.product?.name || p.productId}</span>
                  <span className="text-slate-500">{p.role} • Priority #{p.priority}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProductFromMatrix(idx)}
                  className="text-red-600 hover:text-red-800 p-1 font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingMatrix}
              className="bg-purple-600 hover:bg-purple-700 font-bold"
            >
              Save Advisory Matrix
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

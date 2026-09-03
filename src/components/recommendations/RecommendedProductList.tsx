import React from 'react';
import { DiseaseRecommendation } from '../../types/recommendation.types';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ShoppingCart, Check, ShieldCheck, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export interface RecommendedProductListProps {
  recommendation: DiseaseRecommendation;
}

export const RecommendedProductList: React.FC<RecommendedProductListProps> = ({
  recommendation,
}) => {
  const { addToCart, addMultipleToCart } = useCart();

  const roleColors = {
    'Primary Treatment': 'red',
    'Bio-Stimulant / Recovery': 'green',
    'Preventive Foliar': 'blue',
    'Soil Enhancer': 'earth',
  } as const;

  // Calculate kit total
  const kitItems = recommendation.recommendedProducts
    .filter((rp) => rp.product && rp.product.inStock)
    .map((rp) => ({
      productId: rp.productId,
      productName: rp.product!.name,
      quantity: 1,
    }));

  const kitPriceTotal = recommendation.recommendedProducts.reduce(
    (total, rp) => total + (rp.product?.price || 0),
    0
  );

  const handleAddKit = () => {
    if (kitItems.length > 0) {
      addMultipleToCart(kitItems);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg p-6 sm:p-8 space-y-6">
      {/* Advisory Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700/80 text-emerald-100 uppercase tracking-wider">
                Integrated Crop Management (ICM)
              </span>
              <span className="text-emerald-300">•</span>
              <span className="text-xs text-emerald-200">
                Target: <strong>{recommendation.cropName}</strong>
              </span>
            </div>
            <Badge variant="red" size="sm">
              {recommendation.diseaseSeverity} Advisory
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-2">
            Prescribed Treatment for {recommendation.diseaseName}
          </h2>

          <p className="text-emerald-100/90 text-sm leading-relaxed max-w-3xl mb-4">
            {recommendation.advisoryNote}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-emerald-700/60">
            <div>
              <span className="text-xs text-emerald-200 block">Complete Curative Package Total</span>
              <span className="text-2xl font-extrabold text-white">
                ₹{kitPriceTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <Button
              onClick={handleAddKit}
              variant="secondary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-emerald-700" />}
              className="bg-white text-emerald-900 hover:bg-emerald-50 border-0 shadow-md font-bold"
            >
              Add Full Treatment Kit to Cart ({kitItems.length} Products)
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Recommended Products Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Recommended Product Combination ({recommendation.recommendedProducts.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendation.recommendedProducts.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item.productId}
                className="flex flex-col justify-between bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 hover:bg-white hover:border-emerald-300 hover:shadow-soft transition-all duration-200"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={roleColors[item.role]} size="sm">
                      {item.role}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Priority #{item.priority}
                    </span>
                  </div>

                  {/* Product Image & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 block">
                        {product.brand}
                      </span>
                      <Link
                        to={`/products/${product.id}`}
                        className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </div>

                  {/* Why it is Recommended */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/70 mb-3 space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                        Why Recommended
                      </span>
                      <p className="text-xs text-slate-700 leading-snug">{item.reason}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Dosage & Schedule
                      </span>
                      <p className="text-xs font-mono text-emerald-950 font-medium">{item.applicationSchedule}</p>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{product.packSize}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/products/${product.id}`}
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Button
                      onClick={() => addToCart(product.id, product.name, 1)}
                      size="sm"
                      variant="primary"
                      leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product.types';
import { useCart } from '../../hooks/useCart';
import { ShoppingCart, Star, Leaf, Check, ShieldCheck } from 'lucide-react';
import { RecommendationBadge } from './RecommendationBadge';
import { Badge } from '../common/Badge';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const isRecommended = product.recommendedForDiseases && product.recommendedForDiseases.length > 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-emerald-300/80 transition-all duration-200 overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 p-4">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {product.discountPercentage > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-red-600 text-white shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isOrganic && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-700 text-white flex items-center gap-1 shadow-xs">
              <Leaf className="w-3 h-3" />
              <span>Organic</span>
            </span>
          )}
        </div>

        {/* Stock status watermark if out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        {/* Brand and Category */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-semibold text-emerald-700 tracking-wide">{product.brand}</span>
          <span className="text-slate-400 font-medium">{product.packSize}</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product.id}`}
          className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-emerald-700 transition-colors mb-2"
        >
          {product.name}
        </Link>

        {/* Disease Recommendation Tag */}
        {isRecommended && (
          <div className="mb-2.5">
            <RecommendationBadge
              variant="inline"
              diseaseName={product.specifications.targetPestsAndDiseases[0] || 'Crop Blight'}
            />
          </div>
        )}

        {/* Technical Name */}
        <p className="text-xs text-slate-500 line-clamp-1 italic mb-3 font-mono">
          {product.specifications.technicalName}
        </p>

        {/* Ratings & Stock Status */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <div className="flex items-center text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-current mr-1" />
            <span>{product.rating}</span>
          </div>
          <span className="text-slate-400 font-normal">({product.reviewCount})</span>
          <span className="text-slate-300">•</span>
          {product.inStock ? (
            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
              <Check className="w-3.5 h-3.5" />
              In Stock
            </span>
          ) : (
            <span className="text-red-500 font-medium">Sold Out</span>
          )}
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block">incl. all taxes</span>
          </div>

          <button
            onClick={() => addToCart(product.id, product.name, 1)}
            disabled={!product.inStock}
            className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white shadow-xs hover:shadow transition-all active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

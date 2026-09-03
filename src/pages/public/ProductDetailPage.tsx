import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { RecommendationBadge } from '../../components/shop/RecommendationBadge';
import { ProductGrid } from '../../components/shop/ProductGrid';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  Star, 
  Plus, 
  Minus, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Info,
  Clock
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: relatedProducts = [] } = useRelatedProducts(id);
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'benefits' | 'usage' | 'safety'>('specs');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-slate-200 h-96 rounded-3xl" />
          <div className="space-y-4">
            <div className="bg-slate-200 h-6 w-1/4 rounded-lg" />
            <div className="bg-slate-200 h-10 w-3/4 rounded-lg" />
            <div className="bg-slate-200 h-8 w-1/3 rounded-lg" />
            <div className="bg-slate-200 h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">
          The agricultural product you requested does not exist or may have been discontinued.
        </p>
        <Link to="/shop">
          <Button variant="primary">Return to Shop Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product.id, product.name, quantity);
    navigate('/cart');
  };

  const images = product.images.length > 0 ? product.images : [product.mainImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/shop" className="hover:text-emerald-700 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Shop Catalog</span>
        </Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-emerald-700">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Layout: Gallery + Purchasing Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Visual Display */}
          <div className="relative aspect-square bg-slate-100 rounded-3xl border border-slate-200/80 p-8 flex items-center justify-center overflow-hidden shadow-soft">
            <img
              src={images[selectedImageIndex] || product.mainImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {product.discountPercentage > 0 && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-red-600 text-white shadow">
                  {product.discountPercentage}% DISCOUNT
                </span>
              )}
              {product.isOrganic && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-700 text-white flex items-center gap-1 shadow">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>100% Bio-Organic</span>
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex items-center gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl bg-slate-100 p-2 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand, Category & Pack */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                {product.brand}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Pack Size: <strong>{product.packSize}</strong> ({product.form})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm font-mono text-slate-500 mt-1">
              Composition: {product.specifications.technicalName}
            </p>
          </div>

          {/* Disease Recommendation Alert Banner */}
          {product.recommendedForDiseases && product.recommendedForDiseases.length > 0 && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-bold text-amber-950 block text-sm">
                  Recommended Crop Disease Prescription
                </span>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Scientifically proven curative remedy for <strong>{product.specifications.targetPestsAndDiseases.join(', ')}</strong> on crops like <em>{product.specifications.targetCrops.join(', ')}</em>.
                </p>
                <Link
                  to="/recommendations"
                  className="inline-block mt-2 font-bold text-amber-950 hover:underline"
                >
                  View full advisory protocol & combo kit →
                </Link>
              </div>
            </div>
          )}

          {/* Pricing & Stock Section */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal ml-1">({product.reviewCount} reviews)</span>
              </div>
              <span>•</span>
              {product.inStock ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="text-red-600 font-bold">Currently Out of Stock</span>
              )}
            </div>

            {/* Quantity Manager */}
            {product.inStock && (
              <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CTAs: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => addToCart(product.id, product.name, quantity)}
                disabled={!product.inStock}
                variant="primary"
                size="lg"
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                className="w-full font-bold shadow-md"
              >
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                variant="secondary"
                size="lg"
                leftIcon={<Zap className="w-5 h-5 text-emerald-800" />}
                className="w-full font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 border-0 shadow-md"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Certified Batch</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe Agrochemical Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Information Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'specs', label: 'Technical Specifications', icon: FileText },
            { id: 'benefits', label: 'Key Benefits', icon: CheckCircle2 },
            { id: 'usage', label: 'Dosage & Instructions', icon: Clock },
            { id: 'safety', label: 'Safety & Toxicity', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Specs */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Technical Name</span>
                <span className="font-bold text-slate-900 text-right">{product.specifications.technicalName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Formulation</span>
                <span className="font-bold text-slate-900 text-right">{product.specifications.formulation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Target Crops</span>
                <span className="font-bold text-slate-900 text-right">{product.specifications.targetCrops.join(', ')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Target Pests & Diseases</span>
                <span className="font-bold text-slate-900 text-right">{product.specifications.targetPestsAndDiseases.join(', ')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Dosage per Acre</span>
                <span className="font-bold text-emerald-800 text-right">{product.specifications.dosagePerAcre}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Dosage per Litre</span>
                <span className="font-bold text-emerald-800 text-right">{product.specifications.dosagePerLiter}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Waiting / Withholding Period</span>
                <span className="font-bold text-slate-900 text-right">{product.specifications.waitingPeriodDays} Days</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Manufacturer</span>
                <span className="font-bold text-slate-900 text-right">{product.specifications.manufacturer}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Benefits */}
        {activeTab === 'benefits' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Usage Instructions */}
        {activeTab === 'usage' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Step-by-Step Application Guide:</h4>
            <div className="space-y-2">
              {product.usageInstructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Safety & Toxicity */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">Toxicity Classification: {product.specifications.toxicityClass}</span>
                <span>Follow standard pesticide safety gear and withholding periods before harvesting.</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {product.safetyPrecautions.map((safe, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{safe}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Related & Complementary Products
          </h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
};

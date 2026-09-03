import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';
import { OrderSummaryCard } from '../../components/orders/OrderSummaryCard';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  Loader2
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Side effect to verify component renders
  if (typeof window !== 'undefined') {
    (window as any).__CARTPAGE_RENDERED__ = true;
    document.title = 'Cart Page Rendered';
  }
  
  const { 
    items, 
    itemCount, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    calculation, 
    isLoadingCalculation 
  } = useCart();
  const { isAuthenticated } = useAuthStore();

  console.log('[CartPage] items:', items, 'itemCount:', itemCount);
  document.title = `Cart Page - items: ${items?.length || 0}, itemCount: ${itemCount}`;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-emerald-600" />}
          title="Your Shopping Basket is Empty"
          description="Explore our catalog of certified fertilizers, fungicides, insecticides, and crop disease remedies."
          actionText="Browse Agri Catalog"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          Your Farm Basket ({itemCount}{" "}
          {itemCount === 1 ? "item" : "items"})
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your selected inputs. Authoritative prices and agricultural
          subsidies calculated below.
        </p>
      </div>

      <button
        onClick={clearCart}
        className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline self-start sm:self-auto"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Clear Basket</span>
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-4">
        {isLoadingCalculation ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />

            <p className="text-sm font-semibold text-slate-700">
              Verifying live warehouse stock and authoritative prices...
            </p>
          </div>
        ) : (
          (calculation?.itemDetails ?? []).map((detail) => {
            const product = detail.product;
            const hasStockIssue = !detail.isStockAvailable;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  hasStockIssue
                    ? "border-red-300 bg-red-50/20"
                    : "border-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 p-2 border border-slate-200 shrink-0 flex items-center justify-center">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                      {product.brand}
                    </span>

                    <Link
                      to={`/products/${product.id}`}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors block line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <span className="text-xs text-slate-400 block font-mono">
                      Pack: {product.packSize} • {product.form}
                    </span>

                    {detail.stockWarning && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-red-600 pt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{detail.stockWarning}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() =>
                        updateQuantity(product.id, detail.quantity - 1)
                      }
                      className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {detail.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(product.id, detail.quantity + 1)
                      }
                      className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors"
                      disabled={detail.quantity >= detail.availableStock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <span className="text-base font-extrabold text-slate-900 block">
                      ₹{detail.itemTotal.toLocaleString("en-IN")}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      (₹{detail.unitPrice} each)
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(product.id, product.name)
                    }
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    title="Remove product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping Products</span>
          </Link>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4 sticky top-24">
        {calculation && (
          <OrderSummaryCard
            pricing={calculation.pricing}
            itemCount={itemCount}
            appliedDiscounts={calculation.appliedDiscounts}
          />
        )}

        <Button
          onClick={handleCheckout}
          disabled={!calculation?.isValid || isLoadingCalculation}
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-bold shadow-lg text-base py-4"
        >
          {isAuthenticated
            ? "Proceed to Multi-Step Checkout"
            : "Login / Register to Checkout"}
        </Button>

        {!isAuthenticated && (
          <p className="text-[11px] text-center text-slate-500">
            * Agricultural regulations require farmer registration for seed &
            chemical subsidy processing.
          </p>
        )}
      </div>
    </div>
  </div>
);
};
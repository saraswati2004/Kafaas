import React from 'react';
import { OrderPricing } from '../../types/order.types';
import { ShieldCheck, Tag, Sparkles } from 'lucide-react';

export interface OrderSummaryCardProps {
  pricing: OrderPricing;
  itemCount: number;
  appliedDiscounts?: string[];
  showSecurityBadge?: boolean;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  pricing,
  itemCount,
  appliedDiscounts = [],
  showSecurityBadge = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-5 sm:p-6 space-y-4">
      <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
        Order Price Breakdown
      </h3>

      <div className="space-y-2.5 text-sm">
        {/* Items Subtotal */}
        <div className="flex justify-between text-slate-600">
          <span>Items Subtotal ({itemCount} items)</span>
          <span className="font-semibold text-slate-900">
            ₹{pricing.subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Bulk discount */}
        {pricing.discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Direct Savings / Volume Discount
            </span>
            <span>- ₹{pricing.discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Farmer Subsidy Discount */}
        {pricing.farmerSubsidyDiscount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Kisan Krishi Subsidy
            </span>
            <span>- ₹{pricing.farmerSubsidyDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Delivery Fee */}
        <div className="flex justify-between text-slate-600">
          <span>Rural Farm Delivery</span>
          <span>
            {pricing.deliveryCharge === 0 ? (
              <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
            ) : (
              `₹${pricing.deliveryCharge}`
            )}
          </span>
        </div>

        {/* GST / Tax */}
        <div className="flex justify-between text-slate-500 text-xs">
          <span>Estimated Agrochemical GST (5%)</span>
          <span>₹{pricing.taxGst.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Applied Discount Badges */}
      {appliedDiscounts.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-2.5 space-y-1">
          {appliedDiscounts.map((disc, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{disc} applied</span>
            </div>
          ))}
        </div>
      )}

      {/* Total Amount */}
      <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
        <div>
          <span className="text-sm font-bold text-slate-900 block">Total Authoritative Payable</span>
          <span className="text-[10px] text-slate-400">Inclusive of all government taxes</span>
        </div>
        <span className="text-2xl font-extrabold text-emerald-800">
          ₹{pricing.totalAmount.toLocaleString('en-IN')}
        </span>
      </div>

      {showSecurityBadge && (
        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Secure Checkout & Genuine Seed Guarantee</span>
        </div>
      )}
    </div>
  );
};

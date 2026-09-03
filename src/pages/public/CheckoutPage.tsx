import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCart } from '../../hooks/useCart';
import { useOrderMutations } from '../../hooks/useOrders';
import { OrderSummaryCard } from '../../components/orders/OrderSummaryCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PaymentMethod } from '../../types/order.types';
import { 
  Check, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  QrCode, 
  Banknote, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Truck,
  Sparkles
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addAddress } = useAuthStore();
  const { items, itemCount, calculation, isLoadingCalculation } = useCart();
  const { createOrder, isCreatingOrder } = useOrderMutations();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses.find((a) => a.isDefault)?.id || user?.addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // New Address Form State
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(user?.addresses.length === 0);
  const [newAddressForm, setNewAddressForm] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    villageOrCity: '',
    district: '',
    state: 'Madhya Pradesh',
    pincode: '',
    isDefault: true,
    addressType: 'farm' as const,
  });

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.name || !newAddressForm.addressLine1 || !newAddressForm.pincode) return;
    addAddress(newAddressForm);
    setIsAddingNewAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!calculation || items.length === 0) return;

    try {
      await createOrder({
        shippingAddressId: selectedAddressId || user?.addresses[0]?.id,
        paymentMethod,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        notes: orderNotes,
      });
    } catch (err) {
      console.error('Order creation error', err);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-2 text-center relative">
          {/* Step 1 */}
          <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              currentStep > 1
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : currentStep === 1
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100'
                : 'border-slate-300 bg-white text-slate-400'
            }`}>
              {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-xs">1. Delivery Address</span>
          </div>

          {/* Step 2 */}
          <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              currentStep > 2
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : currentStep === 2
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100'
                : 'border-slate-300 bg-white text-slate-400'
            }`}>
              {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-xs">2. Order Summary</span>
          </div>

          {/* Step 3 */}
          <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              currentStep === 3
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100'
                : 'border-slate-300 bg-white text-slate-400'
            }`}>
              3
            </div>
            <span className="text-xs">3. Payment & Confirm</span>
          </div>
        </div>
      </div>

      {/* Main Checkout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Step Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">Select Farm Delivery Address</h2>
                </div>
                {!isAddingNewAddress && user?.addresses && user.addresses.length > 0 && (
                  <button
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Existing Addresses */}
              {!isAddingNewAddress && user?.addresses && user.addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/30 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm text-slate-900">{addr.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {addr.addressType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          {addr.addressLine1}, {addr.villageOrCity}, {addr.district}, {addr.state} - {addr.pincode}
                        </p>
                        <span className="text-xs text-slate-500 font-medium block">
                          Phone: {addr.phone}
                        </span>

                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Address Form */}
              {isAddingNewAddress && (
                <form onSubmit={handleAddNewAddressSubmit} className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900">New Farm / Delivery Address Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Receiver / Farmer Full Name *"
                      value={newAddressForm.name}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Contact Mobile Number *"
                      value={newAddressForm.phone}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Farm Survey No / Street Address *"
                    value={newAddressForm.addressLine1}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine1: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Village / Tehsil *"
                      value={newAddressForm.villageOrCity}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, villageOrCity: e.target.value })}
                      required
                    />
                    <Input
                      label="District *"
                      value={newAddressForm.district}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                      required
                    />
                    <Input
                      label="Pincode *"
                      value={newAddressForm.pincode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="primary" size="md">
                      Save & Use This Address
                    </Button>
                    {user?.addresses && user.addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => setIsAddingNewAddress(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}

              {/* Step 1 Next Action */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedAddressId && (!user?.addresses || user.addresses.length === 0)}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Order Summary
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY & DELIVERY NOTES */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">Review Items & Logistics</h2>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Items List Snapshot */}
              <div className="space-y-3">
                {calculation?.itemDetails.map((detail) => (
                  <div
                    key={detail.product.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={detail.product.mainImage}
                        alt={detail.product.name}
                        className="w-12 h-12 rounded-lg bg-white p-1 object-contain border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{detail.product.name}</span>
                        <span className="text-slate-500 font-mono">
                          Qty: {detail.quantity} × ₹{detail.unitPrice}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹{detail.itemTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Farmer Order Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery Notes / Farm Landmark Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Call before dispatch, farm is opposite to gram panchayat water tank..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  size="md"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Address
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD & SUBMISSION */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Choose Payment Method</h2>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                {/* UPI Option */}
                <label
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Instant UPI / QR Code (Google Pay, PhonePe, Paytm, BHIM)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Fast, secure, 0% transaction fee directly with your bank.
                    </p>

                    {paymentMethod === 'upi' && (
                      <div className="mt-3 max-w-sm">
                        <Input
                          placeholder="Enter your VPA (e.g. mobile@upi)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery (COD) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Cash on Delivery (Kisan Doorstep COD)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay cash to rural logistics agent upon physical receipt and verification of batch seal.
                    </p>
                  </div>
                </label>

                {/* NetBanking / Card */}
                <label
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>Net Banking / Kisan Credit Card (KCC)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All major public & private banks supported (SBI, HDFC, ICICI, PNB, Bank of Baroda).
                    </p>
                  </div>
                </label>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  size="md"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Summary
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  isLoading={isCreatingOrder}
                  variant="primary"
                  size="lg"
                  leftIcon={<ShieldCheck className="w-5 h-5" />}
                  className="font-bold shadow-xl"
                >
                  Confirm & Place Farm Order (₹{calculation?.pricing.totalAmount.toLocaleString('en-IN')})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Authoritative Order Price Column */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {calculation && (
            <OrderSummaryCard
              pricing={calculation.pricing}
              itemCount={itemCount}
              appliedDiscounts={calculation.appliedDiscounts}
            />
          )}

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Orders placed before 4:00 PM are packaged the same day from our temperature-controlled regional hub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

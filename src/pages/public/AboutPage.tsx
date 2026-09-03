import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Award, Truck, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sprout className="w-4 h-4" />
          <span>Our Vision for Indian Agriculture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          About KaFaaS (Kavir Fasal Sarthi)
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          KaFaaS is committed to transforming farm productivity across rural India through digital disease identification advisory and a reliable, transparent agricultural input supply network.
        </p>
      </div>

      {/* Core Mission Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">100% Genuine Certified Inputs</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Eliminating spurious and adulterated agrochemicals in rural markets by directly sourcing from certified manufacturers (Bayer, FMC, Syngenta, IFFCO, Tata Rallis) with full batch transparency.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Science-Backed Disease Solutions</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Connecting crop health diagnostics directly with precise product recommendations. Farmers receive targeted chemical prescriptions alongside organic bio-stimulants for faster recovery.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Doorstep Village Delivery</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Overcoming rural logistics hurdles with dedicated local distribution hubs, providing rapid farmgate delivery across remote tehsil villages in MP, Maharashtra, and beyond.
          </p>
        </div>
      </div>
    </div>
  );
};

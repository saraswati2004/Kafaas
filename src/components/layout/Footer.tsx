import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, HeartHandshake, Award, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Certified Inputs</h4>
              <p className="text-xs text-slate-400">CIB&RC & NPOP Approved</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Smart Disease Matrix</h4>
              <p className="text-xs text-slate-400">Scientifically Verified Remedies</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Rural Farm Dispatch</h4>
              <p className="text-xs text-slate-400">Direct to Tehsil & Farmgates</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Kisan Toll Free</h4>
              <p className="text-xs text-slate-400">1800-180-1551 (6am - 10pm)</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                KaFaaS
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              <strong>Kavir Fasal Sarthi (KaFaaS)</strong> is an integrated agricultural technology and commerce ecosystem connecting Indian farmers with genuine crop-care inputs, disease diagnosis advisories, and transparent pricing.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
              <span>🌾 Empowering Indian Farmers across MP, Maharashtra & Gujarat</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Agri Inputs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop?category=Fertilizers" className="hover:text-emerald-400 transition-colors">
                  Water Soluble Fertilizers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Fungicides" className="hover:text-emerald-400 transition-colors">
                  Systemic Fungicides
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Pesticides" className="hover:text-emerald-400 transition-colors">
                  Insecticides & Pesticides
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Bio Products" className="hover:text-emerald-400 transition-colors">
                  Bio-Stimulants & Trichoderma
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Seeds" className="hover:text-emerald-400 transition-colors">
                  Certified Hybrid Seeds
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Crop Protection" className="hover:text-emerald-400 transition-colors">
                  Pheromone Traps & Protection
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Platform & Advisory
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/recommendations" className="hover:text-emerald-400 transition-colors text-emerald-300 font-medium">
                  Crop Disease Diagnosis
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-emerald-400 transition-colors">
                  Browse All Products
                </Link>
              </li>
              <li>
                <Link to="/farmer/orders" className="hover:text-emerald-400 transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About KaFaaS Mission
                </Link>
              </li>
              <li>
                <Link to="/vendor" className="hover:text-emerald-400 transition-colors">
                  Vendor Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Kisan Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">1800-180-1551</span>
                  <span className="text-xs text-slate-400">All India Kisan Toll-Free</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs">support@kafaas.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400">
                  Agri-Hub, Sanwer Road Industrial Area, Indore, MP 452015
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KaFaaS (Kavir Fasal Sarthi). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Agro Commerce</span>
            <span className="hover:text-slate-400 cursor-pointer">Return & Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

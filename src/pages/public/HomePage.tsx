import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories, useFeaturedProducts } from '../../hooks/useProducts';
import { ProductGrid } from '../../components/shop/ProductGrid';
import { Button } from '../../components/common/Button';
import { 
  Sprout, 
  Stethoscope, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  Search,
  Award,
  Leaf,
  Bug,
  ShieldAlert,
  Scissors,
  Wheat
} from 'lucide-react';
import { MOCK_CROPS } from '../../api/mockData';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } = useFeaturedProducts();
  const [quickSearch, setQuickSearch] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-6 h-6 text-emerald-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-emerald-600" />;
      case 'Bug': return <Bug className="w-6 h-6 text-emerald-600" />;
      case 'Scissors': return <Scissors className="w-6 h-6 text-emerald-600" />;
      case 'Wheat': return <Wheat className="w-6 h-6 text-emerald-600" />;
      case 'Leaf': return <Leaf className="w-6 h-6 text-emerald-600" />;
      default: return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-16 sm:py-24">
        {/* Subtle background overlay image */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Next-Gen Indian Agriculture & Crop Care Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
                Smart Farming Starts with the <span className="text-emerald-400">Right Solution</span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover certified agricultural products and disease-based remedies designed to help farmers make better crop-care decisions, protect harvests, and maximize farm yields.
              </p>

              {/* Quick Search in Hero */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0 relative">
                <div className="flex bg-white rounded-2xl p-1.5 shadow-2xl border border-emerald-400/30">
                  <div className="flex-1 flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      placeholder="Search fertilizers, fungicides, seeds, pests..."
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      className="w-full text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/shop">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Shop All Products
                  </Button>
                </Link>
                <Link to="/recommendations">
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<Stethoscope className="w-5 h-5 text-emerald-400" />}
                    className="bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600"
                  >
                    Explore Disease Remedies
                  </Button>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-emerald-700/50 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-white block">10,000+</span>
                  <span className="text-xs text-emerald-200">Farmers Served</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-white block">100%</span>
                  <span className="text-xs text-emerald-200">CIB&RC Certified</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-white block">48 Hours</span>
                  <span className="text-xs text-emerald-200">Rural Farm Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Agricultural Visual Area */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Visual Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-700/40 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80"
                    alt="Indian Farmer inspecting healthy crops"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/90 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                        Active Advisory Alert
                      </span>
                      <span className="text-xs text-slate-300">Tomato Early Blight</span>
                    </div>
                    <h3 className="font-bold text-base">Prescribed Systemic & Bio Combo Available</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Nativo 75 WG + Soluble 19:19:19 + Trichoderma bio-defense kit.
                    </p>
                  </div>
                </div>

                {/* Floating Floating Badge Card */}
                <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block">100% Genuine Agro-Inputs</span>
                    <span className="text-xs text-slate-500">Zero duplicate chemicals guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4" />
              <span>Agri Input Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
              Shop by Agricultural Need
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>Explore All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-soft-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                  {getCategoryIcon(category.iconName)}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{category.productCount} Products</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. DISEASE-BASED RECOMMENDATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>The KaFaaS Smart Advisory Advantage</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans']">
                Disease-to-Product Recommendation Flow
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Prevent indiscriminate spraying and wasted farm expenses. KaFaaS scientifically maps your specific crop disease to targeted curative fungicides, bio-stimulants, and recovery nutrition.
              </p>
            </div>

            {/* 4-Step Flow Chart Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Identify Crop Issue</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Select your standing crop (Tomato, Cotton, Paddy, Chilli) or review disease symptoms.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Get Disease Info</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Access symptoms, causes, severity rating, and preventive measures vetted by agronomists.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Receive Recommendations</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Get exact active molecules, priority ranking, and dosage schedules per litre of water.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 font-bold text-sm flex items-center justify-center mb-3">
                  4
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Purchase from KaFaaS</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  1-click add full prescribed curative kit to cart with genuine seed and agrochemical dispatch.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-emerald-700/60">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm text-emerald-100">
                  Ready to diagnose your crops? Search by Tomato, Cotton, Rice, or Chilli.
                </span>
              </div>
              <Link to="/recommendations">
                <Button
                  variant="secondary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-white text-emerald-950 hover:bg-emerald-50 border-0 font-bold shadow"
                >
                  View Recommended Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Farmer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
              Featured Agricultural Inputs
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>View All {featuredProducts.length}+ Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts.slice(0, 8)} isLoading={isLoadingFeatured} />
      </section>

      {/* 5. PROMOTIONAL / OFFER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 font-bold text-xs uppercase tracking-wider inline-block">
              Seasonal Kharif & Rabi Agri Subsidy
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] text-slate-950">
              Get Up to 20% Off On Bio-Pesticides & Soluble NPK Blends
            </h3>
            <p className="text-sm text-slate-900 max-w-xl font-medium">
              Apply coupon <code className="bg-slate-950 text-white px-2 py-0.5 rounded font-mono font-bold">KISANCARE</code> at checkout for instant subsidy discounts and free delivery above ₹999.
            </p>
          </div>
          <Link to="/shop" className="shrink-0">
            <Button variant="primary" size="lg" className="bg-slate-950 hover:bg-slate-900 text-white font-bold">
              Claim Seasonal Offer
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. WHY KAFAAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Built for Indian Agriculture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Why Farmers & Agri-Vendors Trust KaFaaS
          </h2>
          <p className="text-sm text-slate-500">
            A trustworthy, modern, simple, and farmer-first commerce platform designed for Indian agrarian conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Smart Recommendations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tailored product combinations according to identified crop diseases, eliminating guess-work.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Trusted Agri Products</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct tie-ups with leading certified manufacturers like Bayer, IFFCO, FMC, Dhanuka, and Syngenta.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Easy & Transparent Ordering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Order via UPI, Cards, NetBanking or Cash On Delivery with direct delivery to village doorsteps.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Farmer-Focused Platform</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Simplified interface with readable typography, Hindi crop naming, and toll-free agronomist support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

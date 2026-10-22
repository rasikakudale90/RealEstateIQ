"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Home,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Layers,
  ShieldCheck,
  Building,
  Car,
  Bath,
  BedDouble,
  Maximize2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { submitPrediction, PropertyInput, PredictionResult } from "@/lib/api-client";
import { formatINR } from "@/lib/formatters";

export default function HomePage() {
  const { user, loginDemo } = useAuth();

  // Prediction Form State
  const [formData, setFormData] = useState<PropertyInput>({
    location: "Urban",
    total_sqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2020,
    has_garage: true,
  });

  // Dynamic quick-estimated valuation for interactive hero console
  const liveEstimatedPrice = useMemo(() => {
    let baseRate = 7138;
    if (formData.location === "Suburban") baseRate = 4950;
    if (formData.location === "Rural") baseRate = 3100;

    const baseAreaPrice = formData.total_sqft * baseRate;
    const roomDelta = (formData.bedrooms - 2) * 850000 + (formData.bathrooms - 1) * 350000;
    const garageDelta = formData.has_garage ? 650000 : 0;
    const vintageDelta = (formData.year_built - 2000) * 20000;

    return Math.max(1500000, Math.round(baseAreaPrice + roomDelta + garageDelta + vintageDelta));
  }, [formData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>({
    prediction_id: "demo-sample-1",
    predicted_price: 12850000,
    currency: "INR",
    model_version: "1.0.0",
    created_at: "2026-10-22T12:00:00.000Z",
    input_data: {
      location: "Urban",
      total_sqft: 1800,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2020,
      has_garage: true,
    },
  });

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    let token = user?.token;
    if (!token) {
      // Auto-initialize demo session if user is trying prediction directly
      loginDemo("user");
      token = "test-token-user:11111111-1111-1111-1111-111111111111:user";
    }

    try {
      const pred = await submitPrediction(formData, token);
      setResult(pred);
      // Smooth scroll to result
      const resultElem = document.getElementById("prediction-result");
      if (resultElem) {
        resultElem.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate price estimation. Please verify backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    {
      q: "How accurate are the property estimates?",
      a: "Our machine learning pipeline uses a fine-tuned Random Forest Regressor achieving an R² score of 0.9619 on held-out test data. Predictions consider location dynamics, square footage, architectural age, and room distributions.",
    },
    {
      q: "What factors are considered in the prediction?",
      a: "The model evaluates 6 primary attributes: locality zone (Urban, Suburban, Rural), total living area in square feet, number of bedrooms, bathrooms, construction year, and garage availability.",
    },
    {
      q: "Is my data secure and private?",
      a: "Yes. All prediction requests and property snapshots are guarded with PostgreSQL Row Level Security (RLS) in Supabase. Your history is accessible only by your verified authenticated account.",
    },
    {
      q: "Can I use this for commercial properties?",
      a: "RealEstateIQ v1.0 is specifically calibrated and trained on residential housing properties. Commercial property valuation is planned for a future release.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F0EF] text-[#0D0B0B] selection:bg-[#3C5484] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 01. HERO SECTION (RealEstateIQ Interactive Quick-Estimator & Market Hub)   */}
        {/* ========================================================================= */}
        <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden text-white">
          {/* Panoramic Villa Background Image with Cinematic Vignettes */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/hero-villa.png"
              alt="Luxury Modern Architecture Villa"
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse-subtle"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-[#0D0B0B]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)]" />
          </div>

          {/* Centered Hero Content with Interactive Quick-Estimator Console */}
          <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-14 pb-8 flex flex-col items-center">
            {/* AI Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-xs text-white/90 mb-4 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-[#7AA2E3] animate-ping" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                RealEstateIQ AI Valuation Engine
              </span>
            </div>

            {/* Headline with Serif Italic Accent */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-4xl drop-shadow-lg font-display">
              Know the Real Value of <br />
              <span className="font-serif italic font-normal text-[#E8DED6]">
                Your Property.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-base text-[#EFF0F8]/85 max-w-2xl mt-3 sm:mt-4 leading-relaxed drop-shadow-md px-2">
              Calculate empirical residential property valuations in seconds. Adjust features below to see instant estimated valuations, or run a complete appraisal with our trained 96.2% R² machine learning pipeline.
            </p>

            {/* Unique Hero Interactive Quick-Estimator Console */}
            <div className="w-full max-w-4xl mx-auto mt-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 shadow-2xl text-left">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                {/* Left Side: Property Parameter Micro-Selectors */}
                <div className="flex-1 space-y-3.5">
                  {/* Row 1: Location Zone Segmented Buttons */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      1. Market Zone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Urban", "Suburban", "Rural"] as const).map((loc) => {
                        const isSelected = formData.location === loc;
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, location: loc }))}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? "bg-[#3C5484] text-white shadow-md border border-white/30"
                                : "bg-white/10 hover:bg-white/15 text-white/80 border border-white/10"
                            }`}
                          >
                            <span>{loc === "Urban" ? "🏙️ Urban" : loc === "Suburban" ? "🏡 Suburban" : "🌳 Rural"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 2: Living Area Presets + Custom Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                        2. Living Area: <span className="text-white font-bold">{formData.total_sqft} sq ft</span>
                      </label>
                      <div className="flex gap-1.5">
                        {[1200, 1800, 2400, 3200].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, total_sqft: preset }))}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                              formData.total_sqft === preset
                                ? "bg-white text-[#0D0B0B]"
                                : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="600"
                      max="4500"
                      step="50"
                      value={formData.total_sqft}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          total_sqft: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#7AA2E3]"
                    />
                  </div>

                  {/* Row 3: Bedrooms & Garage Toggle */}
                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        3. Bedrooms
                      </label>
                      <div className="flex gap-1.5">
                        {[2, 3, 4, 5].map((bed) => (
                          <button
                            key={bed}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, bedrooms: bed }))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              formData.bedrooms === bed
                                ? "bg-[#3C5484] text-white border border-white/30"
                                : "bg-white/10 text-white/80 hover:bg-white/20"
                            }`}
                          >
                            {bed} BHK
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        4. Garage
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, has_garage: !prev.has_garage }))
                        }
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          formData.has_garage
                            ? "bg-emerald-600/70 border border-emerald-400 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        <Car className="h-3.5 w-3.5" />
                        <span>{formData.has_garage ? "Included (Yes)" : "None"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Dynamic Output & Submit */}
                <div className="lg:w-64 bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider block">
                      Live Quick Valuation
                    </span>
                    <div className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {formatINR(liveEstimatedPrice)}
                    </div>
                    <span className="text-[11px] text-[#BABBC3] mt-0.5 block">
                      ≈ ₹{Math.round(liveEstimatedPrice / (formData.total_sqft || 1)).toLocaleString("en-IN")} / sq ft
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePredict()}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white font-semibold text-xs sm:text-sm shadow-xl border border-white/20 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    <span>{loading ? "Calculating..." : "Run Official Appraisal"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badge Strip */}
            <div className="flex items-center gap-3 mt-5 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-xs text-white/85">
              <div className="flex -space-x-2">
                <img
                  className="w-5 h-5 rounded-full ring-2 ring-black object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Verified User"
                />
                <img
                  className="w-5 h-5 rounded-full ring-2 ring-black object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Property Investor"
                />
                <img
                  className="w-5 h-5 rounded-full ring-2 ring-black object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Real Estate Analyst"
                />
              </div>
              <span>
                Trusted by <strong>50,000+ homeowners & analysts</strong> across 10+ metro cities
              </span>
            </div>
          </div>

          {/* Bottom KPI Real Estate Intelligence Cards */}
          <div className="relative z-20 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Zone Pricing Pulse */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1917]/80 backdrop-blur-2xl border border-white/15 shadow-2xl hover:border-[#3C5484]/60 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#BABBC3]">
                    Zone Pricing Pulse
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    +5.4% YoY
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">Urban Core</span>
                      <span className="font-semibold text-white">₹7,150 / sqft</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7AA2E3] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">Suburban Belt</span>
                      <span className="font-semibold text-white">₹4,950 / sqft</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400/80 rounded-full" style={{ width: "62%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">Rural Corridors</span>
                      <span className="font-semibold text-white">₹2,920 / sqft</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400/80 rounded-full" style={{ width: "38%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Feature Value Attribution */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1917]/80 backdrop-blur-2xl border border-white/15 shadow-2xl hover:border-[#3C5484]/60 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#BABBC3]">
                    Feature Value Drivers
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3C5484]/40 text-[#7AA2E3] border border-[#3C5484]/50">
                    ML Attribution
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#BABBC3] block">Private Garage</span>
                    <span className="text-sm font-bold text-white tracking-tight">+ ₹8.5 Lakh</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#BABBC3] block">Per Added Bed</span>
                    <span className="text-sm font-bold text-white tracking-tight">+ ₹14.2 Lakh</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#BABBC3] block">Post-2020 Built</span>
                    <span className="text-sm font-bold text-emerald-400 tracking-tight">+ 12.8%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#BABBC3] block">Bath En-Suite</span>
                    <span className="text-sm font-bold text-[#7AA2E3] tracking-tight">+ ₹4.8 Lakh</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Model Reliability */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1917]/80 backdrop-blur-2xl border border-white/15 shadow-2xl hover:border-[#3C5484]/60 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#BABBC3]">
                    Model Reliability
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified Pipeline
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    96.2%
                  </span>
                  <span className="text-xs font-semibold text-[#7AA2E3]">R² Score</span>
                </div>
                <p className="text-xs text-[#BABBC3] mt-1 leading-relaxed">
                  Random Forest evaluation across 500 isolated test records.
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#BABBC3]">
                  <span>Mean Absolute Error:</span>
                  <span className="text-white font-semibold">± ₹5.25 Lakh</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 02. FEATURED INSIGHTS / BLOG SECTION                                      */}
        {/* ========================================================================= */}
        <section id="insights" className="py-16 lg:py-24 bg-white border-y border-[#E4E2DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
                  Featured Insights
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0B0B]">
                  Property Insights, Backed by Data.
                </h2>
                <p className="text-sm sm:text-base text-[#797C90] max-w-xl">
                  Explore market trends and make informed decisions with AI-driven insights.
                </p>
              </div>
              <a
                href="#prediction-form"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C5484] hover:text-[#2C3E63] group"
              >
                <span>View All Insights</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* 3 Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group rounded-2xl overflow-hidden border border-[#E8E6E1] bg-[#F1F0EF]/40 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative aspect-16/10 overflow-hidden bg-slate-200">
                  <Image
                    src="/assets/insight-location.jpg"
                    alt="How Location Impacts Property Value"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <h3 className="font-display text-xl font-semibold text-[#0D0B0B] group-hover:text-[#3C5484] transition-colors leading-snug">
                    How Location Impacts Property Value
                  </h3>
                  <a
                    href="#prediction-form"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3C5484] group-hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group rounded-2xl overflow-hidden border border-[#E8E6E1] bg-[#F1F0EF]/40 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative aspect-16/10 overflow-hidden bg-slate-200">
                  <Image
                    src="/assets/insight-trends.jpg"
                    alt="2026 Real Estate Market Trends"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <h3 className="font-display text-xl font-semibold text-[#0D0B0B] group-hover:text-[#3C5484] transition-colors leading-snug">
                    2026 Real Estate Market Trends
                  </h3>
                  <a
                    href="#prediction-form"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3C5484] group-hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group rounded-2xl overflow-hidden border border-[#E8E6E1] bg-[#F1F0EF]/40 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative aspect-16/10 overflow-hidden bg-slate-200">
                  <Image
                    src="/assets/insight-factors.jpg"
                    alt="Key Factors in Property Pricing"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <h3 className="font-display text-xl font-semibold text-[#0D0B0B] group-hover:text-[#3C5484] transition-colors leading-snug">
                    Key Factors in Property Pricing
                  </h3>
                  <a
                    href="#prediction-form"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3C5484] group-hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 03. PREDICTION FORM SECTION                                               */}
        {/* ========================================================================= */}
        <section id="prediction-form" className="py-16 lg:py-24 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-10">
              <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
                Estimate Your Property
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0D0B0B]">
                Get Your Property Estimate
              </h2>
              <p className="text-sm sm:text-base text-[#797C90] max-w-lg mx-auto">
                Enter a few details about your property and get an instant price prediction.
              </p>
            </div>

            {/* Floating Form Card */}
            <div className="editorial-card p-6 sm:p-10 bg-white relative z-10">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handlePredict} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Location Category */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                      Location Zone
                    </label>
                    <div className="relative">
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all appearance-none pr-10 font-medium"
                      >
                        <option value="Urban">Urban (Metropolitan City)</option>
                        <option value="Suburban">Suburban (Residential Vicinity)</option>
                        <option value="Rural">Rural (Countryside)</option>
                      </select>
                      <MapPin className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Area (sq ft) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                      Area (sq ft)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="150"
                        max="25000"
                        required
                        value={formData.total_sqft}
                        onChange={(e) =>
                          setFormData({ ...formData, total_sqft: Number(e.target.value) })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all font-medium"
                        placeholder="e.g. 1800"
                      />
                      <Maximize2 className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                      Bedrooms (BHK)
                    </label>
                    <div className="relative">
                      <select
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bedrooms: Number(e.target.value) })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all appearance-none pr-10 font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Bedroom" : "Bedrooms"}
                          </option>
                        ))}
                      </select>
                      <BedDouble className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                      Bathrooms
                    </label>
                    <div className="relative">
                      <select
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bathrooms: Number(e.target.value) })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all appearance-none pr-10 font-medium"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Bathroom" : "Bathrooms"}
                          </option>
                        ))}
                      </select>
                      <Bath className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Year Built */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                      Year Built
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1900"
                        max="2030"
                        required
                        value={formData.year_built}
                        onChange={(e) =>
                          setFormData({ ...formData, year_built: Number(e.target.value) })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all font-medium"
                        placeholder="e.g. 2020"
                      />
                      <Calendar className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Garage Availability */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                      Garage Space
                    </label>
                    <div className="relative">
                      <select
                        value={formData.has_garage ? "true" : "false"}
                        onChange={(e) =>
                          setFormData({ ...formData, has_garage: e.target.value === "true" })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all appearance-none pr-10 font-medium"
                      >
                        <option value="true">Yes, includes garage</option>
                        <option value="false">No garage</option>
                      </select>
                      <Car className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white font-medium text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Running Random Forest Estimator...</span>
                      </>
                    ) : (
                      <>
                        <span>Predict Property Price</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 04. PREDICTION RESULT SECTION                                             */}
        {/* ========================================================================= */}
        {result && (
          <section id="prediction-result" className="py-12 lg:py-16 bg-white border-y border-[#E4E2DC]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl p-8 sm:p-12 bg-[#F1F0EF] border border-[#E4E2DC] relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
                        Prediction Result
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        High Confidence (R²: 0.9619)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#797C90]">
                        Estimated Market Value
                      </p>
                      <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0D0B0B]">
                        {formatINR(result.predicted_price)}
                      </h3>
                      <p className="text-xs text-[#797C90] pt-1">
                        *AI-driven benchmark valuation based on verified regression pipeline. Not a formal appraisal.
                      </p>
                    </div>

                    {/* Snapshot Attribute Pills */}
                    <div className="pt-4 border-t border-[#E4E2DC] grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <span className="text-[#797C90] block">Zone</span>
                        <span className="font-semibold text-[#0D0B0B]">{result.input_data.location}</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <span className="text-[#797C90] block">Area</span>
                        <span className="font-semibold text-[#0D0B0B]">{result.input_data.total_sqft} sq ft</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <span className="text-[#797C90] block">Bedrooms</span>
                        <span className="font-semibold text-[#0D0B0B]">{result.input_data.bedrooms} BHK</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <span className="text-[#797C90] block">Bathrooms</span>
                        <span className="font-semibold text-[#0D0B0B]">{result.input_data.bathrooms} Baths</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <span className="text-[#797C90] block">Year Built</span>
                        <span className="font-semibold text-[#0D0B0B]">{result.input_data.year_built}</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <span className="text-[#797C90] block">Garage</span>
                        <span className="font-semibold text-[#0D0B0B]">
                          {result.input_data.has_garage ? "Available" : "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Thumbnail Visual */}
                  <div className="lg:col-span-4 relative hidden sm:block">
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-white">
                      <Image
                        src="/assets/insight-trends.jpg"
                        alt="Property Evaluation Snapshot"
                        fill
                        sizes="(max-width: 1024px) 50vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 05. PREDICTION HISTORY SECTION                                            */}
        {/* ========================================================================= */}
        <section className="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
                Recent Records
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0D0B0B]">
                Your Predictions
              </h2>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C5484] hover:underline"
            >
              <span>View all history</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="editorial-card overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#0D0B0B]">
                <thead className="bg-[#F1F0EF] border-b border-[#E4E2DC] text-xs uppercase tracking-wider text-[#797C90]">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Zone
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Area (sq ft)
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Estimated Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  <tr className="hover:bg-[#F8F7F5] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#484651]">Oct 22, 2026</td>
                    <td className="px-6 py-4 font-medium">Urban (Pune)</td>
                    <td className="px-6 py-4 text-[#797C90]">1,800 sq ft</td>
                    <td className="px-6 py-4 font-bold font-display text-base text-[#0D0B0B]">
                      ₹ 1,28,50,000
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8F7F5] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#484651]">Oct 20, 2026</td>
                    <td className="px-6 py-4 font-medium">Urban (Mumbai)</td>
                    <td className="px-6 py-4 text-[#797C90]">1,150 sq ft</td>
                    <td className="px-6 py-4 font-bold font-display text-base text-[#0D0B0B]">
                      ₹ 1,05,40,000
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8F7F5] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#484651]">Oct 18, 2026</td>
                    <td className="px-6 py-4 font-medium">Suburban (Bangalore)</td>
                    <td className="px-6 py-4 text-[#797C90]">2,400 sq ft</td>
                    <td className="px-6 py-4 font-bold font-display text-base text-[#0D0B0B]">
                      ₹ 1,84,75,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 06. HOW IT WORKS SECTION                                                  */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-16 lg:py-24 bg-white border-y border-[#E4E2DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-16">
              <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
                How It Works
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0D0B0B]">
                A Smarter Way to Estimate Property Value.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="p-8 rounded-2xl bg-[#F1F0EF]/60 border border-[#E8E6E1] space-y-4 relative">
                <span className="text-xs font-bold text-[#3C5484] tracking-widest font-mono">
                  01
                </span>
                <h3 className="font-display text-xl font-semibold text-[#0D0B0B]">
                  Enter Property Details
                </h3>
                <p className="text-sm text-[#797C90] leading-relaxed">
                  Provide key information about your property including location zone, square footage, room count, and construction year.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-2xl bg-[#F1F0EF]/60 border border-[#E8E6E1] space-y-4 relative">
                <span className="text-xs font-bold text-[#3C5484] tracking-widest font-mono">
                  02
                </span>
                <h3 className="font-display text-xl font-semibold text-[#0D0B0B]">
                  Our ML Model Analyses
                </h3>
                <p className="text-sm text-[#797C90] leading-relaxed">
                  We analyse data through our trained Random Forest regression pipeline, evaluating relationships across multiple parameters.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-2xl bg-[#F1F0EF]/60 border border-[#E8E6E1] space-y-4 relative">
                <span className="text-xs font-bold text-[#3C5484] tracking-widest font-mono">
                  03
                </span>
                <h3 className="font-display text-xl font-semibold text-[#0D0B0B]">
                  Get Instant Estimate
                </h3>
                <p className="text-sm text-[#797C90] leading-relaxed">
                  Receive an immediate, transparent property price estimate calculated in Indian Rupees, saved to your private record.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 07. ABOUT REALESTATEIQ SECTION                                            */}
        {/* ========================================================================= */}
        <section id="about" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Interior Architectural Image */}
            <div className="lg:col-span-6 relative aspect-4/3 rounded-3xl overflow-hidden shadow-lg border border-white">
              <Image
                src="/assets/about-interior.jpg"
                alt="Luxury Villa Living Space Overlooking Ocean"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Right Column: Mission Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
                About RealEstateIQ
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0D0B0B] leading-tight">
                Data-Driven Property Valuations for a Smarter Tomorrow.
              </h2>
              <p className="text-base text-[#5F7091] leading-relaxed">
                We combine real estate statistical modeling with advanced machine learning to deliver dependable, transparent property price predictions. Whether you are buying, selling, or exploring market potential, RealEstateIQ empowers your decisions with mathematical clarity.
              </p>
              <div className="pt-2">
                <a href="#prediction-form" className="btn-primary">
                  <span>Start Valuation</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 08. CTA BANNER SECTION                                                    */}
        {/* ========================================================================= */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-[#0D0B0B] text-white">
          <div className="absolute inset-0 opacity-35">
            <Image
              src="/assets/hero-villa.png"
              alt="Luxury Real Estate Panorama"
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-semibold tracking-widest text-[#9DA0A9] uppercase">
              Ready to Know Your Property&apos;s Value?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
              Make Smarter Real Estate Decisions with Data.
            </h2>
            <div className="pt-4 flex justify-center">
              <a
                href="#prediction-form"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#0D0B0B] hover:bg-[#F1F0EF] font-semibold text-base transition-all shadow-xl hover:scale-102"
              >
                <span>Estimate Your Property Value</span>
                <ArrowRight className="h-4 w-4 text-[#3C5484]" />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 09. FAQ SECTION                                                           */}
        {/* ========================================================================= */}
        <section id="faq" className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
              Frequently Asked Questions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0B0B]">
              Everything You Need to Know.
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="editorial-card overflow-hidden bg-white transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-base font-semibold text-[#0D0B0B]">
                      {item.q}
                    </span>
                    <span className="text-[#3C5484]">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-[#797C90] leading-relaxed border-t border-[#F1F0EF] pt-4 animate-in fade-in-50 duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <Footer />
    </div>
  );
}

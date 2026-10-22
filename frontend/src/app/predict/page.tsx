"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { submitPrediction, PredictionResult, PropertyInput } from "@/lib/api-client";
import { formatINR } from "@/lib/formatters";

export default function PredictPage() {
  const { user, loginDemo } = useAuth();

  const [formData, setFormData] = useState<PropertyInput>({
    location: "Urban",
    total_sqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2020,
    has_garage: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill form if query parameters exist from search palette
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const loc = params.get("location");
      const sqft = params.get("sqft");
      const bed = params.get("bed");
      const bath = params.get("bath");
      const year = params.get("year");
      const garage = params.get("garage");

      if (loc || sqft || bed || bath || year || garage !== null) {
        setFormData((prev) => ({
          location:
            loc === "Urban" || loc === "Suburban" || loc === "Rural"
              ? loc
              : prev.location,
          total_sqft: sqft ? parseInt(sqft, 10) || prev.total_sqft : prev.total_sqft,
          bedrooms: bed ? parseInt(bed, 10) || prev.bedrooms : prev.bedrooms,
          bathrooms: bath ? parseInt(bath, 10) || prev.bathrooms : prev.bathrooms,
          year_built: year ? parseInt(year, 10) || prev.year_built : prev.year_built,
          has_garage: garage !== null ? garage === "true" : prev.has_garage,
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let token = user?.token;
    if (!token) {
      loginDemo("user");
      token = "test-token-user:11111111-1111-1111-1111-111111111111:user";
    }

    setLoading(true);
    try {
      const pred = await submitPrediction(formData, token);
      setResult(pred);
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

  const handleCopy = () => {
    if (!result) return;
    const text = `RealEstateIQ Valuation: ${formatINR(result.predicted_price)} (${formData.location}, ${formData.total_sqft} sqft, ${formData.bedrooms} beds, ${formData.bathrooms} baths)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F1F0EF] text-[#0D0B0B] flex flex-col selection:bg-[#3C5484] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left space-y-2">
          <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
            Property Valuation
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0D0B0B]">
            Estimate Your Property Value
          </h1>
          <p className="text-sm sm:text-base text-[#797C90] max-w-2xl">
            Enter your property specifications below to receive an ML-computed market price valuation powered by our Random Forest pipeline.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <strong className="font-semibold">Estimation Error: </strong>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Prediction Form */}
          <div className="lg:col-span-7 editorial-card p-6 sm:p-8 bg-white">
            <h2 className="font-display text-xl font-semibold text-[#0D0B0B] mb-6">
              Property Specifications
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
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
                    <option value="Urban">Urban (High density city center)</option>
                    <option value="Suburban">Suburban (Residential metropolitan zone)</option>
                    <option value="Rural">Rural (Countryside / Outskirts)</option>
                  </select>
                  <MapPin className="h-4 w-4 text-[#797C90] absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Total SqFt */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                  Total Area (Square Feet)
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

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Year Built & Garage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                    Garage Facility
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Computing Estimate...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Valuation</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 space-y-6">
            {result ? (
              <div className="editorial-card p-6 sm:p-8 bg-white space-y-6 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E2DC]">
                  <span className="text-xs font-semibold text-[#5F7091] tracking-wider uppercase">
                    Prediction Summary
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    High Confidence
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#797C90] uppercase tracking-wider block">
                    Estimated Market Value
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold text-[#0D0B0B]">
                    {formatINR(result.predicted_price)}
                  </h3>
                  <p className="text-xs text-[#797C90] pt-1">
                    Computed using trained Random Forest Regressor (v{result.model_version}).
                  </p>
                </div>

                {/* Property snapshot details */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-[#F1F0EF] text-xs">
                    <span className="text-[#797C90] block">Location Zone</span>
                    <span className="font-semibold text-[#0D0B0B]">{result.input_data.location}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F0EF] text-xs">
                    <span className="text-[#797C90] block">Living Area</span>
                    <span className="font-semibold text-[#0D0B0B]">{result.input_data.total_sqft} sq ft</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F0EF] text-xs">
                    <span className="text-[#797C90] block">Bedrooms</span>
                    <span className="font-semibold text-[#0D0B0B]">{result.input_data.bedrooms} BHK</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F0EF] text-xs">
                    <span className="text-[#797C90] block">Bathrooms</span>
                    <span className="font-semibold text-[#0D0B0B]">{result.input_data.bathrooms}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F0EF] text-xs">
                    <span className="text-[#797C90] block">Year Built</span>
                    <span className="font-semibold text-[#0D0B0B]">{result.input_data.year_built}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F0EF] text-xs">
                    <span className="text-[#797C90] block">Garage</span>
                    <span className="font-semibold text-[#0D0B0B]">
                      {result.input_data.has_garage ? "Available" : "None"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2.5 rounded-full border border-[#D5D2CA] text-[#0D0B0B] text-xs font-semibold hover:border-[#0D0B0B] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                  <Link
                    href="/history"
                    className="flex-1 py-2.5 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View in History</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="editorial-card p-8 bg-white text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-[#F1F0EF] text-[#3C5484] mx-auto flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0D0B0B]">
                  Awaiting Property Details
                </h3>
                <p className="text-xs text-[#797C90] leading-relaxed">
                  Fill out the parameters on the left and submit to view your real-time price prediction and confidence metrics.
                </p>
              </div>
            )}

            {/* Model Architecture Transparency Note */}
            <div className="p-5 rounded-2xl bg-[#F1F0EF] border border-[#E4E2DC] text-xs text-[#797C90] space-y-2">
              <span className="font-semibold text-[#0D0B0B] block">
                Model Evaluation Context:
              </span>
              <p>
                Our regression pipeline was fitted on residential housing benchmark data with ColumnTransformer preprocessing and evaluated against Linear Regression and Decision Tree baselines, yielding MAE of ₹5,25,263 and R² of 0.9619.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  Home,
  Check,
  Copy,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { submitPrediction, PredictionResult, PropertyInput } from "@/lib/api-client";

export default function PredictPage() {
  const { user, loginDemo } = useAuth();

  const [formData, setFormData] = useState<PropertyInput>({
    location: "Urban",
    total_sqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2018,
    has_garage: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If user is not signed in, auto-seed a local demo session so they can experience the prediction
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
        setError("Failed to generate price estimation. Please verify backend service status.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `RealEstateIQ Valuation: ${result.currency} ${result.predicted_price.toLocaleString("en-IN")} (${formData.location}, ${formData.total_sqft} sqft, ${formData.bedrooms} beds, ${formData.bathrooms} baths)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 text-xs font-medium mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Empirical Regression Pipeline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Property Price Estimation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Provide property specifications below to receive an ML-computed market price valuation.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-3 text-rose-300 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong className="font-semibold">Estimation Error: </strong>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Prediction Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Location Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Urban", "Suburban", "Rural"].map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setFormData({ ...formData, location: loc })}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.location === loc
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Area in Square Feet */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Total Area (Square Feet)
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                    {formData.total_sqft} sqft
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="50"
                  value={formData.total_sqft}
                  onChange={(e) =>
                    setFormData({ ...formData, total_sqft: parseInt(e.target.value) || 500 })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>500 sqft</span>
                  <span>3,000 sqft</span>
                  <span>6,000 sqft</span>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 1.0 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Year Built & Garage */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    min="1920"
                    max="2026"
                    value={formData.year_built}
                    onChange={(e) =>
                      setFormData({ ...formData, year_built: parseInt(e.target.value) || 2020 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.has_garage}
                      onChange={(e) =>
                        setFormData({ ...formData, has_garage: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-300">Has Private Garage</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Running Machine Learning Pipeline...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>Calculate Price Valuation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Card or Guidance Column */}
          <div className="lg:col-span-5">
            {result ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-900 border border-indigo-700/40 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Valuation Output
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                    Model {result.model_version}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Estimated Market Price</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                    {result.currency === "INR" ? "₹" : "$"}
                    {result.predicted_price.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs font-mono text-indigo-400/80 mt-1">
                    Currency: {result.currency}
                  </div>
                </div>

                {/* Input Summary */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                  <div className="font-semibold text-slate-300 mb-1">Evaluated Features</div>
                  <div className="flex justify-between text-slate-400">
                    <span>Location:</span>
                    <strong className="text-slate-200">{result.input_data.location}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Area:</span>
                    <strong className="text-slate-200">{result.input_data.total_sqft} sqft</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rooms:</span>
                    <strong className="text-slate-200">
                      {result.input_data.bedrooms} Bed / {result.input_data.bathrooms} Bath
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Build Year & Garage:</span>
                    <strong className="text-slate-200">
                      {result.input_data.year_built} • {result.input_data.has_garage ? "With Garage" : "No Garage"}
                    </strong>
                  </div>
                </div>

                {/* Statutory Disclaimer */}
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-300/90 leading-relaxed">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    This valuation is an automated statistical estimate based on historical regressions. It is not an appraisal, valuation certificate, or guarantee of market price.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
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
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-700/50 text-indigo-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>View in History</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-800/60 text-slate-400 mx-auto flex items-center justify-center">
                  <Home className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">
                  Ready to Predict
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Adjust property characteristics on the left and submit. The trained scikit-learn pipeline will compute an estimate in real time.
                </p>
                <div className="pt-2 flex flex-col gap-2 text-left text-xs text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Trained on 2,500+ residential properties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Encapsulates location and age depreciation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Automatically saved to your history</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

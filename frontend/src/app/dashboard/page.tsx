"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  History,
  Building2,
  Cpu,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { fetchUserPredictions, PredictionHistoryItem } from "@/lib/api-client";

export default function DashboardPage() {
  const { user, loginDemo } = useAuth();
  const [predictions, setPredictions] = useState<PredictionHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = user?.token;
    if (!token) {
      loginDemo("user");
      token = "test-token-user:11111111-1111-1111-1111-111111111111:user";
    }

    fetchUserPredictions(token, 1, 5)
      .then((res) => {
        setPredictions(res.items);
        setTotalCount(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-700/40 text-indigo-400 text-xs font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>RealEstateIQ Investor Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.display_name || "Property Analyst"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track, compare, and forecast residential real estate prices with ML precision.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/predict"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <TrendingUp className="h-4 w-4" />
              <span>New Valuation</span>
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-pink-800/40 hover:bg-pink-950/20 text-pink-300 font-semibold text-sm transition-all"
              >
                <Shield className="h-4 w-4" />
                <span>Admin View</span>
              </Link>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Your Saved Valuations
            </div>
            <div className="text-3xl font-bold text-white">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span>Isolated securely in Supabase RLS</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Regression Engine
            </div>
            <div className="text-2xl font-bold text-white">Random Forest</div>
            <div className="text-xs text-indigo-400 mt-2 flex items-center gap-1 font-mono">
              <Cpu className="h-3.5 w-3.5" />
              <span>R²: 0.9619 • MAE: ₹5,25,263</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Configured Market Currency
            </div>
            <div className="text-3xl font-bold text-white">INR (₹)</div>
            <div className="text-xs text-slate-500 mt-2">
              Standard residential square-foot models
            </div>
          </div>
        </div>

        {/* Recent Valuations Table Preview */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <History className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Recent Predictions</h2>
            </div>
            <Link
              href="/history"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View All History</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading history...</div>
          ) : predictions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p>You haven&apos;t run any property price predictions yet.</p>
              <Link
                href="/predict"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium"
              >
                Estimate Your First Property
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Bed / Bath</th>
                    <th className="py-3 px-4">Estimated Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {p.created_at.slice(0, 10)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{p.input_data.location}</td>
                      <td className="py-3.5 px-4 font-mono">{p.input_data.total_sqft} sqft</td>
                      <td className="py-3.5 px-4">
                        {p.input_data.bedrooms} Bed / {p.input_data.bathrooms} Bath
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        {p.currency === "INR" ? "₹" : "$"}
                        {p.predicted_price.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

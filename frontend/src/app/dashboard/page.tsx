"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  History,
  Building2,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { fetchUserPredictions, PredictionHistoryItem } from "@/lib/api-client";
import { formatINR, formatDate } from "@/lib/formatters";

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
    <div className="min-h-screen bg-[#F1F0EF] text-[#0D0B0B] flex flex-col selection:bg-[#3C5484] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        {/* Welcome Banner */}
        <div className="editorial-card p-8 sm:p-10 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
              Investor Overview
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B] tracking-tight">
              Welcome back, {user?.display_name || "Rasika Babe"}
            </h1>
            <p className="text-sm text-[#797C90] max-w-xl">
              Track, evaluate, and forecast residential real estate prices with machine learning precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/predict"
              className="btn-primary text-xs"
            >
              <span>New Valuation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/history"
              className="btn-secondary text-xs"
            >
              <span>View History</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="editorial-card p-6 bg-white space-y-2">
            <span className="text-xs font-semibold text-[#797C90] uppercase tracking-wider block">
              Total Valuations
            </span>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B]">
              {loading ? "..." : totalCount}
            </p>
            <p className="text-xs text-[#797C90]">Saved in your isolated record store</p>
          </div>

          <div className="editorial-card p-6 bg-white space-y-2">
            <span className="text-xs font-semibold text-[#797C90] uppercase tracking-wider block">
              Active Regression Engine
            </span>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B]">
              Random Forest
            </p>
            <p className="text-xs text-[#797C90]">R²: 0.9619 | 100 Trees</p>
          </div>

          <div className="editorial-card p-6 bg-white space-y-2">
            <span className="text-xs font-semibold text-[#797C90] uppercase tracking-wider block">
              Role Access Level
            </span>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B] capitalize">
              {user?.role || "User"}
            </p>
            <p className="text-xs text-[#797C90]">Server-side JWT verified</p>
          </div>
        </div>

        {/* Recent Valuations List */}
        <div className="editorial-card p-6 sm:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#0D0B0B]">
              Recent Activity
            </h2>
            <Link href="/history" className="text-xs font-semibold text-[#3C5484] hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#797C90]">Loading recent records...</div>
          ) : predictions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#797C90] space-y-3">
              <p>No predictions on record yet.</p>
              <Link href="/predict" className="btn-primary text-xs inline-flex">
                <span>Start first valuation</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E2DC]">
              {predictions.map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0D0B0B]">
                      {p.input_data.location} • {p.input_data.total_sqft.toLocaleString()} sq ft
                    </p>
                    <p className="text-xs text-[#797C90]">
                      {p.input_data.bedrooms} BHK • {p.input_data.bathrooms} Baths • Built in {p.input_data.year_built}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold text-[#0D0B0B]">
                      {formatINR(p.predicted_price)}
                    </p>
                    <p className="text-[11px] text-[#797C90]">{formatDate(p.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

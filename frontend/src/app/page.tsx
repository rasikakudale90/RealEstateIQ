"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Server,
} from "lucide-react";
import { checkBackendHealth, HealthResponse } from "@/lib/api-client";

export default function Home() {
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setBackendHealth(data);
        setHealthStatus("online");
      })
      .catch(() => {
        setHealthStatus("offline");
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              RealEstateIQ
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/predict" className="hover:text-white transition-colors">
              Predict Price
            </Link>
            <Link href="/history" className="hover:text-white transition-colors">
              History
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
              <span
                className={`h-2 w-2 rounded-full ${
                  healthStatus === "online"
                    ? "bg-emerald-500 animate-pulse"
                    : healthStatus === "checking"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-slate-400">API:</span>
              <span
                className={
                  healthStatus === "online"
                    ? "text-emerald-400 font-semibold"
                    : healthStatus === "checking"
                    ? "text-amber-400"
                    : "text-rose-400"
                }
              >
                {healthStatus === "online"
                  ? "Connected"
                  : healthStatus === "checking"
                  ? "Connecting..."
                  : "Offline"}
              </span>
            </div>

            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md shadow-indigo-600/25"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-xs font-medium mb-6">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span>Machine Learning Regression Pipeline v1.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Intelligent Property Valuations Driven by{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Machine Learning
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Estimate residential property market prices with high accuracy using multi-variable regression models trained on location, square footage, bedrooms, bathrooms, and build characteristics.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/predict"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Estimate Property Price</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 font-medium text-base transition-all"
          >
            <Server className="h-4 w-4 text-indigo-400" />
            <span>FastAPI Documentation</span>
          </a>
        </div>

        {/* Formal Appraisal Disclaimer Banner */}
        <div className="mt-14 w-full max-w-3xl p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-3.5 text-left text-sm text-amber-200/90">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-300">Regulatory & Estimation Notice: </strong>
            RealEstateIQ is an estimation aid powered by empirical machine learning regression. It does NOT constitute a formal appraisal, mortgage loan valuation, or guaranteed real estate transaction price.
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-xl bg-indigo-900/50 flex items-center justify-center mb-4 text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Trained ML Regressors</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leverages verified Linear, Decision Tree, and Random Forest pipelines serialized with Joblib for sub-second, consistent inferences.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-xl bg-violet-900/50 flex items-center justify-center mb-4 text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Row-Level Security & Auth</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Built on Supabase PostgreSQL with strict RLS policies ensuring individual prediction isolation and zero cross-user data leakage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-xl bg-pink-900/50 flex items-center justify-center mb-4 text-pink-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Admin Auditing & Reports</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Operational dashboard with date-range filters, aggregate statistics, and user directory for authorized administrators.
            </p>
          </div>
        </div>

        {/* Backend Connectivity Status Snapshot */}
        {backendHealth && (
          <div className="mt-12 p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span>Service: <strong className="text-slate-200">{backendHealth.service}</strong></span>
            <span>Version: <strong className="text-slate-200">{backendHealth.version}</strong></span>
            <span>Env: <strong className="text-slate-200">{backendHealth.environment}</strong></span>
            <span>Liveness: <strong className="text-emerald-400">{backendHealth.status}</strong></span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span>© 2026 RealEstateIQ. Developed for Rasika Babe.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Data Governance
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms & Estimation Scope
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

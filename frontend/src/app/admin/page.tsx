"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAdminSummary,
  fetchAdminUsers,
  fetchAdminReport,
  AdminSummary,
  AdminUserItem,
  AdminReport,
} from "@/lib/api-client";

export default function AdminPage() {
  const { user, loginDemo } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const token = user.token;
    setLoading(true);
    Promise.all([
      fetchAdminSummary(token),
      fetchAdminUsers(token),
      fetchAdminReport(token, startDate, endDate),
    ])
      .then(([summaryData, usersData, reportData]) => {
        setSummary(summaryData);
        setUsersList(usersData);
        setReport(reportData);
      })
      .catch((err) => {
        setError(err.message || "Failed to load admin data");
      })
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setReportLoading(true);
    try {
      const rep = await fetchAdminReport(user.token, startDate, endDate);
      setReport(rep);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setReportLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Administrator Access Required
          </h1>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Your current account session does not possess the server-side administrator role required to inspect system telemetry and reports.
          </p>
          <button
            onClick={() => loginDemo("admin")}
            className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            <span>Switch to Demo Admin Session</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/70 border border-pink-800/40 text-pink-400 text-xs font-medium mb-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Privileged Operational Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard & Reports</h1>
            <p className="text-slate-400 text-sm mt-1">
              Cross-user usage statistics, user directory, and date-filtered prediction analytics.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="h-5 w-5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Registered Users
              </span>
              <Users className="h-4 w-4 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {summary?.total_users ?? 0}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Predictions Run
              </span>
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {summary?.total_predictions ?? 0}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Valuation Price
              </span>
              <BarChart3 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {summary?.currency === "INR" ? "₹" : "$"}
              {(summary?.average_predicted_price ?? 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Date-Filtered Reports Generator */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                <span>Date-Filtered Prediction Reports</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Filter and inspect prediction volume and valuations generated in a specific date window.
              </p>
            </div>

            {/* Filter Form */}
            <form onSubmit={handleGenerateReport} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-white focus:outline-none"
                />
              </div>
              <span className="text-xs text-slate-500">to</span>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={reportLoading}
                className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                {reportLoading ? "Filtering..." : "Filter Report"}
              </button>
            </form>
          </div>

          {/* Report Summary Snapshot */}
          {report && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap gap-8 text-xs font-mono">
              <div>
                <span className="text-slate-400">Period: </span>
                <strong className="text-white">
                  {report.start_date} to {report.end_date}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Volume: </span>
                <strong className="text-indigo-400">{report.total_count} predictions</strong>
              </div>
              <div>
                <span className="text-slate-400">Mean Value: </span>
                <strong className="text-emerald-400">
                  {report.currency === "INR" ? "₹" : "$"}
                  {report.average_price.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          )}

          {/* Itemized Report Table */}
          {report && report.predictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/70 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Model Ver</th>
                    <th className="py-3 px-4">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {report.predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">
                        {p.created_at.slice(0, 10)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.user_id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-white font-medium">{p.input_data.location}</td>
                      <td className="py-3 px-4 font-mono">{p.input_data.total_sqft} sqft</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">{p.model_version}</td>
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {p.currency === "INR" ? "₹" : "$"}
                        {p.predicted_price.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No predictions recorded within the selected date window.
            </div>
          )}
        </div>

        {/* User Directory */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-pink-400" />
            <span>Registered Users Directory</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Predictions Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{u.display_name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">{u.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-indigo-400">
                      {u.prediction_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

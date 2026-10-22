"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  Search,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAdminSummary,
  fetchAdminUsers,
  fetchAdminReport,
  AdminSummary,
  AdminUserItem,
  AdminReport,
} from "@/lib/api-client";
import { formatINR, formatDate } from "@/lib/formatters";

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
      <div className="min-h-screen bg-[#F1F0EF] text-[#0D0B0B] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="editorial-card p-8 sm:p-12 max-w-md w-full bg-white text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0D0B0B]">
              Restricted Portal
            </h1>
            <p className="text-xs text-[#797C90] leading-relaxed">
              Administrative privilege required to view system analytics, user counts, and date-filtered prediction reports.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => loginDemo("admin")}
                className="btn-primary text-xs w-full justify-center"
              >
                <span>Switch to Demo Admin</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Link
                href="/"
                className="btn-secondary text-xs w-full justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F0EF] text-[#0D0B0B] flex flex-col selection:bg-[#3C5484] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
              Operations Control
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0D0B0B] tracking-tight">
              Admin & Analytics Portal
            </h1>
            <p className="text-sm text-[#797C90] mt-1">
              Cross-system metrics, user audit logs, and date-filtered prediction aggregation.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* System KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="editorial-card p-6 bg-white space-y-2">
            <div className="flex items-center justify-between text-[#797C90]">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="h-4 w-4 text-[#3C5484]" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B]">
              {summary ? summary.total_users.toLocaleString() : "..."}
            </p>
            <p className="text-xs text-[#797C90]">Registered authenticated accounts</p>
          </div>

          <div className="editorial-card p-6 bg-white space-y-2">
            <div className="flex items-center justify-between text-[#797C90]">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Predictions</span>
              <FileSpreadsheet className="h-4 w-4 text-[#3C5484]" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B]">
              {summary ? summary.total_predictions.toLocaleString() : "..."}
            </p>
            <p className="text-xs text-[#797C90]">Valuation calculations performed</p>
          </div>

          <div className="editorial-card p-6 bg-white space-y-2">
            <div className="flex items-center justify-between text-[#797C90]">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Property Value</span>
              <TrendingUp className="h-4 w-4 text-[#3C5484]" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0D0B0B]">
              {summary ? formatINR(summary.average_predicted_price) : "..."}
            </p>
            <p className="text-xs text-[#797C90]">Calculated across platform dataset</p>
          </div>
        </div>

        {/* Date Filtered Valuation Report */}
        <div className="editorial-card p-6 sm:p-8 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E2DC]">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#0D0B0B]">
                Date-Filtered Valuation Reports
              </h2>
              <p className="text-xs text-[#797C90]">
                Filter predictions and aggregate metrics across a customized time window.
              </p>
            </div>

            <form onSubmit={handleGenerateReport} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#797C90]">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#F1F0EF] border border-[#E4E2DC] text-xs font-medium text-[#0D0B0B]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#797C90]">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#F1F0EF] border border-[#E4E2DC] text-xs font-medium text-[#0D0B0B]"
                />
              </div>
              <button
                type="submit"
                disabled={reportLoading}
                className="px-4 py-1.5 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {reportLoading ? "Filtering..." : "Filter"}
              </button>
            </form>
          </div>

          {report && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F1F0EF] space-y-1">
                <span className="text-xs text-[#797C90]">Volume in Range</span>
                <p className="font-display text-2xl font-bold text-[#0D0B0B]">
                  {report.total_count} Predictions
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F1F0EF] space-y-1">
                <span className="text-xs text-[#797C90]">Mean Valuation in Range</span>
                <p className="font-display text-2xl font-bold text-[#0D0B0B]">
                  {formatINR(report.average_price)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Registered Users Directory */}
        <div className="editorial-card p-6 sm:p-8 bg-white space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#0D0B0B]">
              Registered User Directory
            </h2>
            <p className="text-xs text-[#797C90]">
              List of registered user accounts and their associated prediction volume.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#0D0B0B]">
              <thead className="bg-[#F1F0EF] border-b border-[#E4E2DC] text-xs uppercase tracking-wider text-[#797C90]">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">User ID</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Predictions Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F7F5] transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-[#797C90]">{u.id}</td>
                    <td className="px-6 py-3 font-medium text-[#0D0B0B]">{u.display_name}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === "admin"
                            ? "bg-[#3C5484] text-white"
                            : "bg-[#F1F0EF] text-[#484651]"
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-[#0D0B0B]">
                      {u.prediction_count} records
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Building2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { fetchUserPredictions, PredictionHistoryItem } from "@/lib/api-client";

export default function HistoryPage() {
  const { user, loginDemo } = useAuth();
  const [predictions, setPredictions] = useState<PredictionHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PredictionHistoryItem | null>(null);

  useEffect(() => {
    let token = user?.token;
    if (!token) {
      loginDemo("user");
      token = "test-token-user:11111111-1111-1111-1111-111111111111:user";
    }

    setLoading(true);
    fetchUserPredictions(token, page, limit)
      .then((res) => {
        setPredictions(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 text-xs font-medium mb-2">
              <History className="h-3.5 w-3.5" />
              <span>Isolated Record Store</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Valuation History</h1>
            <p className="text-slate-400 text-sm mt-1">
              Your historical property valuation requests and saved parameters.
            </p>
          </div>

          <Link
            href="/predict"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>New Valuation</span>
          </Link>
        </div>

        {/* History Table Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading history records...</div>
          ) : predictions.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No Predictions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t run any property estimates under this account yet.
              </p>
              <Link
                href="/predict"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
              >
                Estimate a Property Now
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/70 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Rooms</th>
                      <th className="py-3 px-4">Year Built</th>
                      <th className="py-3 px-4">Valuation</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {predictions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                          {item.created_at.slice(0, 16).replace("T", " ")}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.input_data.location}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{item.input_data.total_sqft} sqft</td>
                        <td className="py-3.5 px-4">
                          {item.input_data.bedrooms} Bed / {item.input_data.bathrooms} Bath
                        </td>
                        <td className="py-3.5 px-4">{item.input_data.year_built}</td>
                        <td className="py-3.5 px-4 font-bold text-white font-mono">
                          {item.currency === "INR" ? "₹" : "$"}
                          {item.predicted_price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:text-indigo-400 text-slate-400 transition-colors"
                            title="Inspect Parameters"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6 text-xs text-slate-400">
                <span>
                  Showing page {page} of {totalPages} ({total} total valuations)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 hover:bg-slate-800 text-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 hover:bg-slate-800 text-slate-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Snapshot Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Valuation Snapshot</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/40">
                <div className="text-xs text-indigo-300">Estimated Value</div>
                <div className="text-3xl font-extrabold text-white mt-0.5">
                  {selectedItem.currency === "INR" ? "₹" : "$"}
                  {selectedItem.predicted_price.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] font-mono text-indigo-400 mt-1">
                  Model Version: {selectedItem.model_version} • {selectedItem.created_at}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Property Details
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400">Location:</span>{" "}
                    <strong className="text-white">{selectedItem.input_data.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Area:</span>{" "}
                    <strong className="text-white">{selectedItem.input_data.total_sqft} sqft</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Bedrooms:</span>{" "}
                    <strong className="text-white">{selectedItem.input_data.bedrooms}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Bathrooms:</span>{" "}
                    <strong className="text-white">{selectedItem.input_data.bathrooms}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Year Built:</span>{" "}
                    <strong className="text-white">{selectedItem.input_data.year_built}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Garage:</span>{" "}
                    <strong className="text-white">
                      {selectedItem.input_data.has_garage ? "Available" : "None"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-300/90">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>Statistical estimate only. Not an appraisal or sale guarantee.</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

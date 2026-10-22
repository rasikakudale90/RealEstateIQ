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
  ArrowRight,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { fetchUserPredictions, PredictionHistoryItem } from "@/lib/api-client";
import { formatINR, formatDate } from "@/lib/formatters";

export default function HistoryPage() {
  const { user, loginDemo } = useAuth();
  const [predictions, setPredictions] = useState<PredictionHistoryItem[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
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
    <div className="min-h-screen bg-[#F1F0EF] text-[#0D0B0B] flex flex-col selection:bg-[#3C5484] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
              Isolated Record Store
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0D0B0B] tracking-tight">
              Valuation History
            </h1>
            <p className="text-[#797C90] text-sm mt-1">
              Your saved property valuation requests and calculated ML estimates.
            </p>
          </div>

          <Link
            href="/predict"
            className="self-start sm:self-auto btn-primary text-xs"
          >
            <span>New Valuation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* History Table Container */}
        <div className="editorial-card p-6 sm:p-8 bg-white shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-sm text-[#797C90]">
              <span className="h-5 w-5 border-2 border-[#3C5484] border-t-transparent rounded-full animate-spin inline-block mr-2" />
              Loading history records...
            </div>
          ) : predictions.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-[#F1F0EF] text-[#797C90] mx-auto flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#0D0B0B]">
                No predictions recorded yet
              </h3>
              <p className="text-sm text-[#797C90] max-w-sm mx-auto">
                Generate your first property valuation to have it permanently saved to your private record.
              </p>
              <div className="pt-2">
                <Link href="/predict" className="btn-primary text-xs">
                  <span>Start First Valuation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Table Search Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#797C90]" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search by zone, sqft, price, or ID..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-[#F1F0EF] border border-[#E4E2DC] text-[#0D0B0B] placeholder-[#797C90] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#797C90] hover:text-[#0D0B0B]"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-xs text-[#797C90] self-center sm:self-auto">
                  Showing{" "}
                  {
                    predictions.filter((p) => {
                      if (!filterQuery.trim()) return true;
                      const q = filterQuery.toLowerCase();
                      return (
                        p.id.toLowerCase().includes(q) ||
                        p.input_data.location.toLowerCase().includes(q) ||
                        p.input_data.total_sqft.toString().includes(q) ||
                        p.predicted_price.toString().includes(q)
                      );
                    }).length
                  }{" "}
                  of {total} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#0D0B0B]">
                  <thead className="bg-[#F1F0EF] border-b border-[#E4E2DC] text-xs uppercase tracking-wider text-[#797C90]">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Location Zone
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Area (sq ft)
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Bedrooms / Baths
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Estimated Value
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E2DC]">
                    {predictions
                      .filter((p) => {
                        if (!filterQuery.trim()) return true;
                        const q = filterQuery.toLowerCase();
                        return (
                          p.id.toLowerCase().includes(q) ||
                          p.input_data.location.toLowerCase().includes(q) ||
                          p.input_data.total_sqft.toString().includes(q) ||
                          p.predicted_price.toString().includes(q)
                        );
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-[#F8F7F5] transition-colors">
                          <td className="px-6 py-4 text-xs text-[#797C90]">
                            {formatDate(p.created_at)}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#0D0B0B]">
                          {p.input_data.location}
                        </td>
                        <td className="px-6 py-4 text-[#797C90]">
                          {p.input_data.total_sqft.toLocaleString()} sq ft
                        </td>
                        <td className="px-6 py-4 text-[#797C90]">
                          {p.input_data.bedrooms} BHK / {p.input_data.bathrooms} Baths
                        </td>
                        <td className="px-6 py-4 font-bold font-display text-base text-[#0D0B0B]">
                          {formatINR(p.predicted_price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedItem(p)}
                            className="px-3 py-1.5 rounded-full border border-[#D5D2CA] hover:border-[#3C5484] hover:bg-[#F1F0EF] text-xs font-medium text-[#0D0B0B] transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#3C5484]" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E4E2DC] text-xs text-[#797C90]">
                <span>
                  Showing {predictions.length} of {total} records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-lg border border-[#E4E2DC] hover:bg-[#F1F0EF] disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-medium text-[#0D0B0B]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-lg border border-[#E4E2DC] hover:bg-[#F1F0EF] disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="editorial-card bg-white max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-[#F1F0EF] text-[#797C90] hover:text-[#0D0B0B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#5F7091] tracking-wider uppercase">
                  Valuation Snapshot
                </span>
                <h3 className="font-display text-2xl font-bold text-[#0D0B0B]">
                  {formatINR(selectedItem.predicted_price)}
                </h3>
                <p className="text-xs text-[#797C90]">
                  Recorded on {formatDate(selectedItem.created_at)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F1F0EF]">
                  <span className="text-[#797C90] block">Location Zone</span>
                  <span className="font-semibold text-[#0D0B0B]">{selectedItem.input_data.location}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F0EF]">
                  <span className="text-[#797C90] block">Area</span>
                  <span className="font-semibold text-[#0D0B0B]">{selectedItem.input_data.total_sqft} sq ft</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F0EF]">
                  <span className="text-[#797C90] block">Bedrooms</span>
                  <span className="font-semibold text-[#0D0B0B]">{selectedItem.input_data.bedrooms} BHK</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F0EF]">
                  <span className="text-[#797C90] block">Bathrooms</span>
                  <span className="font-semibold text-[#0D0B0B]">{selectedItem.input_data.bathrooms}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F0EF]">
                  <span className="text-[#797C90] block">Year Built</span>
                  <span className="font-semibold text-[#0D0B0B]">{selectedItem.input_data.year_built}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F0EF]">
                  <span className="text-[#797C90] block">Garage</span>
                  <span className="font-semibold text-[#0D0B0B]">
                    {selectedItem.input_data.has_garage ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2.5 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white text-xs font-semibold transition-colors"
                >
                  Close Snapshot
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
